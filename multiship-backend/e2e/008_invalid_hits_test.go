package e2e

import (
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/stretchr/testify/assert"
)

func TestInvalidHitAttempts(t *testing.T) {
	setup := setupGameplayRoom(t)
	defer setup.c1.Close()
	defer setup.c2.Close()
	defer setup.c3.Close()

	room, err := repo.GetRoomByID(MockDB, setup.roomID)
	assert.NoError(t, err)

	attacker := setup.c1
	attackerID := setup.s1
	targetID := setup.s2
	if room.CurrentPlayer == setup.s2 {
		attacker = setup.c2
		attackerID = setup.s2
		targetID = setup.s1
	}

	err = attacker.SendMessage(events.TryHit, map[string]any{
		"roomId":          setup.roomID,
		"targetSessionId": targetID,
		"x":               12,
		"y":               0,
	})
	assert.NoError(t, err)

	msg, err := attacker.WaitForMessage(events.GeneralError, 5*time.Second)
	assert.NoError(t, err)
	payload := msg.Payload.(map[string]any)
	assert.Equal(t, events.InvalidCoordinatesErr.Error(), payload["msg"].(string))

	err = attacker.SendMessage(events.TryHit, map[string]any{
		"roomId":          setup.roomID,
		"targetSessionId": attackerID,
		"x":               0,
		"y":               0,
	})
	assert.NoError(t, err)

	msg, err = attacker.WaitForMessage(events.GeneralError, 5*time.Second)
	assert.NoError(t, err)
	payload = msg.Payload.(map[string]any)
	assert.Equal(t, events.InvalidTargetErr.Error(), payload["msg"].(string))

	AssertTryHit(t, attacker, setup.roomID, targetID, 0, 0)

	room, err = repo.GetRoomByID(MockDB, setup.roomID)
	assert.NoError(t, err)
	room.CurrentPlayer = attackerID
	assert.NoError(t, repo.UpdateRoom(MockDB, room))

	err = attacker.SendMessage(events.TryHit, map[string]any{
		"roomId":          setup.roomID,
		"targetSessionId": targetID,
		"x":               0,
		"y":               0,
	})
	assert.NoError(t, err)

	msg, err = attacker.WaitForMessage(events.GeneralError, 5*time.Second)
	assert.NoError(t, err)
	payload = msg.Payload.(map[string]any)
	assert.Equal(t, events.CellAlreadyHitErr.Error(), payload["msg"].(string))
}
