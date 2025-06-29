package jobs

import (
	"context"
	"log/slog"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
)

func RecalculateRoomState(
	ctx context.Context,
	e events.JobEvent,
	errCh ErrorChannel,
) {
	payload := (e.Payload).(*RecalculateRoomEventPayload)
	slog.Debug("Recalculating room state for", "payload", payload)
}

var _ Job = RecalculateRoomState
