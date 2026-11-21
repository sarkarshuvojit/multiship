package game

import (
	"math/rand"
	"testing"
)

func TestPlaceBotFleetIsValid(t *testing.T) {
	for seed := int64(0); seed < 200; seed++ {
		ships := PlaceBotFleet(rand.New(rand.NewSource(seed)))
		if !ValidateBoard(ships) {
			t.Fatalf("seed %d produced invalid fleet %+v", seed, ships)
		}
	}
}

// playOut lets a bot shoot at a fleet until it is sunk, returning the shot count.
func playOut(t *testing.T, ships []ShipState) int {
	t.Helper()
	room := &RoomState{
		PlayerSessions: []string{"bot", "human"},
		Players: map[string]PlayerState{
			"bot":   {SessionID: "bot", IsBot: true},
			"human": {SessionID: "human", Ships: ships, Board: NewBoard()},
		},
	}
	for shots := 1; shots <= 100; shots++ {
		shot, ok := ChooseBotShot(room, "bot")
		if !ok || shot.TargetID != "human" {
			t.Fatalf("bot gave up after %d shots", shots)
		}
		human := room.Players["human"]
		if GetCell(human.Board, shot.X, shot.Y) != CellStateHidden {
			t.Fatalf("bot fired twice at (%d,%d)", shot.X, shot.Y)
		}
		state := CellStateMiss
		if _, hit := IsShipAt(ships, shot.X, shot.Y); hit {
			state = CellStateHit
		}
		SetCell(human.Board, shot.X, shot.Y, state)
		if AreAllShipsSunk(ships, human.Board) {
			return shots
		}
	}
	t.Fatal("bot did not finish the fleet in 100 shots")
	return 0
}

func TestBotSinksFleetEfficiently(t *testing.T) {
	total := 0
	const games = 50
	for seed := int64(0); seed < games; seed++ {
		total += playOut(t, PlaceBotFleet(rand.New(rand.NewSource(seed+1000))))
	}
	// A random shooter needs ~95 shots; a hunt/target bot should be far better.
	t.Logf("average shots: %d", total/games)
	if avg := total / games; avg > 70 {
		t.Fatalf("bot averaged %d shots, expected under 70", avg)
	}
}

func TestBotIsDeterministic(t *testing.T) {
	ships := PlaceBotFleet(rand.New(rand.NewSource(7)))
	if playOut(t, ships) != playOut(t, ships) {
		t.Fatal("same board should take the same number of shots")
	}
}

func TestBotFollowsUpOnHit(t *testing.T) {
	board := NewBoard()
	SetCell(board, 4, 4, CellStateHit)
	SetCell(board, 5, 4, CellStateHit)
	x, y, ok := bestCell(board, nil)
	if !ok || y != 4 || (x != 3 && x != 6) {
		t.Fatalf("expected bot to extend the line on row 4, got (%d,%d)", x, y)
	}
}

func TestBotPrefersWoundedTarget(t *testing.T) {
	ships := []ShipState{{X: 0, Y: 0, Dir: Horizontal, Len: 4}}
	wounded := NewBoard()
	SetCell(wounded, 0, 0, CellStateHit)
	room := &RoomState{
		PlayerSessions: []string{"bot", "a", "b"},
		Players: map[string]PlayerState{
			"bot": {SessionID: "bot", IsBot: true},
			"a":   {SessionID: "a", Ships: ships, Board: NewBoard()},
			"b":   {SessionID: "b", Ships: ships, Board: wounded},
		},
	}
	shot, ok := ChooseBotShot(room, "bot")
	if !ok || shot.TargetID != "b" {
		t.Fatalf("expected bot to finish off b, got %+v", shot)
	}
}
