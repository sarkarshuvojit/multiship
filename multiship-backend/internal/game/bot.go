package game

import "math/rand"

// Bots are plain rule-based players: a random-but-legal fleet layout and a
// classic "probability density" hunt/target gunner. No learning, no lookahead,
// and they only ever read public information (shot results and sunk ships).

// Fleet is the ship lengths every board must contain.
var Fleet = []int{4, 3, 3, 2, 2, 2, 1, 1, 1, 1}

// BotNames are handed out in order to bots joining a room.
var BotNames = []string{"Admiral Byte", "Captain Cog", "Commodore Relay", "Ensign Ohm"}

const BotAvatar = "🤖"

// PlaceBotFleet lays out a valid fleet with no two ships touching (diagonals
// included), which makes the bot's board a little harder to read.
func PlaceBotFleet(rng *rand.Rand) []ShipState {
	for {
		if ships, ok := tryPlaceFleet(rng); ok {
			return ships
		}
	}
}

func tryPlaceFleet(rng *rand.Rand) ([]ShipState, bool) {
	var blocked [10][10]bool
	ships := make([]ShipState, 0, len(Fleet))
	for _, length := range Fleet {
		placed := false
		for tries := 0; tries < 200 && !placed; tries++ {
			ship := ShipState{X: rng.Intn(10), Y: rng.Intn(10), Dir: Horizontal, Len: length}
			if rng.Intn(2) == 0 {
				ship.Dir = Vertical
			}
			cells := shipCells(ship)
			ok := true
			for _, c := range cells {
				if !InBounds(c[0], c[1]) || blocked[c[1]][c[0]] {
					ok = false
					break
				}
			}
			if !ok {
				continue
			}
			for _, c := range cells {
				for dy := -1; dy <= 1; dy++ {
					for dx := -1; dx <= 1; dx++ {
						if InBounds(c[0]+dx, c[1]+dy) {
							blocked[c[1]+dy][c[0]+dx] = true
						}
					}
				}
			}
			ships = append(ships, ship)
			placed = true
		}
		if !placed {
			return nil, false
		}
	}
	return ships, true
}

func shipCells(ship ShipState) [][2]int {
	cells := make([][2]int, ship.Len)
	for i := range ship.Len {
		if ship.Dir == Horizontal {
			cells[i] = [2]int{ship.X + i, ship.Y}
		} else {
			cells[i] = [2]int{ship.X, ship.Y + i}
		}
	}
	return cells
}

// BotShot is a bot's chosen move.
type BotShot struct {
	TargetID string
	X, Y     int
}

// ChooseBotShot picks the bot's next shot. Target choice: finish off a fleet
// that has a wounded ship first, otherwise go after whoever has the fewest
// ships afloat (ties broken by seat order). Cell choice: see bestCell.
func ChooseBotShot(room *RoomState, botID string) (BotShot, bool) {
	bestID := ""
	bestWounded, bestRemaining := -1, 0
	for _, id := range room.PlayerSessions {
		if id == botID {
			continue
		}
		p, ok := room.Players[id]
		if !ok || p.Eliminated {
			continue
		}
		board := p.Board
		if len(board) == 0 {
			board = NewBoard()
		}
		wounded := len(woundedCells(board, SunkShips(p.Ships, board)))
		remaining := ShipsRemaining(p.Ships, board)
		better := bestID == "" ||
			(wounded > 0) != (bestWounded > 0) && wounded > 0 ||
			(wounded > 0) == (bestWounded > 0) && remaining < bestRemaining
		if better {
			bestID, bestWounded, bestRemaining = id, wounded, remaining
		}
	}
	if bestID == "" {
		return BotShot{}, false
	}
	p := room.Players[bestID]
	board := p.Board
	if len(board) == 0 {
		board = NewBoard()
	}
	x, y, ok := bestCell(board, SunkShips(p.Ships, board))
	if !ok {
		return BotShot{}, false
	}
	return BotShot{TargetID: bestID, X: x, Y: y}, true
}

