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
