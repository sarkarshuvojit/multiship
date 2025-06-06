package events

type InboundEventType string

const (
	Signup      InboundEventType = "SIGN_UP"
	CreateRoom                   = "CREATE_ROOM"
	JoinRoom                     = "JOIN_ROOM"
	SubmitBoard                  = "SUBMIT_BOARD"
	TryHit                       = "TRY_HIT"
	StartGame                    = "START_GAME"
)
