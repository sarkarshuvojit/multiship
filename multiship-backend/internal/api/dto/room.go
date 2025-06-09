package dto

import "github.com/google/uuid"

type RoomStatus string

const (
	Idle           RoomStatus = "IDLE"
	Waiting                   = "WAITING"
	BoardSelection            = "BOARD_SELECTION"
	PlayersReady              = "PLAYERS_READY"
	Ongoing                   = "ONGOING"
)

type CellState string

const (
	Hidden CellState = "HIDDEN"
	Hit    CellState = "HIT"
	Miss   CellState = "MISS"
)

type ShipDirection string

const (
	Horizontal ShipDirection = "HORIZONTAL"
	Vertical                 = "Vertical"
)

type ShipState struct {
	X   int           `json:"x"`
	Y   int           `json:"y"`
	Dir ShipDirection `json:"dir"`
	Len int           `json:"len"`
}

type PlayerStatus string

const (
	Joined      PlayerStatus = "JOINED"
	BoardReady               = "BOARD_READY"
	CurrentTurn              = "CURRENT_TURN"
)

type PlayerState struct {
	SessionID string        `json:"sessionId"`
	Status    PlayerStatus  `json:"status"`
	Board     [][]CellState `json:"board"`
	Ships     []ShipState   `json:"ships"`
}

type RoomState struct {
	RoomID          string                 `json:"roomId"`
	LeaderSessionID string                 `json:"leaderSessionId"`
	Status          RoomStatus             `json:"status"`
	PlayerSessions  []string               `json:"playerSessions"`
	CurrentPlayer   string                 `json:"currentPlayer"`
	Players         map[string]PlayerState `json:"players"`
}

func NewRoom(
	leaderSessionID string,
) *RoomState {
	newUUID, _ := uuid.NewUUID()
	roomID := newUUID.String()
	return &RoomState{
		RoomID:          roomID,
		LeaderSessionID: leaderSessionID,
		Status:          Idle,
		PlayerSessions:  []string{leaderSessionID},
		CurrentPlayer:   "",
	}
}
