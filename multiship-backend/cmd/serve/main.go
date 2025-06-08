package main

import (
	"log/slog"
	"net/http"

	"github.com/sarkarshuvojit/multiship-backend/internal/transport"
	"github.com/sarkarshuvojit/multiship-backend/internal/transport/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/transport/handlers"
	"github.com/sarkarshuvojit/multiship-backend/internal/transport/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/transport/utils"
)

func setupWebSockets() {
	wt := transport.NewWebsocketTransport()
	wt.InitHandlers()

	// Add Dependencies
	db, err := state.NewRedisState("localhost:6379", 0, "localpass")
	if err != nil {
		panic("Cannot connect to redis")
	}
	wt.AddDependency(utils.Redis, db)

	// Add event handlers
	wt.HandleEvent(events.Signup, handlers.SignupHandler)
}

func main() {
	slog.SetLogLoggerLevel(slog.LevelDebug.Level())
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if _, err := w.Write([]byte(`gggg`)); err != nil {
			slog.Error("Failed to send response")
		}
	})

	setupWebSockets()

	slog.Info("Listening on :5000")
	http.ListenAndServe(":5000", nil)
}
