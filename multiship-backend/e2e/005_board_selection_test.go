package e2e

import (
	"fmt"
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
	"github.com/stretchr/testify/assert"
)

func TestBoardSelectionWorkflow(t *testing.T) {
	url := fmt.Sprintf("ws://localhost:%s/ws", TestServerPort)

	// Create three WebSocket connections
	c1, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c1.Close()

	c2, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c2.Close()

	c3, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c3.Close()

	// Generate random emails for each connection
	email1 := fmt.Sprintf("player1_%d@test.com", time.Now().UnixNano())
	email2 := fmt.Sprintf("player2_%d@test.com", time.Now().UnixNano())
	email3 := fmt.Sprintf("player3_%d@test.com", time.Now().UnixNano())

	var roomCode string
	var roomID string

	// Test c1: SIGNUP and CREATE_ROOM
	t.Run("Client1_SignupAndCreateRoom", func(t *testing.T) {
		AssertSignup(t, c1, email1)
		msg := AssertCreateRoom(t, c1)

		data := msg.Payload.(map[string]any)
		payload := data["payload"].(map[string]any)
		roomCode = payload["roomCode"].(string)
		roomID = payload["roomId"].(string)

		assert.NotEmpty(t, roomCode)
		assert.NotEmpty(t, roomID)
	})

	t.Run("Client2_SignupAndJoinRoom", func(t *testing.T) {
		AssertSignup(t, c2, email2)
		AssertJoinRoom(t, c2, roomCode)
	})

	t.Run("Client3_SignupAndJoinRoom", func(t *testing.T) {
		AssertSignup(t, c3, email3)
		AssertJoinRoom(t, c3, roomCode)

		// Wait for room state recalculation job to complete
		time.Sleep(100 * time.Millisecond)

		// Verify room is now in board selection state
		room, err := repo.GetRoomByRoomCode(MockDB, roomCode)
		assert.NoError(t, err)
		assert.NotNil(t, room)
		assert.Equal(t, game.RoomStatusBoardSelection, room.Status, "Room should be in board selection state")
		assert.Len(t, room.PlayerSessions, 3, "Room should have exactly 3 players")
	})

	// Create valid ship configurations for all 3 players
	validShips := []game.ShipState{
		// 1x Length 4 (Battleship)
		{X: 0, Y: 0, Dir: game.Horizontal, Len: 4},
		// 2x Length 3 (Cruisers)
		{X: 0, Y: 2, Dir: game.Horizontal, Len: 3},
		{X: 0, Y: 4, Dir: game.Horizontal, Len: 3},
		// 3x Length 2 (Destroyers)
		{X: 0, Y: 6, Dir: game.Horizontal, Len: 2},
		{X: 3, Y: 6, Dir: game.Horizontal, Len: 2},
		{X: 6, Y: 6, Dir: game.Horizontal, Len: 2},
		// 4x Length 1 (Submarines)
		{X: 0, Y: 8, Dir: game.Horizontal, Len: 1},
		{X: 2, Y: 8, Dir: game.Horizontal, Len: 1},
		{X: 4, Y: 8, Dir: game.Horizontal, Len: 1},
		{X: 6, Y: 8, Dir: game.Horizontal, Len: 1},
	}

	// Alternative valid ship configuration for player 2
	validShips2 := []game.ShipState{
		// 1x Length 4 (Battleship)
		{X: 1, Y: 1, Dir: game.Vertical, Len: 4},
		// 2x Length 3 (Cruisers)
		{X: 3, Y: 1, Dir: game.Vertical, Len: 3},
		{X: 5, Y: 1, Dir: game.Vertical, Len: 3},
		// 3x Length 2 (Destroyers)
		{X: 7, Y: 2, Dir: game.Vertical, Len: 2},
		{X: 9, Y: 5, Dir: game.Vertical, Len: 2},
		{X: 0, Y: 5, Dir: game.Vertical, Len: 2},
		// 4x Length 1 (Submarines)
		{X: 0, Y: 8, Dir: game.Vertical, Len: 1},
		{X: 2, Y: 8, Dir: game.Vertical, Len: 1},
		{X: 4, Y: 8, Dir: game.Vertical, Len: 1},
		{X: 6, Y: 8, Dir: game.Vertical, Len: 1},
	}

	// Alternative valid ship configuration for player 3
	t.Run("Client1_SubmitBoard", func(t *testing.T) {
		AssertSubmitBoard(t, c1, roomID, validShips)
		time.Sleep(100 * time.Millisecond)

		// Verify player board was saved
		room, err := repo.GetRoomByID(MockDB, roomID)
		assert.NoError(t, err)
		assert.NotNil(t, room)

		AssertPlayerStatusCount(t, room, game.PlayerStatusBoardReady, 1)
	})

	t.Run("Client2_SubmitBoard", func(t *testing.T) {
		AssertSubmitBoard(t, c2, roomID, validShips2)
		time.Sleep(100 * time.Millisecond)

		// Verify room is still in board selection as not all players submitted
		room, err := repo.GetRoomByID(MockDB, roomID)
		assert.NoError(t, err)
		assert.NotNil(t, room)
		assert.Equal(t, game.RoomStatusBoardSelection, room.Status, "Room should still be in board selection state")

		// Count ready players
		AssertPlayerStatusCount(t, room, game.PlayerStatusBoardReady, 2)
	})

	t.Run("Client3_SubmitBoard_AndVerifyRoomStatusChange", func(t *testing.T) {
		AssertSubmitBoard(t, c3, roomID, validShips2)
		time.Sleep(100 * time.Millisecond)

		// Now verify that all players have submitted and room status changed
		room, err := repo.GetRoomByID(MockDB, roomID)
		assert.NoError(t, err)
		assert.NotNil(t, room)

		// Check all players are ready
		AssertPlayerStatusCount(t, room, game.PlayerStatusBoardReady, 3)

		// Most important: Verify room status changed to Ongoing (which indicates game is now active)
		assert.Equal(t, game.RoomStatusOngoing, room.Status, "Room should be in ongoing state after all players submit boards")
	})
}
