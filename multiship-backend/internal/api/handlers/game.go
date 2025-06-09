package handlers

import (
	"context"
	"errors"
	"log/slog"

	"github.com/olahol/melody"
	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/dto"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
)

func CreateRoomHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
	ws := utils.GetFromContextGeneric[*api.WebsocketAPI](
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
	if _, found := db.Get(state.SessionKey(sessionID.(string))); !found {
		return events.UnauthenticatedErr
	}

	room := dto.NewRoom(sessionID.(string))
	if err := db.Set(
		state.RoomKey(room.RoomID),
		utils.QuickMarshal(room),
	); err != nil {
		return events.RoomCreationFailedErr
	}

	res := &dto.ResponseDto[dto.RoomCreatedPayload]{
		Msg: "Room created successfully",
		Payload: dto.RoomCreatedPayload{
			RoomID:   room.RoomID,
			RoomCode: room.Code,
		},
	}

	ws.SendResponse(ctx, events.RoomCreated, res)
	return nil
}

var _ api.EventHandler = CreateRoomHandler
