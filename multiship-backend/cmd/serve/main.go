package main

import (
	"log/slog"
	"net/http"

	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/handlers"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
)

func setupWebSockets() {
	wt := api.NewWebsocketAPI()
	wt.InitHandlers()

	// Add Dependencies
	db, err := state.NewRedisState("localhost:6379", 0, "localpass")
	if err != nil {
		panic("Cannot connect to redis")
	}
	wt.AddDependency(utils.Redis, db)

	// Add event handlers
	wt.HandleEvent(events.Signup, handlers.SignupHandler)
	wt.HandleEvent(events.CreateRoom, handlers.CreateRoomHandler)
	wt.HandleEvent(events.JoinRoom, handlers.JoinRoomHandler)
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
