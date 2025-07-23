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
	"github.com/sarkarshuvojit/multiship-backend/internal/api/jobs"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
)

const (
	MAX_PLAYERS_PER_GAME = 3
)

func CreateRoomHandler(
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

	slog.Info("Room created")
	ws.SendResponse(ctx, events.RoomCreated, res)
	return nil
}

func JoinRoomHandler(
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
	slog.Debug("Handling join room")

	var payload dto.JoinRoomDto
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}

	_sessionID, found := s.Get("sessionID")
	sessionID := _sessionID.(string)
	if !found {
		return errors.New("Session not found, please reconnect")
	}
	if _, found := db.Get(state.SessionKey(sessionID)); !found {
		return events.UnauthenticatedErr
	}

	room, err := repo.GetRoomByRoomCode(db, payload.RoomCode)
	if err != nil {
		return err
	}

	if slices.Contains(
		room.PlayerSessions,
		sessionID,
	) {
		return events.RoomAlreadyJoinedErr
	}

	if len(room.PlayerSessions) >= MAX_PLAYERS_PER_GAME {
		return events.RoomFull
	}

	room.PlayerSessions = append(room.PlayerSessions, sessionID)
	room.Players[sessionID] = game.PlayerState{
		SessionID: sessionID,
		Status:    game.PlayerStatusJoined,
		Board:     [][]game.CellState{},
		Ships:     []game.ShipState{},
	}
	if err := repo.UpdateRoom(db, room); err != nil {
		return err
	}

	res := &dto.ResponseDto[any]{
		Msg: "Room joined successfully",
		Payload: map[string]string{
			"roomId": room.RoomID,
		},
	}
	slog.Info("Room joined")
	ws.SendResponse(ctx, events.RoomJoined, res)

	// Ignore error channel
	errCh := jobs.DispatchJob(ctx, events.JobEvent{
		EventType: events.RecomputeRoomState,
		Payload: &jobs.RecalculateRoomEventPayload{
			RoomID: room.RoomID,
		},
	})

	return <-errCh
}

func SubmitBoardHandler(
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
	slog.Debug("Handling submit board")

	var payload dto.SubmitBoardDto
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

	if !game.ValidateBoard(payload.Ships) {
		return events.InvalidShipConfigErr
	}

	room, err := repo.GetRoomByID(db, payload.RoomID)
	if err != nil {
		return err
	}

	if !slices.Contains(
		room.PlayerSessions,
		sessionID.(string),
	) {
		return events.NotInRoomErr
	}

	player := room.Players[sessionID.(string)]
	player.Ships = payload.Ships
	player.Status = game.PlayerStatusBoardReady
	room.Players[sessionID.(string)] = player

	// TODO: check if all players have submitted or not; if yes update game state
	// Possibly create an async job queue

	if err := repo.UpdateRoom(db, room); err != nil {
		return err
	}

	res := &dto.ResponseDto[any]{
		Msg:     "Board Sumitted Successfully",
		Payload: map[string]string{},
	}
	slog.Info("Board submitted joined")
	ws.SendResponse(ctx, events.RoomJoined, res)
	return nil
}

var _ api.EventHandler = CreateRoomHandler
var _ api.EventHandler = JoinRoomHandler
var _ api.EventHandler = SubmitBoardHandler
