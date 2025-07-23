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

	if len(room.Players) < 3 {
		slog.Debug("Too less players", "count", len(room.Players))
		errCh <- nil
		return
	}

	room.Status = game.RoomStatusBoardSelection
	if err := repo.UpdateRoom(db, room); err != nil {
		errCh <- err
		return
	}
	slog.Info("Updated room status", "newStatus", room.Status)

	// If all players have submitted their boards
	// room is now in Players ready
	// And the turn based logic can begin
	if matchAllPlayerState(room.Players, game.PlayerStatusBoardReady) {
		room.Status = game.RoomStatusPlayersReady
		if err := repo.UpdateRoom(db, room); err != nil {
			errCh <- err
			return
		}
		slog.Info("Updated room status", "newStatus", room.Status)
	}

}

var _ Job = RecalculateRoomState
