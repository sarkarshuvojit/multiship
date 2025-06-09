package dto

import (
	"math/rand"
	"strings"

	"github.com/google/uuid"
)

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
	Code            string                 `json:"code"`
	LeaderSessionID string                 `json:"leaderSessionId"`
	Status          RoomStatus             `json:"status"`
	PlayerSessions  []string               `json:"playerSessions"`
	CurrentPlayer   string                 `json:"currentPlayer"`
	Players         map[string]PlayerState `json:"players"`
}

func createRoomCode() string {
	return strings.Join([]string{
		getWord(),
		getWord(),
		getWord(),
	}, "-")
}

func getWord() string {
	letters := []rune("abcdefghijklmnopqrstuvwxyz")
	var b strings.Builder
	for range 3 {
		b.WriteRune(letters[rand.Intn(len(letters))])
	}
	return b.String()
}

func NewRoom(
	leaderSessionID string,
) *RoomState {
	newUUID, _ := uuid.NewUUID()
	roomID := newUUID.String()
	return &RoomState{
		RoomID:          roomID,
		Code:            createRoomCode(),
		LeaderSessionID: leaderSessionID,
		Status:          Idle,
		PlayerSessions:  []string{leaderSessionID},
		CurrentPlayer:   "",
	}
}

type RoomCreatedPayload struct {
	RoomID   string `json:"roomId"`
	RoomCode string `json:"roomCode"`
}
