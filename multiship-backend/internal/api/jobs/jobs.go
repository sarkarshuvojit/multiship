package jobs

import (
	"context"
	"log/slog"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
)

type ErrorChannel chan error

type Job func(context.Context, events.JobEvent, ErrorChannel)

type RecalculateRoomEventPayload struct {
	roomID string
}

func DispatchJob(ctx context.Context, e events.JobEvent) ErrorChannel {
	var errCh ErrorChannel = make(chan error)
	switch e.EventType {
	case events.RecomputeRoomState:
		go RecalculateRoomState(ctx, e, errCh)
	default:
		slog.Debug("Unknown job", "job", e.EventType)
		go func(ec ErrorChannel) {
			errCh <- events.UnknownJobErr
		}(errCh)
	}

	return errCh
}
