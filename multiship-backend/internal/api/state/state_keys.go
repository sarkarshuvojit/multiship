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

// SessionRoomKey maps a session to the room it is currently part of.
func SessionRoomKey(sessionID string) string {
	return "sessionRoom:" + sessionID
}
