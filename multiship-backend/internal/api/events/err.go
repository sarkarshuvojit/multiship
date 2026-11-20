package events

import "errors"

var (
	HandlerExistsErr      = errors.New("Event handler already present")
	DepExistsErr          = errors.New("Dependency already present")
	ReqParsingErr         = errors.New("Request could not be parsed")
	UnknownEventErr       = errors.New("Unknown Event")
	UnauthenticatedErr    = errors.New("Unauthenticated: Sign in first")
	RoomCreationFailedErr = errors.New("Failed to create room")
	RoomUpdationFailedErr = errors.New("Failed to create room")
	RoomNotFound          = errors.New("Room not found")
	RoomFull              = errors.New("Room already full")
	RoomAlreadyJoined     = errors.New("Already in room")

	UnknownJobErr         = errors.New("Unknown Job")
	RoomAlreadyJoinedErr  = errors.New("Already in room")
	NotInRoomErr          = errors.New("User not in current room")
	InvalidShipConfigErr  = errors.New("Ship configuration invalid")
	GameNotOngoingErr     = errors.New("Game is not active")
	NotPlayersTurnErr     = errors.New("Not your turn")
	InvalidTargetErr      = errors.New("Invalid target")
	InvalidCoordinatesErr = errors.New("Invalid coordinates")
	CellAlreadyHitErr     = errors.New("Cell already hit")
	TargetEliminatedErr   = errors.New("Target already eliminated")
	TurnNotInitializedErr = errors.New("Turn not initialized")
)
