package handlers

import (
	"context"
	"encoding/json"
	"log/slog"
	"math/rand"
	"slices"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/dto"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/roomlock"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
)

// BotThinkTime is how long a bot "aims" before firing, so its shots read
// like a turn rather than an instant reply. Tests may shorten it.
var BotThinkTime = 900 * time.Millisecond

// newBot builds a bot player with a ready fleet and the first free bot name.
func newBot(room *game.RoomState) game.PlayerState {
	id, _ := uuid.NewRandom()
	bot := *game.NewPlayer("bot-" + id.String())
	bot.IsBot = true
	bot.Avatar = game.BotAvatar
	bot.Name = game.BotNames[0]
	for _, name := range game.BotNames {
		taken := false
		for _, p := range room.Players {
			taken = taken || p.Name == name
		}
		if !taken {
			bot.Name = name
			break
		}
	}
	resetBotFleet(&bot)
	return bot
}

// resetBotFleet gives a bot a fresh layout and marks its board ready.
func resetBotFleet(bot *game.PlayerState) {
	bot.Ships = game.PlaceBotFleet(rand.New(rand.NewSource(time.Now().UnixNano())))
	bot.Board = game.NewBoard()
	bot.Status = game.PlayerStatusBoardReady
}

func hasHuman(room *game.RoomState) bool {
	for _, id := range room.PlayerSessions {
		if p, ok := room.Players[id]; ok && !p.IsBot {
			return true
		}
	}
	return false
}

// AddBotHandler lets the host fill an open seat with a bot while waiting.
func AddBotHandler(ctx context.Context, event events.InboundEvent) error {
	ws := utils.FromContext[*api.WebsocketAPI](ctx, utils.WebsocketAPI)
	db := utils.FromContext[state.State](ctx, utils.Redis)

	var payload dto.RoomIDDto
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}
	sessionID, err := authenticatedSession(ctx)
	if err != nil {
		return err
	}

	unlock := roomlock.Lock(payload.RoomID)
	room, err := repo.GetRoomByID(db, payload.RoomID)
	if err != nil {
		unlock()
		return err
	}
	if room.LeaderSessionID != sessionID {
		unlock()
		return events.HostOnlyErr
	}
	if room.Status != game.RoomStatusIdle && room.Status != game.RoomStatusWaiting {
		unlock()
		return events.RoomNotJoinableErr
	}
	if len(room.PlayerSessions) >= game.MaxPlayers {
		unlock()
		return events.RoomFull
	}

	bot := newBot(room)
	room.PlayerSessions = append(room.PlayerSessions, bot.SessionID)
	room.Players[bot.SessionID] = bot
	err = repo.UpdateRoom(db, room)
	unlock()
	if err != nil {
		return err
	}

	slog.Info("Bot added", "roomID", room.RoomID, "bot", bot.Name)
	ws.BroadcastRoomState(room)
	return recomputeRoom(ctx, room.RoomID)
}

// RemoveBotHandler lets the host take a bot back out of the lobby.
func RemoveBotHandler(ctx context.Context, event events.InboundEvent) error {
	ws := utils.FromContext[*api.WebsocketAPI](ctx, utils.WebsocketAPI)
	db := utils.FromContext[state.State](ctx, utils.Redis)

	var payload dto.RemoveBotDto
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}
	sessionID, err := authenticatedSession(ctx)
	if err != nil {
		return err
	}

	unlock := roomlock.Lock(payload.RoomID)
	defer unlock()
	room, err := repo.GetRoomByID(db, payload.RoomID)
	if err != nil {
		return err
	}
	if room.LeaderSessionID != sessionID {
		return events.HostOnlyErr
	}
	if room.Status != game.RoomStatusIdle && room.Status != game.RoomStatusWaiting {
		return events.RoomNotJoinableErr
	}
	if bot, ok := room.Players[payload.BotID]; !ok || !bot.IsBot {
		return events.NotABotErr
	}

	room.PlayerSessions = slices.DeleteFunc(room.PlayerSessions, func(id string) bool {
		return id == payload.BotID
	})
	delete(room.Players, payload.BotID)
	if err := repo.UpdateRoom(db, room); err != nil {
		return err
	}
	ws.BroadcastRoomState(room)
	return nil
}

// BotTurnHook watches room broadcasts and, when a bot is up, schedules its
// shot after BotThinkTime. Duplicate broadcasts for the same turn are ignored.
func BotTurnHook(ws *api.WebsocketAPI) func(*game.RoomState) {
	var mu sync.Mutex
	pending := map[string]bool{}

	return func(room *game.RoomState) {
		if room.Status != game.RoomStatusOngoing {
			return
		}
		botID := room.CurrentPlayer
		if p, ok := room.Players[botID]; !ok || !p.IsBot {
			return
		}
		key := room.RoomID + "/" + botID
		mu.Lock()
		if pending[key] {
			mu.Unlock()
			return
		}
		pending[key] = true
		mu.Unlock()

		roomID := room.RoomID
		time.AfterFunc(BotThinkTime, func() {
			mu.Lock()
			delete(pending, key)
			mu.Unlock()
			botTakeTurn(ws.BackgroundContext(), roomID, botID)
		})
	}
}

func botTakeTurn(ctx context.Context, roomID, botID string) {
	db := utils.FromContext[state.State](ctx, utils.Redis)
	room, err := repo.GetRoomByID(db, roomID)
	if err != nil || room.Status != game.RoomStatusOngoing || room.CurrentPlayer != botID {
		return
	}
	// Nobody left watching: let the room go quiet instead of bots playing on.
	watched := false
	for _, id := range room.PlayerSessions {
		if p := room.Players[id]; !p.IsBot {
			if current, ok := repo.GetSessionRoom(db, id); ok && current == roomID {
				watched = true
				break
			}
		}
	}
	if !watched {
		return
	}

	shot, ok := game.ChooseBotShot(room, botID)
	if !ok {
		return
	}
	if err := fireShot(ctx, roomID, botID, shot.TargetID, shot.X, shot.Y); err != nil {
		slog.Error("Bot shot failed", "roomID", roomID, "bot", botID, "err", err)
	}
}

var _ api.EventHandler = AddBotHandler
var _ api.EventHandler = RemoveBotHandler
