package game

import (
	"github.com/google/uuid"
)

type RoomState struct {
	RoomID          string                 `json:"roomId"`
	Code            string                 `json:"code"`
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
		Code:            createRoomCode(),
		LeaderSessionID: leaderSessionID,
		Status:          RoomStatusIdle,
		PlayerSessions:  []string{leaderSessionID},
		Players: map[string]PlayerState{
			leaderSessionID: *NewPlayer(leaderSessionID),
		},
		CurrentPlayer: "",
	}
}
