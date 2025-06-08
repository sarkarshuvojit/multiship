package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"

	"github.com/olahol/melody"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/dto"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/events"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/state"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/utils"
)

func SignupHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
	wt := utils.GetFromContextGeneric[*transport.WebsocketTransport](
		ctx, utils.WebsocketTransport,
	)
	s := utils.GetFromContextGeneric[*melody.Session](
		ctx, utils.Session,
	)
	db := utils.GetFromContextGeneric[state.State](
		ctx, utils.Redis,
	)
	var payload dto.SignupDto
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}
	slog.Debug("Handling signup", "req", payload)

	sessionID, found := s.Get("sessionID")
	if !found {
		return errors.New("Session not found, please reconnect")
	}

	signupVal := utils.QuickMarshal(map[string]string{
		"email": payload.Email,
	})
	db.Set(state.SignupKey(sessionID.(string)), signupVal)
	wt.SendResponse(
		ctx, events.SignedUp,
		map[string]any{
			"msg": "Signup successful",
		},
	)
	return nil
}
