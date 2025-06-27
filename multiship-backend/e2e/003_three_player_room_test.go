package e2e

import (
	"fmt"
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/stretchr/testify/assert"
)

func TestMultiClientRoomInteraction(t *testing.T) {
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
	email1 := fmt.Sprintf("user1_%d@test.com", time.Now().UnixNano())
	email2 := fmt.Sprintf("user2_%d@test.com", time.Now().UnixNano())
	email3 := fmt.Sprintf("user3_%d@test.com", time.Now().UnixNano())

	var roomCode string

	// Test c1: SIGNUP and CREATE_ROOM
	t.Run("Client1_SignupAndCreateRoom", func(t *testing.T) {
		// Send SIGNUP message
		err := c1.SendMessage(events.Signup, map[string]any{
			"email": email1,
		})
		assert.NoError(t, err)

		// Wait for SIGNED_UP response
		msg, err := c1.WaitForMessage(events.SignedUp, 5*time.Second)
		assert.NoError(t, err)
		assert.Equal(t, events.SignedUp, msg.EventType)

		// Send CREATE_ROOM message
		err = c1.SendMessage(events.CreateRoom, nil)
		assert.NoError(t, err)

		// Wait for ROOM_CREATED response and capture roomCode
		msg, err = c1.WaitForMessage(events.RoomCreated, 5*time.Second)
		assert.NoError(t, err)

		data := msg.Payload.(map[string]any)
		roomCode = data["payload"].(map[string]any)["roomCode"].(string)

		assert.NotEmpty(t, roomCode)
	})

	// Test c2: SIGNUP and JOIN_ROOM
	t.Run("Client2_SignupAndJoinRoom", func(t *testing.T) {
		// Send SIGNUP message
		err := c2.SendMessage(events.Signup, map[string]any{
			"email": email2,
		})
		assert.NoError(t, err)

		// Wait for SIGNED_UP response
		_, signuperr := c2.WaitForMessage(events.SignedUp, 5*time.Second)
		assert.NoError(t, signuperr)

		// Send JOIN_ROOM message with captured roomCode
		err = c2.SendMessage(events.JoinRoom, map[string]any{
			"roomCode": roomCode,
		})
		assert.NoError(t, err)

		// Wait for ROOM_JOINED response
		_, err = c2.WaitForMessage(events.RoomJoined, 5*time.Second)
		assert.NoError(t, err)
	})

	// Test c3: SIGNUP and JOIN_ROOM
	t.Run("Client3_SignupAndJoinRoom", func(t *testing.T) {
		// Send SIGNUP message
		err := c3.SendMessage(events.Signup, map[string]any{
			"email": email3,
		})
		assert.NoError(t, err)

		// Wait for SIGNED_UP response
		_, signuperr := c3.WaitForMessage(events.SignedUp, 5*time.Second)
		assert.NoError(t, signuperr)

		// Send JOIN_ROOM message with captured roomCode
		err = c3.SendMessage(events.JoinRoom, map[string]any{
			"roomCode": roomCode,
		})
		assert.NoError(t, err)

		// Wait for ROOM_JOINED response
		_, err = c3.WaitForMessage(events.RoomJoined, 5*time.Second)
		assert.NoError(t, err)
	})

}
