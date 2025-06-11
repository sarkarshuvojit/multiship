package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"slices"

	"github.com/olahol/melody"
	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/dto"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
)

const (
	MAX_PLAYERS_PER_GAME = 3
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

	room, err := repo.CreateRoom(db, sessionID.(string))
	if err != nil {
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

func JoinRoomHandler(
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
	slog.Debug("Handling join room")

	var payload dto.JoinRoomDto
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}

	sessionID, found := s.Get("sessionID")
	if !found {
		return errors.New("Session not found, please reconnect")
	}
	if _, found := db.Get(state.SessionKey(sessionID.(string))); !found {
		return events.UnauthenticatedErr
	}

	room, err := repo.GetRoomByRoomCode(db, payload.RoomCode)
	if err != nil {
		return err
	}

	if len(room.PlayerSessions) >= MAX_PLAYERS_PER_GAME {
		return events.RoomFull
	}

	if slices.Contains(
		room.PlayerSessions,
		sessionID.(string),
	) {
		return events.RoomAlreadyJoined
	}

	room.PlayerSessions = append(room.PlayerSessions, sessionID.(string))
	if err := repo.UpdateRoom(db, room); err != nil {
		return err
	}

	res := &dto.ResponseDto[any]{
		Msg:     "Room joined successfully",
		Payload: map[string]string{},
	}
	ws.SendResponse(ctx, events.RoomJoined, res)
	return nil
}

var _ api.EventHandler = CreateRoomHandler
var _ api.EventHandler = JoinRoomHandler
