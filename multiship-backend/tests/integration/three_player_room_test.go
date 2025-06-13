package integration

import (
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
	"github.com/stretchr/testify/assert"
)

type TestClient struct {
	conn     *websocket.Conn
	messages chan events.OutboundEvent
	errors   chan error
	done     chan struct{}
	email    string
}

func NewTestClient(serverURL string) (*TestClient, error) {
	dialer := &websocket.Dialer{}
	conn, _, err := dialer.Dial(serverURL, nil)
	if err != nil {
		return nil, err
	}

	client := &TestClient{
		conn:     conn,
		messages: make(chan events.OutboundEvent, 10),
		errors:   make(chan error, 10),
		done:     make(chan struct{}),
	}

	go client.readMessages()
	return client, nil
}

func (c *TestClient) readMessages() {
	defer close(c.done)

	for {
		_, msgBytes, err := c.conn.ReadMessage()
		if err != nil {
			c.errors <- err
			return
		}

		var msg events.OutboundEvent
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			c.errors <- err
			continue
		}

		c.messages <- msg
	}
}

func (c *TestClient) SendMessage(msgType events.InboundEventType, data any) error {
	dataRaw := utils.QuickMarshal(data)
	msg := events.InboundEvent{
		EventType: msgType,
		Payload:   []byte(dataRaw),
	}

	msgBytes, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	return c.conn.WriteMessage(websocket.TextMessage, msgBytes)
}

func (c *TestClient) WaitForMessage(expectedType events.OutboundEventType, timeout time.Duration) (*events.OutboundEvent, error) {
	timer := time.NewTimer(timeout)
	defer timer.Stop()

	for {
		select {
		case msg := <-c.messages:
			if msg.EventType == expectedType {
				return &msg, nil
			}
		case err := <-c.errors:
			return nil, err
		case <-timer.C:
			return nil, fmt.Errorf("timeout waiting for message type: %s", expectedType)
		case <-c.done:
			return nil, fmt.Errorf("connection closed")
		}
	}
}

func (c *TestClient) Close() error {
	return c.conn.Close()
}

func TestMultiClientRoomInteraction(t *testing.T) {
	url := "ws://localhost:5000/ws"
	// Create three WebSocket connections
	c1, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c1.Close()

	c2, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c2.Close()

	c3, err := NewTestClient(url)
	assert.NoError(t, err)
	defer c3.Close()

	// Generate random emails for each connection
	email1 := fmt.Sprintf("user1_%d@test.com", time.Now().UnixNano())
	email2 := fmt.Sprintf("user2_%d@test.com", time.Now().UnixNano())
	email3 := fmt.Sprintf("user3_%d@test.com", time.Now().UnixNano())

	var roomCode string

	// Test c1: SIGNUP and CREATE_ROOM
	t.Run("Client1_SignupAndCreateRoom", func(t *testing.T) {
		// Send SIGNUP message
		err := c1.SendMessage(events.Signup, map[string]any{
			"email": email1,
		})
		assert.NoError(t, err)

		// Wait for SIGNED_UP response
		msg, err := c1.WaitForMessage(events.SignedUp, 5*time.Second)
		assert.NoError(t, err)
		assert.Equal(t, events.SignedUp, msg.EventType)

		// Send CREATE_ROOM message
		err = c1.SendMessage(events.CreateRoom, nil)
		assert.NoError(t, err)

		// Wait for ROOM_CREATED response and capture roomCode
		msg, err = c1.WaitForMessage(events.RoomCreated, 5*time.Second)
		assert.NoError(t, err)

		data := msg.Payload.(map[string]any)
		roomCode = data["payload"].(map[string]any)["roomCode"].(string)

		assert.NotEmpty(t, roomCode)
	})

	// Test c2: SIGNUP and JOIN_ROOM
	t.Run("Client2_SignupAndJoinRoom", func(t *testing.T) {
		// Send SIGNUP message
		err := c2.SendMessage(events.Signup, map[string]any{
			"email": email2,
		})
		assert.NoError(t, err)

		// Wait for SIGNED_UP response
		_, signuperr := c2.WaitForMessage(events.SignedUp, 5*time.Second)
		assert.NoError(t, signuperr)

		// Send JOIN_ROOM message with captured roomCode
		err = c2.SendMessage(events.JoinRoom, map[string]any{
			"roomCode": roomCode,
		})
		assert.NoError(t, err)

		// Wait for ROOM_JOINED response
		_, err = c2.WaitForMessage(events.RoomJoined, 5*time.Second)
		assert.NoError(t, err)
	})

	// Test c3: SIGNUP and JOIN_ROOM
	t.Run("Client3_SignupAndJoinRoom", func(t *testing.T) {
		// Send SIGNUP message
		err := c3.SendMessage(events.Signup, map[string]any{
			"email": email3,
		})
		assert.NoError(t, err)

		// Wait for SIGNED_UP response
		_, signuperr := c3.WaitForMessage(events.SignedUp, 5*time.Second)
		assert.NoError(t, signuperr)

		// Send JOIN_ROOM message with captured roomCode
		err = c3.SendMessage(events.JoinRoom, map[string]any{
			"roomCode": roomCode,
		})
		assert.NoError(t, err)

		// Wait for ROOM_JOINED response
		_, err = c3.WaitForMessage(events.RoomJoined, 5*time.Second)
		assert.NoError(t, err)
	})

}
