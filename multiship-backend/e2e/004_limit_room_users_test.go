package e2e

import (
	"fmt"
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
	"github.com/stretchr/testify/assert"
)

func TestRoomRejectsFourthPlayer(t *testing.T) {
	url := fmt.Sprintf("ws://localhost:%s/ws", TestServerPort)

	// Create 4 WebSocket connections
	c1, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c1.Close()

	c2, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c2.Close()

	c3, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c3.Close()

	c4, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c4.Close()

	// Generate random emails
	email1 := fmt.Sprintf("levi_%d@test.com", time.Now().UnixNano())
	email2 := fmt.Sprintf("hange_%d@test.com", time.Now().UnixNano())
	email3 := fmt.Sprintf("sasha_%d@test.com", time.Now().UnixNano())
	email4 := fmt.Sprintf("jean_%d@test.com", time.Now().UnixNano())

	var roomCode string

	t.Run("Client1_SignupAndCreateRoom", func(t *testing.T) {
		AssertSignup(t, c1, email1)
		msg := AssertCreateRoom(t, c1)

		data := msg.Payload.(map[string]any)
		roomCode = data["payload"].(map[string]any)["roomCode"].(string)

		assert.NotEmpty(t, roomCode)
	})

	t.Run("Client2_SignupAndJoinRoom", func(t *testing.T) {
		AssertSignup(t, c2, email2)
		AssertJoinRoom(t, c2, roomCode)
	})

	t.Run("Client3_SignupAndJoinRoom", func(t *testing.T) {
		AssertSignup(t, c3, email3)
		AssertJoinRoom(t, c3, roomCode)

		// Inspect room detail to check if state changed using MockDB
		room, err := repo.GetRoomByRoomCode(MockDB, roomCode)
		assert.NoError(t, err)
		assert.NotNil(t, room)

		// Check that room has exactly 3 players after Client3 joins
		assert.Len(t, room.PlayerSessions, 3, "Room should have exactly 3 players")
		assert.Len(t, room.Players, 3, "Room players map should have exactly 3 entries")

		// Check that room status changed to board selection
		assert.Equal(t, game.RoomStatusBoardSelection, room.Status, "Room should be in board selection state")
	})

	t.Run("Client4_SignupAndAttemptJoinRoom_Fails", func(t *testing.T) {
		AssertSignup(t, c4, email4)

		// Attempt to join full room
		err := c4.SendMessage(events.JoinRoom, map[string]any{
			"roomCode": roomCode,
		})
		assert.NoError(t, err)

		// Expect ROOM_JOIN_ERROR or similar event indicating failure
		_, err = c4.WaitForMessage(events.GeneralError, 5*time.Second)
		assert.NoError(t, err)
	})

}
