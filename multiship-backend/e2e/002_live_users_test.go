package e2e

import (
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/stretchr/testify/assert"
)

func TestLiveUsers(t *testing.T) {
	url := "ws://localhost:5000/ws"

	c1, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c1.Close()

	_, err = c1.WaitForMessage(events.LiveUserUpdate, 5*time.Second)
	assert.NoError(t, err)
}