// woundedCells are hits that do not belong to a ship already sunk.
func woundedCells(board [][]CellState, sunk []ShipState) map[[2]int]bool {
	sunkCells := map[[2]int]bool{}
	for _, s := range sunk {
		for _, c := range shipCells(s) {
			sunkCells[c] = true
		}
	}
	wounded := map[[2]int]bool{}
	for y := range 10 {
		for x := range 10 {
			if board[y][x] == CellStateHit && !sunkCells[[2]int{x, y}] {
				wounded[[2]int{x, y}] = true
			}
		}
	}
	return wounded
}

// bestCell scores every hidden cell by how many ways the enemy's remaining
// ships could still cover it, and fires at the highest score.
//
//   - Hunt mode (nothing wounded): every legal placement counts once.
//   - Target mode (a wounded ship exists): only placements running through the
//     wounded cells count, weighted by how many of them they cover, so the bot
//     probes neighbours and then follows the line once it has two hits.
//
// Ties go to the cell nearest the centre, then scan order, so the same board
// always produces the same shot.
func bestCell(board [][]CellState, sunk []ShipState) (int, int, bool) {
	remaining := remainingLengths(sunk)
	wounded := woundedCells(board, sunk)
	sunkCells := map[[2]int]bool{}
	for _, s := range sunk {
		for _, c := range shipCells(s) {
			sunkCells[c] = true
		}
	}

	var score [10][10]int
	accumulate := func(targetMode bool) bool {
		any := false
		for _, length := range remaining {
			for _, dir := range []ShipDirection{Horizontal, Vertical} {
				if length == 1 && dir == Vertical {
					continue
				}
				for y := range 10 {
					for x := range 10 {
						cells := shipCells(ShipState{X: x, Y: y, Dir: dir, Len: length})
						covered, legal := 0, true
						for _, c := range cells {
							if !InBounds(c[0], c[1]) || board[c[1]][c[0]] == CellStateMiss || sunkCells[c] {
								legal = false
								break
							}
							if wounded[c] {
								covered++
							}
						}
						if !legal || (targetMode && covered == 0) {
							continue
						}
						weight := 1
						if targetMode {
							weight = covered * covered * 10
						}
						for _, c := range cells {
							if board[c[1]][c[0]] == CellStateHidden {
								score[c[1]][c[0]] += weight
								any = true
							}
						}
					}
				}
			}
		}
		return any
	}

	if !(len(wounded) > 0 && accumulate(true)) {
		score = [10][10]int{}
		accumulate(false)
	}

	// Most captains leave water between ships, so cells hugging a sunk ship
	// are unlikely (but, since touching is legal here, never ruled out).
	var nearSunk [10][10]bool
	for c := range sunkCells {
		for dy := -1; dy <= 1; dy++ {
			for dx := -1; dx <= 1; dx++ {
				if InBounds(c[0]+dx, c[1]+dy) {
					nearSunk[c[1]+dy][c[0]+dx] = true
				}
			}
		}
	}

	bx, by, best, bestDist := -1, -1, 0, 0
	for y := range 10 {
		for x := range 10 {
			if board[y][x] != CellStateHidden {
				continue
			}
			s := score[y][x] * 8
			if nearSunk[y][x] {
				s /= 8
			}
			// Distance from centre, doubled to stay integral.
			dist := abs(2*x-9) + abs(2*y-9)
			if bx == -1 || s > best || s == best && dist < bestDist {
				bx, by, best, bestDist = x, y, s, dist
			}
		}
	}
	return bx, by, bx != -1
}

func remainingLengths(sunk []ShipState) []int {
	left := append([]int(nil), Fleet...)
	for _, s := range sunk {
		for i, l := range left {
			if l == s.Len {
				left = append(left[:i], left[i+1:]...)
				break
			}
		}
	}
	return left
}

func abs(v int) int {
	if v < 0 {
		return -v
	}
	return v
}
