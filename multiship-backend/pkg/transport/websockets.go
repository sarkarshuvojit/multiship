package transport

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/google/uuid"
	"github.com/olahol/melody"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/events"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/utils"
)

type EventHandler = func(context.Context, events.InboundEvent) error

// Errors
var (
	HandlerExistsErr = errors.New("Event handler already present")
	ReqParsingErr    = errors.New("Request could not be parsed")
	UnknownEvent     = errors.New("Unknown Event")
)

type WebsocketTransport struct {
	m      *melody.Melody
	routes map[events.InboundEventType]EventHandler
}

func NewWebsocketTransport() *WebsocketTransport {
	m := melody.New()
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})
	return &WebsocketTransport{
		m:      m,
		routes: map[events.InboundEventType]EventHandler{},
	}
}

func (wt *WebsocketTransport) HandleEvent(
	eventType events.InboundEventType,
	handler EventHandler,
) error {
	if _, found := wt.routes[eventType]; found {
		return HandlerExistsErr
	}

	wt.routes[eventType] = handler
	return nil
}

func (wt WebsocketTransport) SendResponse(
	ctx context.Context,
	eventType events.OutboundEventType,
	payload any,
) {
	s := utils.GetFromContextGeneric[*melody.Session](ctx, utils.Session)
	r := events.OutboundEvent{
		EventType: eventType,
		Payload:   payload,
	}
	respBytes, _ := json.Marshal(r)
	wt.m.BroadcastMultiple(respBytes, []*melody.Session{s})
}

func (wt WebsocketTransport) SendMsgTo(
	ctx context.Context,
	eventType events.OutboundEventType,
	payload any,
	s *melody.Session,
) {
	r := events.OutboundEvent{
		EventType: eventType,
		Payload:   payload,
	}
	respBytes, _ := json.Marshal(r)
	wt.m.BroadcastMultiple(respBytes, []*melody.Session{s})
}

func (wt WebsocketTransport) SendErr(
	ctx context.Context,
	s *melody.Session,
	err error,
) {
	r := events.OutboundEvent{
		EventType: events.GeneralError,
		Payload: map[string]any{
			"msg": err.Error(),
		},
	}
	respBytes, _ := json.Marshal(r)
	wt.m.BroadcastMultiple(respBytes, []*melody.Session{s})
}

func createSessionID(s *melody.Session) string {
	newUUID, _ := uuid.NewUUID()
	sessionID := newUUID.String()
	s.Set("sessionID", sessionID)
	slog.Debug("Created new sessionID", "sessionID", sessionID)
	return sessionID
}

func (wt *WebsocketTransport) hydrateContext(
	ctx context.Context, s *melody.Session,
) context.Context {
	ctxVariables := map[utils.ContextKey]any{
		utils.WebsocketTransport: wt,
		utils.Melody:             wt.m,
		utils.Session:            s,
	}
	for k, v := range ctxVariables {
		ctx = utils.SetToContext(ctx, k, v)
	}
	return ctx
}

func (wt *WebsocketTransport) initConnectHandler() error {
	wt.m.HandleConnect(func(s *melody.Session) {
		ctx := wt.hydrateContext(context.Background(), s)
		sessionID := createSessionID(s)
		slog.Info("New buddy connected", "sessionID", sessionID)
		wt.SendResponse(ctx, events.Welcome, map[string]any{
			"msg": "Welcome to our server, your sessionID is " + sessionID,
		})
	})
	return nil
}
func (wt *WebsocketTransport) initEventHandlers() error {
	wt.m.HandleMessage(func(s *melody.Session, msg []byte) {
		ctx := context.Background()
		var req events.InboundEvent
		if err := json.Unmarshal(msg, &req); err != nil {
			wt.SendErr(ctx, s, ReqParsingErr)
			return
		}

		if routeFn, found := wt.routes[req.EventType]; found {
			ctx = wt.hydrateContext(ctx, s)
			if err := routeFn(ctx, req); err != nil {
				wt.SendErr(
					ctx, s,
					errors.Join(
						errors.New("Failed to invoke Event"),
						err,
					),
				)
				return
			}

		} else {
			wt.SendErr(ctx, s, UnknownEvent)
			return
		}

	})
	return nil
}

func (wt *WebsocketTransport) InitHandlers() error {
	return errors.Join(
		wt.initConnectHandler(),
		wt.initEventHandlers(),
	)
}
