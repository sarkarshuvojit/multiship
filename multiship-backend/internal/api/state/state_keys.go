package state

func SessionKey(sessionID string) string {
	return "session:" + sessionID
}

func RoomKey(roomID string) string {
	return "room:" + roomID
}

func RoomCodeKey(roomCode string) string {
	return "roomCode:" + roomCode
}
