package e2e

import (
	"fmt"
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/handlers"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBotFillsSeatAndPlays(t *testing.T) {
	handlers.BotThinkTime = 5 * time.Millisecond
	url := fmt.Sprintf("ws://localhost:%s/ws", TestServerPort)

	host, err := NewTestClient(url)
	require.NoError(t, err)
	defer host.Close()
	guest, err := NewTestClient(url)
	require.NoError(t, err)
	defer guest.Close()

	hostID := AssertSignup(t, host, fmt.Sprintf("bothost_%d@test.com", time.Now().UnixNano()))
	payload := AssertCreateRoom(t, host).Payload.(map[string]any)["payload"].(map[string]any)
	roomID := payload["roomId"].(string)
	roomCode := payload["roomCode"].(string)

	// Only the host may add bots.
	AssertSignup(t, guest, fmt.Sprintf("botguest_%d@test.com", time.Now().UnixNano()))
	AssertJoinRoom(t, guest, roomCode)
	require.NoError(t, guest.SendMessage(events.AddBot, map[string]any{"roomId": roomID}))
	msg := AssertGeneralError(t, guest)
	assert.Equal(t, events.HostOnlyErr.Error(), msg.Payload.(map[string]any)["msg"])
	guest.Close()
	time.Sleep(100 * time.Millisecond)

	// Two bots fill the room.
	require.NoError(t, host.SendMessage(events.AddBot, map[string]any{"roomId": roomID}))
	require.NoError(t, host.SendMessage(events.AddBot, map[string]any{"roomId": roomID}))
	var room *game.RoomState
	require.Eventually(t, func() bool {
		room, _ = repo.GetRoomByID(MockDB, roomID)
		return len(room.PlayerSessions) == 3
	}, 2*time.Second, 20*time.Millisecond)
	// A full room jumps straight to board selection.
	room = waitForRoomStatus(t, roomID, game.RoomStatusBoardSelection)
	bot1, bot2 := room.PlayerSessions[1], room.PlayerSessions[2]
	assert.True(t, room.Players[bot1].IsBot)
	assert.NotEqual(t, room.Players[bot1].Name, room.Players[bot2].Name)
	assert.Equal(t, game.PlayerStatusBoardReady, room.Players[bot1].Status)
	assert.True(t, game.ValidateBoard(room.Players[bot1].Ships))

	// Once board selection starts the lobby is locked.
	require.NoError(t, host.SendMessage(events.RemoveBot, map[string]any{"roomId": roomID, "botId": bot2}))
	msg = AssertGeneralError(t, host)
	assert.Equal(t, events.RoomNotJoinableErr.Error(), msg.Payload.(map[string]any)["msg"])

	hostShips := []game.ShipState{
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
	AssertSubmitBoard(t, host, roomID, hostShips)
	waitForRoomStatus(t, roomID, game.RoomStatusOngoing)

	// The host fires sweeps at whichever bot is alive; bots answer on their own.
	deadline := time.Now().Add(20 * time.Second)
	for time.Now().Before(deadline) {
		room, _ = repo.GetRoomByID(MockDB, roomID)
		if room.Status == game.RoomStatusFinished {
			break
		}
		if room.CurrentPlayer != hostID {
			time.Sleep(5 * time.Millisecond)
			continue
		}
		target := bot1
		if room.Players[bot1].Eliminated {
			target = bot2
		}
		x, y := nextHidden(room.Players[target].Board)
		require.NoError(t, host.SendMessage(events.TryHit, map[string]any{
			"roomId": roomID, "targetSessionId": target, "x": x, "y": y,
		}))
		require.Eventually(t, func() bool {
			r, _ := repo.GetRoomByID(MockDB, roomID)
			return r.CurrentPlayer != hostID || r.Status == game.RoomStatusFinished
		}, 2*time.Second, 2*time.Millisecond)
	}
	room = waitForRoomStatus(t, roomID, game.RoomStatusFinished)
	assert.NotEmpty(t, room.WinnerID)
	// Bots took real shots at the host and each other.
	assert.Greater(t, shotsTaken(room.Players[hostID].Board), 0)

	// Rematch keeps the bots, each with a fresh, ready fleet.
	require.NoError(t, host.SendMessage(events.Rematch, map[string]any{"roomId": roomID}))
	room = waitForRoomStatus(t, roomID, game.RoomStatusBoardSelection)
	assert.Len(t, room.PlayerSessions, 3)
	assert.False(t, room.Players[bot1].Eliminated)
	assert.Equal(t, 0, shotsTaken(room.Players[bot1].Board))
	assert.Equal(t, game.PlayerStatusBoardReady, room.Players[bot2].Status)

	// When the last human leaves, the bots go too.
	require.NoError(t, host.SendMessage(events.LeaveRoom, map[string]any{}))
	require.Eventually(t, func() bool {
		r, _ := repo.GetRoomByID(MockDB, roomID)
		return len(r.PlayerSessions) == 0
	}, 2*time.Second, 20*time.Millisecond)
}

func nextHidden(board [][]game.CellState) (int, int) {
	for y := range 10 {
		for x := range 10 {
			if board[y][x] == game.CellStateHidden {
				return x, y
			}
		}
	}
	return 0, 0
}

func shotsTaken(board [][]game.CellState) int {
	n := 0
	for _, row := range board {
		for _, c := range row {
			if c != game.CellStateHidden {
				n++
			}
		}
	}
	return n
}
