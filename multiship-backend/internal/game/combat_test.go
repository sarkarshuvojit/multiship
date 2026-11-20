package game

import "testing"

func TestIsShipAt(t *testing.T) {
	ships := []ShipState{
		{X: 0, Y: 0, Dir: Horizontal, Len: 3},
		{X: 5, Y: 2, Dir: Vertical, Len: 2},
	}

	if _, ok := IsShipAt(ships, 1, 0); !ok {
		t.Errorf("expected ship at (1,0)")
	}
	if _, ok := IsShipAt(ships, 5, 3); !ok {
		t.Errorf("expected ship at (5,3)")
	}
	if _, ok := IsShipAt(ships, 9, 9); ok {
		t.Errorf("did not expect ship at (9,9)")
	}
}

func TestIsShipSunk(t *testing.T) {
	board := NewBoard()
	ship := ShipState{X: 2, Y: 2, Dir: Horizontal, Len: 3}
	SetCell(board, 2, 2, CellStateHit)
	SetCell(board, 3, 2, CellStateHit)
	SetCell(board, 4, 2, CellStateHit)

	if !IsShipSunk(ship, board) {
		t.Errorf("expected ship to be sunk")
	}
}

func TestAreAllShipsSunk(t *testing.T) {
	board := NewBoard()
	ships := []ShipState{
		{X: 0, Y: 0, Dir: Horizontal, Len: 2},
		{X: 3, Y: 3, Dir: Vertical, Len: 2},
	}
	SetCell(board, 0, 0, CellStateHit)
	SetCell(board, 1, 0, CellStateHit)
	SetCell(board, 3, 3, CellStateHit)
	SetCell(board, 3, 4, CellStateHit)

	if !AreAllShipsSunk(ships, board) {
		t.Errorf("expected all ships to be sunk")
	}
}

func TestNextActivePlayer(t *testing.T) {
	order := []string{"a", "b", "c"}
	players := map[string]PlayerState{
		"a": {SessionID: "a", Eliminated: false},
		"b": {SessionID: "b", Eliminated: true},
		"c": {SessionID: "c", Eliminated: false},
	}

	next, ok := NextActivePlayer("a", order, players)
	if !ok || next != "c" {
		t.Errorf("expected next player to be c, got %s", next)
	}

	first, ok := NextActivePlayer("", order, players)
	if !ok || first != "a" {
		t.Errorf("expected first player to be a, got %s", first)
	}
}
