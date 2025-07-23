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

func isRoomReady(players map[string]game.PlayerState) bool {
	for _, player := range players {
		if player.Status != game.PlayerStatusBoardReady {
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

	db := utils.GetFromContextGeneric[state.State](
		ctx, utils.Redis,
	)

	room, err := repo.GetRoomByID(db, roomID)
	if err != nil {
		errCh <- events.RoomNotFound
	}

	if isRoomReady(room.Players) {
		room.Status = game.RoomStatusPlayersReady
	}

}

var _ Job = RecalculateRoomState
