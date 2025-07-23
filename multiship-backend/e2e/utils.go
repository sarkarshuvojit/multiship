package e2e

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/handlers"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
)

func GetEnvOrDefault(key string, defaultValue string) string {
	if val, found := os.LookupEnv(key); found {
		return val
	}
	return defaultValue
}

var TestServerPort string = GetEnvOrDefault("PORT", "5555")

var MockDB = state.NewInMemState()

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

func StartWebsocketServer(db state.State) (func(), chan bool) {
	ctx, cancel := context.WithCancel(
		context.Background(),
	)
	ready := make(chan bool)
	go func(context context.Context, _db state.State) {
		wt := api.NewWebsocketAPI()
		wt.InitHandlers()

		// Add Dependencies
		wt.AddDependency(utils.Redis, _db)

		// Add event handlers
		wt.HandleEvent(events.Signup, handlers.SignupHandler)
		wt.HandleEvent(events.CreateRoom, handlers.CreateRoomHandler)
		wt.HandleEvent(events.JoinRoom, handlers.JoinRoomHandler)
		wt.HandleEvent(events.SubmitBoard, handlers.SubmitBoardHandler)

		ready <- true
		slog.Error("Http Server Error", "err", http.ListenAndServe(":"+TestServerPort, nil))
	}(ctx, db)

	return cancel, ready
}
