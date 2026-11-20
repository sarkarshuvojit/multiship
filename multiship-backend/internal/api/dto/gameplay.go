package dto

import "github.com/sarkarshuvojit/multiship-backend/internal/game"

type TryHitDto struct {
	RoomID          string `json:"roomId"`
	TargetSessionID string `json:"targetSessionId"`
	X               int    `json:"x"`
	Y               int    `json:"y"`
}

type HitAttemptedPayload struct {
	RoomID            string         `json:"roomId"`
	AttackerSessionID string         `json:"attackerSessionId"`
	TargetSessionID   string         `json:"targetSessionId"`
	X                 int            `json:"x"`
	Y                 int            `json:"y"`
	Result            game.CellState `json:"result"`
}

type BoardUpdatedPayload struct {
	RoomID          string         `json:"roomId"`
	TargetSessionID string         `json:"targetSessionId"`
	X               int            `json:"x"`
	Y               int            `json:"y"`
	State           game.CellState `json:"state"`
}

type NextTurnPayload struct {
	RoomID          string `json:"roomId"`
	CurrentPlayerID string `json:"currentPlayerId"`
}

type ShipSunkPayload struct {
	RoomID          string         `json:"roomId"`
	TargetSessionID string         `json:"targetSessionId"`
	Ship            game.ShipState `json:"ship"`
}

type PlayerEliminatedPayload struct {
	RoomID    string `json:"roomId"`
	SessionID string `json:"sessionId"`
}

type GameOverPayload struct {
	RoomID   string `json:"roomId"`
	WinnerID string `json:"winnerId"`
}
