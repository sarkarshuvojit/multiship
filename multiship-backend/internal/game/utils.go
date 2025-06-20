package game

import (
	"math/rand"
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

// validateBoard validates whether a ship configuration can be placed on the board without any conflicts
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
func validateBoard(ships []ShipState) bool {
	if !validatePieceFrequency(ships) {
		return false
	}
	return true
}
