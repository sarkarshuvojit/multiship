package events

type OutboundEventType string

const (
	SignedUp      OutboundEventType = "SIGNED_UP"
	RoomCreated                     = "ROOM_CREATED"
	GeneralError                    = "GENERAL_ERROR"
	Welcome                         = "WELCOME"
	RoomJoined                      = "ROOM_JOINED"
	NextTurn                        = "NEXT_TURN"
	HitSuccessful                   = "HIT_ATTEMPTED"
	HitFailed                       = "HIT_FAILED"
	BoardUpdated                    = "BOARD_UPDATED"
)
