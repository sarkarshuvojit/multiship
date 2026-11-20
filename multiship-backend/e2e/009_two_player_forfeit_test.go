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

func waitForRoomStatus(t *testing.T, roomID string, status game.RoomStatus) *game.RoomState {
	var room *game.RoomState
	for i := 0; i < 30; i++ {
		r, err := repo.GetRoomByID(MockDB, roomID)
		assert.NoError(t, err)
		room = r
		if room.Status == status {
			return room
		}
		time.Sleep(50 * time.Millisecond)
	}
	t.Fatalf("room never reached %s, last status %s", status, room.Status)
	return room
}

func TestTwoPlayerHostStartAndForfeit(t *testing.T) {
	url := fmt.Sprintf("ws://localhost:%s/ws", TestServerPort)
	c1, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c1.Close()
	c2, err := NewTestClient(url)
	assert.NoError(t, err)

	s1 := AssertSignup(t, c1, fmt.Sprintf("host_%d@test.com", time.Now().UnixNano()))
	payload := AssertCreateRoom(t, c1).Payload.(map[string]any)["payload"].(map[string]any)
	roomID := payload["roomId"].(string)
	roomCode := payload["roomCode"].(string)

	AssertSignup(t, c2, fmt.Sprintf("guest_%d@test.com", time.Now().UnixNano()))
	AssertJoinRoom(t, c2, roomCode)

	// Only the host may start.
	assert.NoError(t, c2.SendMessage(events.StartGame, map[string]any{"roomId": roomID}))
	msg := AssertGeneralError(t, c2)
	assert.Equal(t, events.NotRoomHostErr.Error(), msg.Payload.(map[string]any)["msg"])

	assert.NoError(t, c1.SendMessage(events.StartGame, map[string]any{"roomId": roomID}))
	waitForRoomStatus(t, roomID, game.RoomStatusBoardSelection)

	ships := []game.ShipState{
		{X: 0, Y: 0, Dir: game.Horizontal, Len: 4},
		{X: 0, Y: 2, Dir: game.Horizontal, Len: 3},
		{X: 0, Y: 4, Dir: game.Horizontal, Len: 3},
		{X: 0, Y: 6, Dir: game.Horizontal, Len: 2},
		{X: 3, Y: 6, Dir: game.Horizontal, Len: 2},
		{X: 6, Y: 6, Dir: game.Horizontal, Len: 2},
		{X: 0, Y: 8, Dir: game.Horizontal, Len: 1},
		{X: 2, Y: 8, Dir: game.Horizontal, Len: 1},
		{X: 4, Y: 8, Dir: game.Horizontal, Len: 1},
		{X: 6, Y: 8, Dir: game.Horizontal, Len: 1},
	}
	AssertSubmitBoard(t, c1, roomID, ships)
	AssertSubmitBoard(t, c2, roomID, ships)
	room := waitForRoomStatus(t, roomID, game.RoomStatusOngoing)
	assert.NotEmpty(t, room.CurrentPlayer)

	// Clients must be told the battle started (pushed by the recompute job).
	turn, err := c1.WaitForMessage(events.NextTurn, 5*time.Second)
	assert.NoError(t, err)
	assert.Equal(t, room.CurrentPlayer, turn.Payload.(map[string]any)["currentPlayerId"])

	// Late joiners are rejected once the battle is on.
	c3, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c3.Close()
	AssertSignup(t, c3, fmt.Sprintf("late_%d@test.com", time.Now().UnixNano()))
	assert.NoError(t, c3.SendMessage(events.JoinRoom, map[string]any{"roomCode": roomCode}))
	msg = AssertGeneralError(t, c3)
	assert.Equal(t, events.RoomNotJoinableErr.Error(), msg.Payload.(map[string]any)["msg"])

	// Guest drops: host wins by forfeit.
	assert.NoError(t, c2.Close())
	over, err := c1.WaitForMessage(events.GameOver, 5*time.Second)
	assert.NoError(t, err)
	assert.Equal(t, s1, over.Payload.(map[string]any)["winnerId"])

	room = waitForRoomStatus(t, roomID, game.RoomStatusFinished)
	assert.Equal(t, s1, room.WinnerID)

	// Rematch resets the room; the player who left is not pulled back in.
	assert.NoError(t, c1.SendMessage(events.Rematch, map[string]any{"roomId": roomID}))
	room = waitForRoomStatus(t, roomID, game.RoomStatusWaiting)
	assert.Equal(t, []string{s1}, room.PlayerSessions)
	assert.Empty(t, room.WinnerID)
	assert.False(t, room.Players[s1].Eliminated)
	assert.Equal(t, game.PlayerStatusJoined, room.Players[s1].Status)

	// Rematch is rejected while a game is not finished.
	assert.NoError(t, c1.SendMessage(events.Rematch, map[string]any{"roomId": roomID}))
	msg = AssertGeneralError(t, c1)
	assert.Equal(t, events.GameNotFinishedErr.Error(), msg.Payload.(map[string]any)["msg"])
}
