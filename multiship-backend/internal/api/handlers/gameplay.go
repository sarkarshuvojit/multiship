package handlers

import (
	"context"
	"encoding/json"
	"log/slog"
	"slices"

	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/dto"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/roomlock"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
)

func TryHitHandler(
	ctx context.Context,
	event events.InboundEvent,
) error {
	var payload dto.TryHitDto
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}

	sessionID, err := authenticatedSession(ctx)
	if err != nil {
		return err
	}

	return fireShot(ctx, payload.RoomID, sessionID, payload.TargetSessionID, payload.X, payload.Y)
}

// fireShot validates and applies one shot, then tells the room what happened.
// Shared by human players and bots.
func fireShot(
	ctx context.Context,
	roomID, attackerID, targetID string,
	x, y int,
) error {
	ws := utils.FromContext[*api.WebsocketAPI](ctx, utils.WebsocketAPI)
	db := utils.FromContext[state.State](ctx, utils.Redis)
	payload := dto.TryHitDto{RoomID: roomID, TargetSessionID: targetID, X: x, Y: y}

	if !game.InBounds(payload.X, payload.Y) {
		return events.InvalidCoordinatesErr
	}

	unlock := roomlock.Lock(payload.RoomID)
	defer unlock()

	room, err := repo.GetRoomByID(db, payload.RoomID)
	if err != nil {
		return err
	}

	if room.Status != game.RoomStatusOngoing {
		return events.GameNotOngoingErr
	}

	if !slices.Contains(room.PlayerSessions, attackerID) {
		return events.NotInRoomErr
	}

	if room.CurrentPlayer == "" {
		return events.TurnNotInitializedErr
	}

	if room.CurrentPlayer != attackerID {
		return events.NotPlayersTurnErr
	}

	if payload.TargetSessionID == attackerID {
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

	shipSunk := isHit && game.IsShipSunk(ship, targetPlayer.Board)
	eliminated := game.AreAllShipsSunk(targetPlayer.Ships, targetPlayer.Board)
	if eliminated {
		targetPlayer.Eliminated = true
	}
	room.Players[payload.TargetSessionID] = targetPlayer

	gameOver := game.ResolveTurn(room)

	if err := repo.UpdateRoom(db, room); err != nil {
		return err
	}

	ws.SendToRoom(room, events.HitSuccessful, dto.HitAttemptedPayload{
		RoomID:            room.RoomID,
		AttackerSessionID: attackerID,
		TargetSessionID:   payload.TargetSessionID,
		X:                 payload.X,
		Y:                 payload.Y,
		Result:            resultState,
	})
	ws.SendToRoom(room, events.BoardUpdated, dto.BoardUpdatedPayload{
		RoomID:          room.RoomID,
		TargetSessionID: payload.TargetSessionID,
		X:               payload.X,
		Y:               payload.Y,
		State:           resultState,
	})
	if shipSunk {
		ws.SendToRoom(room, events.ShipSunk, dto.ShipSunkPayload{
			RoomID:          room.RoomID,
			TargetSessionID: payload.TargetSessionID,
			Ship:            ship,
		})
	}
	if eliminated {
		ws.SendToRoom(room, events.PlayerEliminated, dto.PlayerEliminatedPayload{
			RoomID:    room.RoomID,
			SessionID: payload.TargetSessionID,
		})
	}

	ws.BroadcastRoomState(room)

	slog.Info("Hit attempted", "roomID", room.RoomID, "attacker", attackerID, "target", payload.TargetSessionID, "result", resultState)

	if gameOver {
		ws.SendToRoom(room, events.GameOver, dto.GameOverPayload{
			RoomID:   room.RoomID,
			WinnerID: room.WinnerID,
		})
		return nil
	}

	ws.SendToRoom(room, events.NextTurn, dto.NextTurnPayload{
		RoomID:          room.RoomID,
		CurrentPlayerID: room.CurrentPlayer,
	})
	return nil
}

var _ api.EventHandler = TryHitHandler
