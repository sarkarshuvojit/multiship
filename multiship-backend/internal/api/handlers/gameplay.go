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
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
)

func TryHitHandler(
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

	var payload dto.TryHitDto
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

	if !game.InBounds(payload.X, payload.Y) {
		return events.InvalidCoordinatesErr
	}

	room, err := repo.GetRoomByID(db, payload.RoomID)
	if err != nil {
		return err
	}

	if room.Status != game.RoomStatusOngoing {
		return events.GameNotOngoingErr
	}

	if !slices.Contains(room.PlayerSessions, sessionID.(string)) {
		return events.NotInRoomErr
	}

	if room.CurrentPlayer == "" {
		return events.TurnNotInitializedErr
	}

	if room.CurrentPlayer != sessionID.(string) {
		return events.NotPlayersTurnErr
	}

	if payload.TargetSessionID == sessionID.(string) {
		return events.InvalidTargetErr
	}

	targetPlayer, found := room.Players[payload.TargetSessionID]
	if !found {
		return events.InvalidTargetErr
	}
	if targetPlayer.Eliminated {
		return events.TargetEliminatedErr
	}

	if len(targetPlayer.Board) == 0 {
		targetPlayer.Board = game.NewBoard()
	}

	if game.GetCell(targetPlayer.Board, payload.X, payload.Y) != game.CellStateHidden {
		return events.CellAlreadyHitErr
	}

	ship, isHit := game.IsShipAt(targetPlayer.Ships, payload.X, payload.Y)
	resultState := game.CellStateMiss
	if isHit {
		resultState = game.CellStateHit
	}

	game.SetCell(targetPlayer.Board, payload.X, payload.Y, resultState)
	room.Players[payload.TargetSessionID] = targetPlayer

	shipSunk := false
	if isHit && game.IsShipSunk(ship, targetPlayer.Board) {
		shipSunk = true
	}

	if shipSunk {
		ws.SendToAll(ctx, events.ShipSunk, dto.ShipSunkPayload{
			RoomID:          room.RoomID,
			TargetSessionID: payload.TargetSessionID,
			Ship:            ship,
		})
	}

	if game.AreAllShipsSunk(targetPlayer.Ships, targetPlayer.Board) {
		targetPlayer.Eliminated = true
		room.Players[payload.TargetSessionID] = targetPlayer
		ws.SendToAll(ctx, events.PlayerEliminated, dto.PlayerEliminatedPayload{
			RoomID:    room.RoomID,
			SessionID: payload.TargetSessionID,
		})
	}

	activePlayers := 0
	winnerID := ""
	for _, id := range room.PlayerSessions {
		player, ok := room.Players[id]
		if !ok {
			continue
		}
		if !player.Eliminated {
			activePlayers++
			winnerID = id
		}
	}

	gameOver := activePlayers <= 1
	if gameOver {
		room.CurrentPlayer = ""
	} else {
		nextPlayer, ok := game.NextActivePlayer(room.CurrentPlayer, room.PlayerSessions, room.Players)
		if !ok {
			return events.TurnNotInitializedErr
		}
		room.CurrentPlayer = nextPlayer
	}

	if err := repo.UpdateRoom(db, room); err != nil {
		return err
	}

	ws.SendToAll(ctx, events.HitSuccessful, dto.HitAttemptedPayload{
		RoomID:            room.RoomID,
		AttackerSessionID: sessionID.(string),
		TargetSessionID:   payload.TargetSessionID,
		X:                 payload.X,
		Y:                 payload.Y,
		Result:            resultState,
	})
	ws.SendToAll(ctx, events.BoardUpdated, dto.BoardUpdatedPayload{
		RoomID:          room.RoomID,
		TargetSessionID: payload.TargetSessionID,
		X:               payload.X,
		Y:               payload.Y,
		State:           resultState,
	})

	if gameOver {
		ws.SendToAll(ctx, events.GameOver, dto.GameOverPayload{
			RoomID:   room.RoomID,
			WinnerID: winnerID,
		})
		return nil
	}

	ws.SendToAll(ctx, events.NextTurn, dto.NextTurnPayload{
		RoomID:          room.RoomID,
		CurrentPlayerID: room.CurrentPlayer,
	})

	slog.Info("Hit attempted", "roomID", room.RoomID, "attacker", sessionID, "target", payload.TargetSessionID, "result", resultState)
	return nil
}

var _ api.EventHandler = TryHitHandler
