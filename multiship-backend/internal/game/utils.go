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

// validateBoard validates whether a ship configuration can be placed on the board without any conflicts
// Conflicts may include
// - Incorrect amount of ships of specific lengths
// - Position overlaps
// - Position exceeding bounds
// - Position right next to another ship
func validateBoard(_ []ShipState) bool {
	return false
}
