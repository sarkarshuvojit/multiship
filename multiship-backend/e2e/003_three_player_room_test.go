package e2e

import (
	"fmt"
	"testing"
	"time"

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
	})
}
