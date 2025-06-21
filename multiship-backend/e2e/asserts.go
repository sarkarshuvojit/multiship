package e2e

import (
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/stretchr/testify/assert"
)

func AssertSignup(t *testing.T, c *TestClient, email string) {
	err := c.SendMessage(events.Signup, map[string]any{
		"email": email,
	})
	assert.NoError(t, err)

	// Wait for SIGNED_UP response
	msg, err := c.WaitForMessage(events.SignedUp, 5*time.Second)
	assert.NoError(t, err)
	assert.Equal(t, events.SignedUp, msg.EventType)
}

func AssertCreateRoom(t *testing.T, c *TestClient) *events.OutboundEvent {
	// Send CREATE_ROOM message
	err := c.SendMessage(events.CreateRoom, nil)
	assert.NoError(t, err)

	// Wait for ROOM_CREATED response and capture roomCode
	msg, err := c.WaitForMessage(events.RoomCreated, 5*time.Second)
	assert.NoError(t, err)

	return msg
}

func AssertJoinRoom(
	t *testing.T, c *TestClient,
	roomCode string,
) *events.OutboundEvent {
	// Send JOIN_ROOM message with captured roomCode
	err := c.SendMessage(events.JoinRoom, map[string]any{
		"roomCode": roomCode,
	})
	assert.NoError(t, err)

	// Wait for ROOM_JOINED response
	msg, err := c.WaitForMessage(events.RoomJoined, 5*time.Second)
	assert.NoError(t, err)

	return msg
}
