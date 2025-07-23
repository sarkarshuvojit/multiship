package jobs

import (
	"context"
	"log/slog"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
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

func GetRoomStatusFromPlayerState(
	players map[string]game.PlayerState,
) (newRoomState game.RoomStatus, shouldUpdate bool) {
	if len(players) < 3 {
		return game.RoomStatusWaiting, false
	}

	// If we have enough players, room should be in board selection
	newRoomState = game.RoomStatusBoardSelection
	shouldUpdate = true

	// If all players have submitted their boards, room is ready for gameplay
	if matchAllPlayerState(players, game.PlayerStatusBoardReady) {
		newRoomState = game.RoomStatusPlayersReady
	}

	return newRoomState, shouldUpdate
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

	room, err := repo.GetRoomByID(db, roomID)
	if err != nil {
		errCh <- events.RoomNotFound
		return
	}

	newStatus, shouldUpdate := GetRoomStatusFromPlayerState(room.Players)
	
	if !shouldUpdate {
		slog.Debug("Too less players", "count", len(room.Players))
		errCh <- nil
		return
	}

	room.Status = newStatus
	if err := repo.UpdateRoom(db, room); err != nil {
		errCh <- err
		return
	}
	slog.Info("Updated room status", "newStatus", room.Status)

}

var _ Job = RecalculateRoomState
