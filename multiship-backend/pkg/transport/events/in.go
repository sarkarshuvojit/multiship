package events

type InboundEventType string

const (
	Signup     InboundEventType = "Signup"
	CreateRoom                  = "CreateRoom"
)
