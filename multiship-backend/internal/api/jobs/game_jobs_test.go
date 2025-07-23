package jobs

import (
	"testing"

	"github.com/sarkarshuvojit/multiship-backend/internal/game"
)

func TestGetRoomStatusFromPlayerState(t *testing.T) {
	tests := []struct {
		name                 string
		players              map[string]game.PlayerState
		expectedRoomStatus   game.RoomStatus
		expectedShouldUpdate bool
	}{
		{
			name:                 "no players",
			players:              map[string]game.PlayerState{},
			expectedRoomStatus:   game.RoomStatusWaiting,
			expectedShouldUpdate: false,
		},
		{
			name: "one player only",
			players: map[string]game.PlayerState{
				"player1": {Status: game.PlayerStatusJoined},
			},
			expectedRoomStatus:   game.RoomStatusWaiting,
			expectedShouldUpdate: false,
		},
		{
			name: "two players only",
			players: map[string]game.PlayerState{
				"player1": {Status: game.PlayerStatusJoined},
				"player2": {Status: game.PlayerStatusJoined},
			},
			expectedRoomStatus:   game.RoomStatusWaiting,
			expectedShouldUpdate: false,
		},
		{
			name: "three players joined - should move to board selection",
			players: map[string]game.PlayerState{
				"player1": {Status: game.PlayerStatusJoined},
				"player2": {Status: game.PlayerStatusJoined},
				"player3": {Status: game.PlayerStatusJoined},
			},
			expectedRoomStatus:   game.RoomStatusBoardSelection,
			expectedShouldUpdate: true,
		},
		{
			name: "three players with mixed board status - should stay board selection",
			players: map[string]game.PlayerState{
				"player1": {Status: game.PlayerStatusBoardReady},
				"player2": {Status: game.PlayerStatusJoined},
				"player3": {Status: game.PlayerStatusJoined},
			},
			expectedRoomStatus:   game.RoomStatusBoardSelection,
			expectedShouldUpdate: true,
		},
		{
			name: "three players all board ready - should move to players ready",
			players: map[string]game.PlayerState{
				"player1": {Status: game.PlayerStatusBoardReady},
				"player2": {Status: game.PlayerStatusBoardReady},
				"player3": {Status: game.PlayerStatusBoardReady},
			},
			expectedRoomStatus:   game.RoomStatusPlayersReady,
			expectedShouldUpdate: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			roomStatus, shouldUpdate := GetRoomStatusFromPlayerState(tt.players)

			if roomStatus != tt.expectedRoomStatus {
				t.Errorf("GetRoomStatusFromPlayerState() roomStatus = %v, want %v", roomStatus, tt.expectedRoomStatus)
			}

			if shouldUpdate != tt.expectedShouldUpdate {
				t.Errorf("GetRoomStatusFromPlayerState() shouldUpdate = %v, want %v", shouldUpdate, tt.expectedShouldUpdate)
			}
		})
	}
}
