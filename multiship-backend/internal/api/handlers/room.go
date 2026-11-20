package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"slices"

	"github.com/olahol/melody"
	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/dto"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/jobs"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/roomlock"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
)

const (
	MAX_PLAYERS_PER_GAME = game.MaxPlayers
)

// authenticatedSession resolves the caller's session ID and makes sure they signed up.
func authenticatedSession(ctx context.Context) (string, error) {
	s := utils.FromContext[*melody.Session](ctx, utils.Session)
	db := utils.FromContext[state.State](ctx, utils.Redis)

	sessionID, found := s.Get("sessionID")
	if !found {
		return "", errors.New("Session not found, please reconnect")
	}
	if _, found := db.Get(state.SessionKey(sessionID.(string))); !found {
		return "", events.UnauthenticatedErr
	}
	return sessionID.(string), nil
}

func newPlayerFromProfile(db state.State, sessionID string) game.PlayerState {
	player := *game.NewPlayer(sessionID)
	if profile, ok := repo.GetProfile(db, sessionID); ok {
		player.Name = profile.Name
		player.Avatar = profile.Avatar
	}
	return player
}

func recomputeRoom(ctx context.Context, roomID string) error {
	errCh := jobs.DispatchJob(ctx, events.JobEvent{
		EventType: events.RecomputeRoomState,
		Payload: &jobs.RecalculateRoomEventPayload{
			RoomID: roomID,
		},
	})
	return <-errCh
}

func CreateRoomHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
	ws := utils.FromContext[*api.WebsocketAPI](ctx, utils.WebsocketAPI)
	db := utils.FromContext[state.State](ctx, utils.Redis)
	slog.Debug("Handling create room")

	sessionID, err := authenticatedSession(ctx)
	if err != nil {
		return err
	}

	// A player can only be in one room at a time.
	leaveCurrentRoom(ctx, sessionID)

	room, err := repo.CreateRoom(db, sessionID)
	if err != nil {
		return events.RoomCreationFailedErr
	}
	room.Status = game.RoomStatusWaiting
	room.Players[sessionID] = newPlayerFromProfile(db, sessionID)
	if err := repo.UpdateRoom(db, room); err != nil {
		return err
	}
	_ = repo.SetSessionRoom(db, sessionID, room.RoomID)

	res := &dto.ResponseDto[dto.RoomCreatedPayload]{
		Msg: "Room created successfully",
		Payload: dto.RoomCreatedPayload{
			RoomID:   room.RoomID,
			RoomCode: room.Code,
		},
	}

	slog.Info("Room created")
	ws.SendResponse(ctx, events.RoomCreated, res)
	ws.BroadcastRoomState(room)
	return nil
}

func JoinRoomHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
	ws := utils.FromContext[*api.WebsocketAPI](ctx, utils.WebsocketAPI)
	db := utils.FromContext[state.State](ctx, utils.Redis)
	slog.Debug("Handling join room")

	var payload dto.JoinRoomDto
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}

	sessionID, err := authenticatedSession(ctx)
	if err != nil {
		return err
	}

	room, err := repo.GetRoomByRoomCode(db, payload.RoomCode)
	if err != nil {
		return err
	}

	if slices.Contains(room.PlayerSessions, sessionID) {
		return events.RoomAlreadyJoinedErr
	}

	leaveCurrentRoom(ctx, sessionID)

	unlock := roomlock.Lock(room.RoomID)
	room, err = repo.GetRoomByID(db, room.RoomID)
	if err != nil {
		unlock()
		return err
	}
	if room.Status != game.RoomStatusIdle && room.Status != game.RoomStatusWaiting {
		unlock()
		return events.RoomNotJoinableErr
	}
	if len(room.PlayerSessions) >= MAX_PLAYERS_PER_GAME {
		unlock()
		return events.RoomFull
	}

	room.PlayerSessions = append(room.PlayerSessions, sessionID)
	room.Players[sessionID] = newPlayerFromProfile(db, sessionID)
	err = repo.UpdateRoom(db, room)
	unlock()
	if err != nil {
		return err
	}
	_ = repo.SetSessionRoom(db, sessionID, room.RoomID)

	res := &dto.ResponseDto[any]{
		Msg: "Room joined successfully",
		Payload: map[string]string{
			"roomId":   room.RoomID,
			"roomCode": room.Code,
		},
	}
	slog.Info("Room joined")
	ws.SendResponse(ctx, events.RoomJoined, res)
	ws.BroadcastRoomState(room)

	return recomputeRoom(ctx, room.RoomID)
}

func SubmitBoardHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
	ws := utils.FromContext[*api.WebsocketAPI](ctx, utils.WebsocketAPI)
	db := utils.FromContext[state.State](ctx, utils.Redis)
	slog.Debug("Handling submit board")

	var payload dto.SubmitBoardDto
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}

	sessionID, err := authenticatedSession(ctx)
	if err != nil {
		return err
	}

	if !game.ValidateBoard(payload.Ships) {
		return events.InvalidShipConfigErr
	}

	unlock := roomlock.Lock(payload.RoomID)
	room, err := repo.GetRoomByID(db, payload.RoomID)
	if err != nil {
		unlock()
		return err
	}

	if !slices.Contains(room.PlayerSessions, sessionID) {
		unlock()
		return events.NotInRoomErr
	}

	if room.Status == game.RoomStatusOngoing || room.Status == game.RoomStatusFinished {
		unlock()
		return events.BoardLockedErr
	}

	player := room.Players[sessionID]
	player.Ships = payload.Ships
	player.Status = game.PlayerStatusBoardReady
	player.Board = game.NewBoard()
	room.Players[sessionID] = player

	err = repo.UpdateRoom(db, room)
	unlock()
	if err != nil {
		return err
	}

	res := &dto.ResponseDto[any]{
		Msg:     "Board Sumitted Successfully",
		Payload: map[string]string{},
	}
	slog.Info("Board submitted")
	ws.SendResponse(ctx, events.BoardSubmitted, res)
	ws.BroadcastRoomState(room)

	// Recalculate asynchronously; it may start the game.
	go func() {
		if err := recomputeRoom(ctx, room.RoomID); err != nil {
			slog.Error("Failed to recalculate room state after board submission", "error", err, "roomID", room.RoomID)
		}
	}()

	return nil
}

// StartGameHandler lets the host move a room with fewer than MaxPlayers into
// board selection. Full rooms move there automatically.
func StartGameHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
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
		return events.NotRoomHostErr
	}
	if room.Status != game.RoomStatusIdle && room.Status != game.RoomStatusWaiting {
		unlock()
		return events.RoomNotJoinableErr
	}
	if len(room.PlayerSessions) < game.MinPlayers {
		unlock()
		return events.NotEnoughPlayersErr
	}

	room.Status = game.RoomStatusBoardSelection
	err = repo.UpdateRoom(db, room)
	unlock()
	if err != nil {
		return err
	}
	ws.BroadcastRoomState(room)
	return recomputeRoom(ctx, room.RoomID)
}

func LeaveRoomHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
	ws := utils.FromContext[*api.WebsocketAPI](ctx, utils.WebsocketAPI)

	sessionID, err := authenticatedSession(ctx)
	if err != nil {
		return err
	}
	leaveCurrentRoom(ctx, sessionID)
	ws.SendResponse(ctx, events.RoomLeft, &dto.ResponseDto[any]{
		Msg:     "Left room",
		Payload: map[string]string{},
	})
	return nil
}

// RematchHandler resets a finished room so everyone still in it can play again.
// Players who already left the finished game are dropped from the room.
func RematchHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
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
	if !slices.Contains(room.PlayerSessions, sessionID) {
		unlock()
		return events.NotInRoomErr
	}
	if room.Status != game.RoomStatusFinished {
		unlock()
		return events.GameNotFinishedErr
	}

	// The caller is always in; others only if they are still attached to this room.
	_ = repo.SetSessionRoom(db, sessionID, room.RoomID)
	kept := []string{}
	players := map[string]game.PlayerState{}
	for _, id := range room.PlayerSessions {
		if current, ok := repo.GetSessionRoom(db, id); !ok || current != room.RoomID {
			continue
		}
		old := room.Players[id]
		fresh := *game.NewPlayer(id)
		fresh.Name, fresh.Avatar = old.Name, old.Avatar
		players[id] = fresh
		kept = append(kept, id)
	}
	room.PlayerSessions = kept
	room.Players = players
	room.Status = game.RoomStatusWaiting
	room.CurrentPlayer = ""
	room.WinnerID = ""
	if !slices.Contains(kept, room.LeaderSessionID) {
		room.LeaderSessionID = sessionID
	}
	err = repo.UpdateRoom(db, room)
	unlock()
	if err != nil {
		return err
	}

	ws.BroadcastRoomState(room)
	return recomputeRoom(ctx, room.RoomID)
}

