package repo

import (
	"github.com/sarkarshuvojit/multiship-backend/internal/api/dto"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
)

func CreateRoom(
	db state.State,
	sessionID string,
) (*dto.RoomState, error) {

	room := dto.NewRoom(sessionID)

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

func GetRoomByRoomCode(
	db state.State,
	roomCode string,
) (*dto.RoomState, error) {

	roomID, found := db.Get(state.RoomCodeKey(roomCode))
	if !found {
		return nil, events.RoomNotFound
	}
	content, found := db.Get(state.RoomKey(roomID))
	if !found {
		return nil, events.RoomNotFound
	}

	var room dto.RoomState
	utils.QuickUnmarshal(content, &room)

	return &room, nil
}

func UpdateRoom(
	db state.State,
	newRoom *dto.RoomState,
) error {

	if err := db.Set(
		state.RoomKey(newRoom.RoomID),
		utils.QuickMarshal(newRoom),
	); err != nil {
		return events.RoomUpdationFailedErr
	}

	return nil
}
