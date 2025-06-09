package handlers

import (
	"context"
	"errors"
	"log/slog"

	"github.com/google/uuid"
	"github.com/olahol/melody"
	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
)

func CreateRoomHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
	wt := utils.GetFromContextGeneric[*api.WebsocketTransport](
		ctx, utils.WebsocketAPI,
	)
	s := utils.GetFromContextGeneric[*melody.Session](
		ctx, utils.Session,
	)
	db := utils.GetFromContextGeneric[state.State](
		ctx, utils.Redis,
	)
	slog.Debug("Handling create room")

	sessionID, found := s.Get("sessionID")
	if !found {
		return errors.New("Session not found, please reconnect")
	}
	if _, found := db.Get(state.SignupKey(sessionID.(string))); !found {
		return events.UnauthenticatedErr
	}

	wt.SendResponse(
		ctx, events.RoomCreated,
		map[string]any{
			"msg": "Game Created successful",
			"payload": map[string]any{
				"gameId":    uuid.New().String(),
				"sessionId": sessionID,
			},
		},
	)
	return nil
}

var _ api.EventHandler = CreateRoomHandler
