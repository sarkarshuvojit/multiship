package game

import (
	"math/rand"
	"reflect"
	"runtime"
	"strings"
)

func createRoomCode() string {
	return strings.Join([]string{
		getWord(),
		getWord(),
		getWord(),
	}, "-")
}

func getWord() string {
	letters := []rune("abcdefghijklmnopqrstuvwxyz")
	var b strings.Builder
	for range 3 {
		b.WriteRune(letters[rand.Intn(len(letters))])
	}
	return b.String()
}

func getFuncName(i any) string {
	return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
}

// ValidateBoard validates whether a ship configuration can be placed on the board without any conflicts
// Conflicts may include
// - Incorrect amount of ships of specific lengths
// - Position overlaps
// - Position exceeding bounds
// - Position right next to another ship
//
// Required Ships
// 1 ship of length  4 (Battleship)
// 2 ships of length 3 (Cruisers)
// 3 ships of length 2 (Destroyers)
// 4 ships of length 1 (Submarines)
func ValidateBoard(ships []ShipState) bool {
	validators := []func([]ShipState) bool{
		validatePieceFrequency,
		validateBoundaries,
		validateOverlaps,
	}
	for _, validateFn := range validators {
		if !validateFn(ships) {
			return false
		}
	}
	return true
}

func validateOverlaps(ships []ShipState) bool {
	grid := [10][10]bool{}
	for _, ship := range ships {
		if ship.Dir == Horizontal {
			for i := range ship.Len {
				if grid[ship.X+i][ship.Y] {
					// overlap detected
					return false
				}
				grid[ship.X+i][ship.Y] = true
			}
		} else {
			for i := range ship.Len {
				if grid[ship.X][ship.Y+i] {
					// overlap detected
					return false
				}
				grid[ship.X][ship.Y+i] = true
			}
		}
	}
	return true
}

func validatePieceFrequency(ships []ShipState) bool {
	if len(ships) != 10 {
		return false
	}
	lenfreq := map[int]int{}
	for _, ship := range ships {
		if cur, ok := lenfreq[ship.Len]; ok {
			lenfreq[ship.Len] = cur + 1
		} else {
			lenfreq[ship.Len] = 1
		}
	}
	expectedLenfreq := map[int]int{
		1: 4, //(Battleship)
		2: 3, //(Cruisers)
		3: 2, //(Destroyers)
		4: 1, //(Submarines)
	}
	for key, value := range lenfreq {
		if expectedLenfreq[key] != value {
			return false
		}
	}
	return true
}

func validateBoundaries(ships []ShipState) bool {
	for _, ship := range ships {
		var target int
		if ship.Dir == Horizontal {
			target = ship.X
		} else if ship.Dir == Vertical {
			target = ship.Y
		} else {
			return false
		}

		if target+ship.Len-1 > 9 {
			return false
		}
	}
	return true
}
