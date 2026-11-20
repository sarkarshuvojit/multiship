package e2e

import (
	"testing"
	"time"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
	"github.com/stretchr/testify/assert"
)

type targetCell struct {
	sessionID string
	x         int
	y         int
}

func TestCompleteGameSimulation(t *testing.T) {
	setup := setupGameplayRoom(t)
	defer setup.c1.Close()
	defer setup.c2.Close()
	defer setup.c3.Close()

	p1Targets := make([]targetCell, 0)
	for _, cell := range shipCells(setup.ships2) {
		p1Targets = append(p1Targets, targetCell{sessionID: setup.s2, x: cell[0], y: cell[1]})
	}
	for _, cell := range shipCells(setup.ships3) {
		p1Targets = append(p1Targets, targetCell{sessionID: setup.s3, x: cell[0], y: cell[1]})
	}

	empty := emptyCells(setup.ships1)
	p1Index := 0
	p2Index := 0
	p3Index := 0
	nextMissCell := func(room *game.RoomState, start *int) ([2]int, bool) {
		for *start < len(empty) {
			cell := empty[*start]
			*start++
			board := room.Players[setup.s1].Board
			if len(board) == 0 {
				return cell, true
			}
			if board[cell[1]][cell[0]] == game.CellStateHidden {
				return cell, true
			}
		}
		return [2]int{}, false
	}

	for turn := 0; turn < 200; turn++ {
		room, err := repo.GetRoomByID(MockDB, setup.roomID)
		assert.NoError(t, err)
		activePlayers := 0
		for _, player := range room.Players {
			if !player.Eliminated {
				activePlayers++
			}
		}
		if activePlayers <= 1 {
			break
		}

		switch room.CurrentPlayer {
		case setup.s1:
			if p1Index >= len(p1Targets) {
				t.Fatalf("no remaining targets for player1")
			}
			cell := p1Targets[p1Index]
			p1Index++
			AssertTryHit(t, setup.c1, setup.roomID, cell.sessionID, cell.x, cell.y)
		case setup.s2:
			cell, ok := nextMissCell(room, &p2Index)
			if !ok {
				t.Fatalf("no remaining miss cells for player2")
			}
			AssertTryHit(t, setup.c2, setup.roomID, setup.s1, cell[0], cell[1])
		case setup.s3:
			cell, ok := nextMissCell(room, &p3Index)
			if !ok {
				t.Fatalf("no remaining miss cells for player3")
			}
			AssertTryHit(t, setup.c3, setup.roomID, setup.s1, cell[0], cell[1])
		default:
			t.Fatalf("unexpected current player: %s", room.CurrentPlayer)
		}
	}

	msg, err := setup.c1.WaitForMessage(events.GameOver, 10*time.Second)
	assert.NoError(t, err)
	payload := msg.Payload.(map[string]any)
	data := payload["payload"].(map[string]any)
	winner := data["winnerId"].(string)
	assert.Equal(t, setup.s1, winner)
}
