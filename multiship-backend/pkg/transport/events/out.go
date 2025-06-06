package events

type OutboundEventType string

const (
	SignedUp     OutboundEventType = "SignedUp"
	RoomCreated                    = "RoomCreated"
	GeneralError                   = "GeneralError"
	Welcome                        = "Welcome"
)
