package jobs

import (
	"context"
	"log/slog"

	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/roomlock"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
)

type RecalculateRoomEventPayload struct {
	RoomID string
}

func matchAllPlayerState(
	players map[string]game.PlayerState,
	targetPlayerStatus game.PlayerStatus,
) bool {
	for _, player := range players {
		if player.Status != targetPlayerStatus {
			slog.Debug("Status Mismatch",
				"curPlayerStatus", player.Status,
				"targetStatus", targetPlayerStatus,
			)
			return false
		}
	}
	return true
}

func getRoomStatusFromPlayerState(
	players map[string]game.PlayerState,
) (newRoomState game.RoomStatus, shouldUpdate bool) {
	return nextRoomStatus(game.RoomStatusWaiting, players)
}

// nextRoomStatus derives the room status from its current status and players.
//   - A full room (or one the host started) is in board selection.
//   - Once every player in board selection has a ready board, battle begins.
//   - Ongoing and finished rooms are never changed here.
func nextRoomStatus(
	current game.RoomStatus,
	players map[string]game.PlayerState,
) (game.RoomStatus, bool) {
	switch current {
	case game.RoomStatusOngoing, game.RoomStatusFinished:
		return current, false
	}

	inBoardSelection := current == game.RoomStatusBoardSelection ||
		len(players) >= game.MaxPlayers
	if !inBoardSelection {
		return game.RoomStatusWaiting, false
	}

	if len(players) >= game.MinPlayers &&
		matchAllPlayerState(players, game.PlayerStatusBoardReady) {
		return game.RoomStatusOngoing, true
	}
	return game.RoomStatusBoardSelection, true
}

func RecalculateRoomState(
	ctx context.Context,
	e events.JobEvent,
	errCh ErrorChannel,
) {
	payload := (e.Payload).(*RecalculateRoomEventPayload)
	slog.Debug("Recalculating room state for", "payload", payload)

	roomID := payload.RoomID

	db := utils.FromContext[state.State](
		ctx, utils.Redis,
	)

	unlock := roomlock.Lock(roomID)
	room, err := repo.GetRoomByID(db, roomID)
	if err != nil {
		unlock()
		errCh <- events.RoomNotFound
		return
	}

	newStatus, shouldUpdate := nextRoomStatus(room.Status, room.Players)
	if !shouldUpdate || newStatus == room.Status {
		unlock()
		slog.Debug("Room status unchanged", "status", room.Status, "count", len(room.Players))
		errCh <- nil
		return
	}

	room.Status = newStatus
	if newStatus == game.RoomStatusOngoing && room.CurrentPlayer == "" {
		if nextPlayer, ok := game.NextActivePlayer("", room.PlayerSessions, room.Players); ok {
			room.CurrentPlayer = nextPlayer
		}
	}
	err = repo.UpdateRoom(db, room)
	unlock()
	if err != nil {
		errCh <- err
		return
	}

	slog.Info("Updated room status", "newStatus", room.Status)
	if wsVal := ctx.Value(utils.WebsocketAPI); wsVal != nil {
		ws := wsVal.(*api.WebsocketAPI)
		ws.BroadcastRoomState(room)
		if room.Status == game.RoomStatusOngoing && room.CurrentPlayer != "" {
			ws.SendToRoom(room, events.NextTurn, map[string]any{
				"roomId":          room.RoomID,
				"currentPlayerId": room.CurrentPlayer,
			})
		}
	}
	errCh <- nil

}

var _ Job = RecalculateRoomState
