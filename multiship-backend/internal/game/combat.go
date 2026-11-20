package game

func NewBoard() [][]CellState {
	board := make([][]CellState, 10)
	for y := 0; y < 10; y++ {
		board[y] = make([]CellState, 10)
		for x := 0; x < 10; x++ {
			board[y][x] = CellStateHidden
		}
	}
	return board
}

func InBounds(x int, y int) bool {
	return x >= 0 && x < 10 && y >= 0 && y < 10
}

func GetCell(board [][]CellState, x int, y int) CellState {
	return board[y][x]
}

func SetCell(board [][]CellState, x int, y int, state CellState) {
	board[y][x] = state
}

func IsShipAt(ships []ShipState, x int, y int) (ShipState, bool) {
	for _, ship := range ships {
		switch ship.Dir {
		case Horizontal:
			if y != ship.Y {
				continue
			}
			if x >= ship.X && x < ship.X+ship.Len {
				return ship, true
			}
		case Vertical:
			if x != ship.X {
				continue
			}
			if y >= ship.Y && y < ship.Y+ship.Len {
				return ship, true
			}
		}
	}
	return ShipState{}, false
}

func IsShipSunk(ship ShipState, board [][]CellState) bool {
	for i := 0; i < ship.Len; i++ {
		x := ship.X
		y := ship.Y
		if ship.Dir == Horizontal {
			x = ship.X + i
		} else {
			y = ship.Y + i
		}
		if !InBounds(x, y) {
			return false
		}
		if board[y][x] != CellStateHit {
			return false
		}
	}
	return true
}

func AreAllShipsSunk(ships []ShipState, board [][]CellState) bool {
	if len(ships) == 0 {
		return false
	}
	for _, ship := range ships {
		if !IsShipSunk(ship, board) {
			return false
		}
	}
	return true
}

func NextActivePlayer(current string, order []string, players map[string]PlayerState) (string, bool) {
	if len(order) == 0 {
		return "", false
	}
	if current == "" {
		for _, id := range order {
			player, ok := players[id]
			if ok && !player.Eliminated {
				return id, true
			}
		}
		return "", false
	}

	startIdx := 0
	for i, id := range order {
		if id == current {
			startIdx = i
			break
		}
	}

	for offset := 1; offset <= len(order); offset++ {
		candidate := order[(startIdx+offset)%len(order)]
		player, ok := players[candidate]
		if !ok {
			continue
		}
		if !player.Eliminated {
			return candidate, true
		}
	}
	return "", false
}

// ShipsRemaining counts ships that still have at least one un-hit cell.
func ShipsRemaining(ships []ShipState, board [][]CellState) int {
	if len(board) == 0 {
		return len(ships)
	}
	remaining := 0
	for _, ship := range ships {
		if !IsShipSunk(ship, board) {
			remaining++
		}
	}
	return remaining
}

// SunkShips returns the ships that have been fully destroyed.
func SunkShips(ships []ShipState, board [][]CellState) []ShipState {
	sunk := []ShipState{}
	if len(board) == 0 {
		return sunk
	}
	for _, ship := range ships {
		if IsShipSunk(ship, board) {
			sunk = append(sunk, ship)
		}
	}
	return sunk
}

// ResolveTurn decides what happens after a turn-affecting change (a shot or a
// player leaving). If one or zero players remain the game is finished and the
// winner recorded; otherwise the turn passes to the next active player.
func ResolveTurn(room *RoomState) (gameOver bool) {
	active := []string{}
	for _, id := range room.PlayerSessions {
		if player, ok := room.Players[id]; ok && !player.Eliminated {
			active = append(active, id)
		}
	}

	if len(active) <= 1 {
		room.Status = RoomStatusFinished
		room.CurrentPlayer = ""
		if len(active) == 1 {
			room.WinnerID = active[0]
		}
		return true
	}

	if next, ok := NextActivePlayer(room.CurrentPlayer, room.PlayerSessions, room.Players); ok {
		room.CurrentPlayer = next
	}
	return false
}
