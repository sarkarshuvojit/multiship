package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"

	"github.com/olahol/melody"
	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/dto"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
)

func SignupHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
	ws := utils.FromContext[*api.WebsocketAPI](
		ctx, utils.WebsocketAPI,
	)
	s := utils.FromContext[*melody.Session](
		ctx, utils.Session,
	)
	db := utils.FromContext[state.State](
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
	db.Set(state.SessionKey(sessionID.(string)), signupVal)

	res := dto.ResponseDto[dto.SignupResDto]{
		Msg: "Signup Successful",
		Payload: dto.SignupResDto{
			SessionID: sessionID.(string),
		},
	}
	ws.SendResponse(ctx, events.SignedUp, res)
	return nil
}
