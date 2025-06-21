package repo

import (
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
	"github.com/sarkarshuvojit/multiship-backend/internal/game"
)

func CreateRoom(
	db state.State,
	sessionID string,
) (*game.RoomState, error) {

	room := game.NewRoom(sessionID)

	if err := db.Set(
		state.RoomKey(room.RoomID),
		utils.QuickMarshal(room),
	); err != nil {
		return nil, events.RoomCreationFailedErr
	}

	// Reverse lookup roomCode -> roomId
	if err := db.Set(
		state.RoomCodeKey(room.Code),
		room.RoomID,
	); err != nil {
		return nil, events.RoomCreationFailedErr
	}

	return room, nil
}

func GetRoomByRoomCode(db state.State,
	roomCode string,
) (*game.RoomState, error) {

	roomID, found := db.Get(state.RoomCodeKey(roomCode))
	if !found {
		return nil, events.RoomNotFound
	}
	return GetRoomByID(db, roomID)
}

func UpdateRoom(
	db state.State,
	newRoom *game.RoomState,
) error {

	if err := db.Set(
		state.RoomKey(newRoom.RoomID),
		utils.QuickMarshal(newRoom),
	); err != nil {
		return events.RoomUpdationFailedErr
	}

	return nil
}

func GetRoomByID(
	db state.State,
	roomID string,
) (*game.RoomState, error) {

	content, found := db.Get(state.RoomKey(roomID))
	if !found {
		return nil, events.RoomNotFound
	}

	var room game.RoomState
	utils.QuickUnmarshal(content, &room)

	return &room, nil
}
