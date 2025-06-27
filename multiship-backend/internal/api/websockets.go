package api

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/google/uuid"
	"github.com/olahol/melody"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/repo"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
)

type EventHandler = func(context.Context, events.InboundEvent) error

type WebsocketAPI struct {
	m      *melody.Melody
	routes map[events.InboundEventType]EventHandler
	deps   map[utils.ContextKey]any
}

func NewWebsocketAPI() *WebsocketAPI {
	m := melody.New()
	// FIXME: Perform a back on envelope calculatation and add a justified value here
	m.Config.MaxMessageSize = 2048
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})
	return &WebsocketAPI{
		m:      m,
		routes: map[events.InboundEventType]EventHandler{},
		deps:   map[utils.ContextKey]any{},
	}
}

func (ws *WebsocketAPI) AddDependency(
	depKey utils.ContextKey,
	dep any,
) error {
	if _, found := ws.deps[depKey]; found {
		return events.DepExistsErr
	}

	ws.deps[depKey] = dep
	return nil
}

func (ws *WebsocketAPI) HandleEvent(
	eventType events.InboundEventType,
	handler EventHandler,
) error {
	if _, found := ws.routes[eventType]; found {
		return events.HandlerExistsErr
	}

	ws.routes[eventType] = handler
	return nil
}

func (ws WebsocketAPI) SendResponse(
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
	ws.m.BroadcastMultiple(respBytes, []*melody.Session{s})
}

func (ws WebsocketAPI) SendMsgTo(
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
	ws.m.BroadcastMultiple(respBytes, []*melody.Session{s})
}

func (ws WebsocketAPI) SendErr(
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
	ws.m.BroadcastMultiple(respBytes, []*melody.Session{s})
}

func (ws WebsocketAPI) SendToAll(
	ctx context.Context,
	eventType events.OutboundEventType,
	payload any,
) {
	r := events.OutboundEvent{
		EventType: eventType,
		Payload:   payload,
	}
	respBytes, _ := json.Marshal(r)
	ws.m.Broadcast(respBytes)
}

func createSessionID(s *melody.Session) string {
	newUUID, _ := uuid.NewUUID()
	sessionID := newUUID.String()
	s.Set("sessionID", sessionID)
	slog.Debug("Created new sessionID", "sessionID", sessionID)
	return sessionID
}

func (ws *WebsocketAPI) hydrateContext(
	ctx context.Context, s *melody.Session,
) context.Context {
	// ctx provided by WT
	ctxVariables := map[utils.ContextKey]any{
		utils.WebsocketAPI: ws,
		utils.Melody:       ws.m,
		utils.Session:      s,
	}
	for k, v := range ctxVariables {
		ctx = utils.SetToContext(ctx, k, v)
	}

	// Extended Dependencies
	for k, v := range ws.deps {
		ctx = utils.SetToContext(ctx, k, v)
	}
	return ctx
}

func (ws *WebsocketAPI) initConnectHandler() error {
	ws.m.HandleConnect(func(s *melody.Session) {
		ctx := ws.hydrateContext(context.Background(), s)
		sessionID := createSessionID(s)
		slog.Info("New user connected", "sessionID", sessionID)
		ws.SendResponse(ctx, events.Welcome, map[string]any{
			"msg":       "Welcome to our server",
			"sessionId": sessionID,
		})
		db := utils.GetFromContextGeneric[state.State](
			ctx, utils.Redis,
		)
		if err := repo.IncrementLiveUsers(db); err != nil {
			slog.Error("Unable to increment live user count", "err", err)
		}

		newUserVal, err := repo.GetLiveUsers(db)
		if err != nil {
			slog.Error("Unable to get live user count", "err", err)
			return
		}

		ws.SendToAll(
			ctx, events.LiveUserUpdate,
			map[string]any{
				"liveUsers": newUserVal,
			},
		)
	})
	return nil
}
func (ws *WebsocketAPI) initDisconnectHandler() error {
	ws.m.HandleDisconnect(func(s *melody.Session) {
		ctx := ws.hydrateContext(context.Background(), s)
		sessionID, found := s.Get("sessionID")
		if !found {
			return
		}
		slog.Debug("Known user disconnected", "sessionID", sessionID)
		db := utils.GetFromContextGeneric[state.State](
			ctx, utils.Redis,
		)
		if err := repo.DecrementLiveUsers(db); err != nil {
			slog.Error("Unable to increment live user count", "err", err)
			return
		}

		newUserVal, err := repo.GetLiveUsers(db)
		if err != nil {
			slog.Error("Unable to get live user count", "err", err)
			return
		}

		ws.SendToAll(
			ctx, events.LiveUserUpdate,
			map[string]any{
				"liveUsers": newUserVal,
			},
		)
	})
	return nil
}

func (ws *WebsocketAPI) initEventHandler() error {
	ws.m.HandleMessage(func(s *melody.Session, msg []byte) {
		ctx := context.Background()
		var req events.InboundEvent
		if err := json.Unmarshal(msg, &req); err != nil {
			ws.SendErr(ctx, s, events.ReqParsingErr)
			return
		}

		// Event routing
		if routeFn, found := ws.routes[req.EventType]; found {
			ctx = ws.hydrateContext(ctx, s)
			if err := routeFn(ctx, req); err != nil {
				ws.SendErr(ctx, s, err)
				return
			}

		} else {
			ws.SendErr(ctx, s, events.UnknownEventErr)
			return
		}

	})
	return nil
}

func (ws *WebsocketAPI) InitHandlers() error {
	return errors.Join(
		ws.initDisconnectHandler(),
		ws.initConnectHandler(),
		ws.initEventHandler(),
	)
}
