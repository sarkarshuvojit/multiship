package e2e

import (
	"fmt"
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
	"github.com/stretchr/testify/assert"
)

type gameplaySetup struct {
	c1       *TestClient
	c2       *TestClient
	c3       *TestClient
	roomID   string
	roomCode string
	s1       string
	s2       string
	s3       string
	ships1   []game.ShipState
	ships2   []game.ShipState
	ships3   []game.ShipState
}

func setupGameplayRoom(t *testing.T) gameplaySetup {
	url := fmt.Sprintf("ws://localhost:%s/ws", TestServerPort)

	c1, err := NewTestClient(url)
	assert.NoError(t, err)
	c2, err := NewTestClient(url)
	assert.NoError(t, err)
	c3, err := NewTestClient(url)
	assert.NoError(t, err)

	email1 := fmt.Sprintf("player1_%d@test.com", time.Now().UnixNano())
	email2 := fmt.Sprintf("player2_%d@test.com", time.Now().UnixNano())
	email3 := fmt.Sprintf("player3_%d@test.com", time.Now().UnixNano())

	session1 := AssertSignup(t, c1, email1)
	roomMsg := AssertCreateRoom(t, c1)
	payload := roomMsg.Payload.(map[string]any)["payload"].(map[string]any)
	roomCode := payload["roomCode"].(string)
	roomID := payload["roomId"].(string)

	session2 := AssertSignup(t, c2, email2)
	AssertJoinRoom(t, c2, roomCode)

	session3 := AssertSignup(t, c3, email3)
	AssertJoinRoom(t, c3, roomCode)

	ships1 := []game.ShipState{
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

	ships2 := []game.ShipState{
		{X: 1, Y: 1, Dir: game.Vertical, Len: 4},
		{X: 3, Y: 1, Dir: game.Vertical, Len: 3},
		{X: 5, Y: 1, Dir: game.Vertical, Len: 3},
		{X: 7, Y: 2, Dir: game.Vertical, Len: 2},
		{X: 9, Y: 5, Dir: game.Vertical, Len: 2},
		{X: 0, Y: 5, Dir: game.Vertical, Len: 2},
		{X: 0, Y: 8, Dir: game.Vertical, Len: 1},
		{X: 2, Y: 8, Dir: game.Vertical, Len: 1},
		{X: 4, Y: 8, Dir: game.Vertical, Len: 1},
		{X: 6, Y: 8, Dir: game.Vertical, Len: 1},
	}

	ships3 := []game.ShipState{
		{X: 5, Y: 0, Dir: game.Vertical, Len: 4},
		{X: 7, Y: 0, Dir: game.Vertical, Len: 3},
		{X: 9, Y: 0, Dir: game.Vertical, Len: 3},
		{X: 0, Y: 5, Dir: game.Horizontal, Len: 2},
		{X: 3, Y: 5, Dir: game.Horizontal, Len: 2},
		{X: 6, Y: 5, Dir: game.Horizontal, Len: 2},
		{X: 1, Y: 8, Dir: game.Horizontal, Len: 1},
		{X: 3, Y: 8, Dir: game.Horizontal, Len: 1},
		{X: 5, Y: 8, Dir: game.Horizontal, Len: 1},
		{X: 7, Y: 8, Dir: game.Horizontal, Len: 1},
	}

	AssertSubmitBoard(t, c1, roomID, ships1)
	AssertSubmitBoard(t, c2, roomID, ships2)
	AssertSubmitBoard(t, c3, roomID, ships3)

	for i := 0; i < 10; i++ {
		room, err := repo.GetRoomByID(MockDB, roomID)
		assert.NoError(t, err)
		if room.Status == game.RoomStatusOngoing && room.CurrentPlayer != "" {
			break
		}
		time.Sleep(100 * time.Millisecond)
	}

	return gameplaySetup{
		c1:       c1,
		c2:       c2,
		c3:       c3,
		roomID:   roomID,
		roomCode: roomCode,
		s1:       session1,
		s2:       session2,
		s3:       session3,
		ships1:   ships1,
		ships2:   ships2,
		ships3:   ships3,
	}
}

func shipCells(ships []game.ShipState) [][2]int {
	cells := make([][2]int, 0)
	for _, ship := range ships {
		for i := 0; i < ship.Len; i++ {
			x := ship.X
			y := ship.Y
			if ship.Dir == game.Horizontal {
				x = ship.X + i
			} else {
				y = ship.Y + i
			}
			cells = append(cells, [2]int{x, y})
		}
	}
	return cells
}

func emptyCells(ships []game.ShipState) [][2]int {
	occupied := map[[2]int]bool{}
	for _, cell := range shipCells(ships) {
		occupied[cell] = true
	}
	cells := make([][2]int, 0)
	for x := 0; x < 10; x++ {
		for y := 0; y < 10; y++ {
			key := [2]int{x, y}
			if !occupied[key] {
				cells = append(cells, key)
			}
		}
	}
	return cells
}
