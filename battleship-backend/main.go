package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/google/uuid"
	"github.com/olahol/melody"
)

func createSessionID(s *melody.Session) string {
	newUUID, _ := uuid.NewUUID()
	sessionID := newUUID.String()
	s.Set("sessionID", sessionID)
	slog.Debug("Created new sessionID", "sessionID", sessionID)
	return sessionID
}

type Req struct {
	EventType string          `json:"event_type"`
	Payload   json.RawMessage `json:"payload"`
}

type Res struct {
	EventType string `json:"event_type"`
	Payload   any    `json:"payload"`
}

type SignupDto struct {
	Email string `json:"email"`
}

type MsgHandler = func(context.Context, Req, *melody.Session, *melody.Melody) error

func SignupHandler(
	ctx context.Context,
	msg Req,
	s *melody.Session,
	m *melody.Melody,
) error {
	var payload SignupDto
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		return err
	}
	slog.Debug("Handling signup", "req", payload)
	fmt.Println(payload.Email)
	sendMsg(
		m, s,
		"SIGNED_UP",
		map[string]any{
			"msg": "Signup successful",
		},
	)
	return nil
}

var routes map[string]MsgHandler

func setupWebSockets(ctx context.Context) {
	routes = map[string]MsgHandler{
		"signup": SignupHandler,
	}
	m := melody.New()
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})
	m.HandleConnect(func(s *melody.Session) {
		sessionID := createSessionID(s)
		slog.Info("New buddy connected", "sessionID", sessionID)
		sendMsg(m, s, "WELCOME", map[string]any{
			"msg": "Welcome to our server, your sessionID is " + sessionID,
		})
	})
	m.HandleMessage(func(s *melody.Session, msg []byte) {
		var req Req
		if err := json.Unmarshal(msg, &req); err != nil {
			sendError(m, s, errors.New("Request could not be parsed"))
			return
		}

		if routeFn, found := routes[req.EventType]; found {
			if err := routeFn(ctx, req, s, m); err != nil {
				sendError(
					m, s,
					errors.Join(
						errors.New("Failed to invoke Event: "+req.EventType),
						err,
					),
				)
				return
			}

		} else {
			sendError(m, s, errors.New("Unknown Event: "+req.EventType))
			return
		}

	})
}

func sendMsg(
	m *melody.Melody,
	s *melody.Session,
	eventType string,
	payload any,
) {
	r := Res{
		EventType: eventType,
		Payload:   payload,
	}
	respBytes, _ := json.Marshal(r)
	m.BroadcastMultiple(respBytes, []*melody.Session{s})
}

func sendError(m *melody.Melody, s *melody.Session, err error) {
	r := Res{
		EventType: "error",
		Payload: map[string]any{
			"msg": err.Error(),
		},
	}
	respBytes, _ := json.Marshal(r)
	m.BroadcastMultiple(respBytes, []*melody.Session{s})
}

func main() {
	slog.SetLogLoggerLevel(slog.LevelDebug.Level())
	ctx := context.Background()
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if _, err := w.Write([]byte(`gggg`)); err != nil {
			slog.Error("Failed to send response")
		}
	})

	setupWebSockets(ctx)

	slog.Info("Listening on :5000")
	http.ListenAndServe(":5000", nil)
}
