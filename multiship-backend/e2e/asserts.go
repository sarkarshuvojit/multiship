package e2e

import (
	"fmt"
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/dto"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
	"github.com/stretchr/testify/assert"
)

func AssertSignup(t *testing.T, c *TestClient, email string) string {
	err := c.SendMessage(events.Signup, map[string]any{
		"email": email,
	})
	assert.NoError(t, err)

	// Wait for SIGNED_UP response
	msg, err := c.WaitForMessage(events.SignedUp, 5*time.Second)
	assert.NoError(t, err)
	assert.Equal(t, events.SignedUp, msg.EventType)
	payload := msg.Payload.(map[string]any)
	data := payload["payload"].(map[string]any)
	sessionID := data["sessionId"].(string)
	return sessionID
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

func AssertSubmitBoard(t *testing.T, c *TestClient, roomID string, ships []game.ShipState) {
	err := c.SendMessage(events.SubmitBoard, dto.SubmitBoardDto{
		RoomID: roomID,
		Ships:  ships,
	})
	assert.NoError(t, err)

	_, err = c.WaitForMessage(events.BoardSubmitted, 5*time.Second)
	assert.NoError(t, err)
}

func AssertTryHit(t *testing.T, c *TestClient, roomID string, targetSessionID string, x int, y int) *events.OutboundEvent {
	err := c.SendMessage(events.TryHit, dto.TryHitDto{
		RoomID:          roomID,
		TargetSessionID: targetSessionID,
		X:               x,
		Y:               y,
	})
	assert.NoError(t, err)

	msg, err := c.WaitForMessage(events.HitSuccessful, 5*time.Second)
	assert.NoError(t, err)
	return msg
}

func AssertGeneralError(t *testing.T, c *TestClient) *events.OutboundEvent {
	msg, err := c.WaitForMessage(events.GeneralError, 5*time.Second)
	assert.NoError(t, err)
	return msg
}

func AssertPlayerStatusCount(
	t *testing.T,
	room *game.RoomState,
	expState game.PlayerStatus, expCount int,
) {
	readyPlayers := 0
	for _, player := range room.Players {
		if player.Status == expState {
			readyPlayers++
		}
	}
	assert.Equal(
		t, expCount, readyPlayers,
		fmt.Sprintf("Should have %d ready players now", expCount),
	)

}
