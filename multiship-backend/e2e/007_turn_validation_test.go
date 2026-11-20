package e2e

import (
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/stretchr/testify/assert"
)

func TestTurnValidation(t *testing.T) {
	setup := setupGameplayRoom(t)
	defer setup.c1.Close()
	defer setup.c2.Close()
	defer setup.c3.Close()

	room, err := repo.GetRoomByID(MockDB, setup.roomID)
	assert.NoError(t, err)

	var attacker *TestClient
	var targetID string
	if room.CurrentPlayer == setup.s1 {
		attacker = setup.c2
		targetID = setup.s1
	} else {
		attacker = setup.c1
		targetID = setup.s2
	}

	err = attacker.SendMessage(events.TryHit, map[string]any{
		"roomId":          setup.roomID,
		"targetSessionId": targetID,
		"x":               0,
		"y":               0,
	})
	assert.NoError(t, err)

	msg, err := attacker.WaitForMessage(events.GeneralError, 5*time.Second)
	assert.NoError(t, err)
	payload := msg.Payload.(map[string]any)
	assert.Equal(t, events.NotPlayersTurnErr.Error(), payload["msg"].(string))
}
