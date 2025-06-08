package events

import "encoding/json"

type InboundEvent struct {
	EventType InboundEventType `json:"event_type"`
	Payload   json.RawMessage  `json:"payload"`
}

type OutboundEvent struct {
	EventType OutboundEventType `json:"event_type"`
	Payload   any               `json:"payload"`
}
