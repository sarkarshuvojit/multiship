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

	UnknownJobErr = errors.New("Unknown Job")
)
