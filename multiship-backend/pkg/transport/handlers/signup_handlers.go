package handlers

import (
	"context"
	"encoding/json"
	"log/slog"

	"github.com/sarkarshuvojit/multiship-backend/pkg/transport"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/dto"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/events"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/utils"
)

func SignupHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
	wt := utils.GetFromContextGeneric[*transport.WebsocketTransport](
		ctx, utils.WebsocketTransport,
	)
	var payload dto.SignupDto
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}
	slog.Debug("Handling signup", "req", payload)
	wt.SendResponse(
		ctx, events.SignedUp,
		map[string]any{
			"msg": "Signup successful",
		},
	)
	return nil
}
