package events

import "encoding/json"

type InboundEvent struct {
	EventType InboundEventType `json:"eventType"`
	Payload   json.RawMessage  `json:"payload"`
}

type OutboundEvent struct {
	EventType OutboundEventType `json:"eventType"`
	Payload   any               `json:"payload"`
}

type JobEvent struct {
	EventType JobEventType `json:"eventType"`
	Payload   any          `json:"payload"`
}