// DisconnectHook removes a disconnected player from their room.
func DisconnectHook(ctx context.Context) {
	s := utils.FromContext[*melody.Session](ctx, utils.Session)
	sessionID, found := s.Get("sessionID")
	if !found {
		return
	}
	leaveCurrentRoom(ctx, sessionID.(string))
}

// leaveCurrentRoom takes a player out of whatever room they are in.
// Before the battle starts they are removed outright; mid-battle they forfeit
// (eliminated) so the board stays visible, and the turn/winner is resolved.
func leaveCurrentRoom(ctx context.Context, sessionID string) {
	ws := utils.FromContext[*api.WebsocketAPI](ctx, utils.WebsocketAPI)
	db := utils.FromContext[state.State](ctx, utils.Redis)

	roomID, found := repo.GetSessionRoom(db, sessionID)
	if !found {
		return
	}
	_ = repo.ClearSessionRoom(db, sessionID)

	unlock := roomlock.Lock(roomID)
	room, err := repo.GetRoomByID(db, roomID)
	if err != nil || !slices.Contains(room.PlayerSessions, sessionID) {
		unlock()
		return
	}

	switch room.Status {
	case game.RoomStatusFinished:
		unlock()
		return

	case game.RoomStatusOngoing:
		player := room.Players[sessionID]
		player.Eliminated = true
		room.Players[sessionID] = player
		wasTurn := room.CurrentPlayer == sessionID
		gameOver := false
		if wasTurn {
			gameOver = game.ResolveTurn(room)
		} else {
			// Not their turn: only check whether a single survivor remains.
			current := room.CurrentPlayer
			gameOver = game.ResolveTurn(room)
			if !gameOver {
				room.CurrentPlayer = current
			}
		}
		if err := repo.UpdateRoom(db, room); err != nil {
			unlock()
			return
		}
		unlock()

		ws.SendToRoom(room, events.PlayerEliminated, dto.PlayerEliminatedPayload{
			RoomID:    room.RoomID,
			SessionID: sessionID,
		})
		if gameOver {
			ws.SendToRoom(room, events.GameOver, dto.GameOverPayload{
				RoomID:   room.RoomID,
				WinnerID: room.WinnerID,
			})
		} else if wasTurn {
			ws.SendToRoom(room, events.NextTurn, dto.NextTurnPayload{
				RoomID:          room.RoomID,
				CurrentPlayerID: room.CurrentPlayer,
			})
		}
		ws.BroadcastRoomState(room)
		return

	default:
		room.PlayerSessions = slices.DeleteFunc(room.PlayerSessions, func(id string) bool {
			return id == sessionID
		})
		delete(room.Players, sessionID)
		if room.LeaderSessionID == sessionID && len(room.PlayerSessions) > 0 {
			room.LeaderSessionID = room.PlayerSessions[0]
		}
		if room.Status == game.RoomStatusBoardSelection && len(room.PlayerSessions) < game.MinPlayers {
			room.Status = game.RoomStatusWaiting
		}
		err := repo.UpdateRoom(db, room)
		unlock()
		if err != nil {
			return
		}
		ws.BroadcastRoomState(room)
		if len(room.PlayerSessions) > 0 {
			// Remaining players may all be ready now.
			_ = recomputeRoom(ctx, room.RoomID)
		}
	}
}

var _ api.EventHandler = CreateRoomHandler
var _ api.EventHandler = JoinRoomHandler
var _ api.EventHandler = SubmitBoardHandler
var _ api.EventHandler = StartGameHandler
var _ api.EventHandler = LeaveRoomHandler
var _ api.EventHandler = RematchHandler
