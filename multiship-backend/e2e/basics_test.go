package e2e

import (
	"fmt"
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/stretchr/testify/assert"
)

func TestClientSignup(t *testing.T) {
	url := "ws://localhost:5000/ws"
	client, err := NewTestClient(url)
	assert.NoError(t, err)
	defer client.Close()

	email := fmt.Sprintf("signup_only_%d@test.com", time.Now().UnixNano())

	t.Run("Client_Signup", func(t *testing.T) {
		err := client.SendMessage(events.Signup, map[string]any{
			"email": email,
		})
		assert.NoError(t, err)

		_, err = client.WaitForMessage(events.SignedUp, 5*time.Second)
		assert.NoError(t, err)
	})
}

func TestRoomCreation(t *testing.T) {
	url := "ws://localhost:5000/ws"

	client, err := NewTestClient(url)
	assert.NoError(t, err)
	defer client.Close()

	email := fmt.Sprintf("create_room_only_%d@test.com", time.Now().UnixNano())

	var roomCode string

	t.Run("Client_SignupAndCreateRoom", func(t *testing.T) {
		// Signup
		err := client.SendMessage(events.Signup, map[string]any{
			"email": email,
		})
		assert.NoError(t, err)

		_, err = client.WaitForMessage(events.SignedUp, 5*time.Second)
		assert.NoError(t, err)

		// Create Room
		err = client.SendMessage(events.CreateRoom, nil)
		assert.NoError(t, err)

		msg, err := client.WaitForMessage(events.RoomCreated, 5*time.Second)
		assert.NoError(t, err)

		data := msg.Payload.(map[string]any)
		roomCode = data["payload"].(map[string]any)["roomCode"].(string)

		assert.NotEmpty(t, roomCode)
	})
}
