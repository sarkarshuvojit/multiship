package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/sarkarshuvojit/multiship-backend/internal/api"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/events"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/handlers"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
)

const (
	DEFAULT_LOGICAL_REDIS_DB = 0
)

func getEnvOrDefault(key string, defaultValue string) string {
	if val, found := os.LookupEnv(key); found {
		return val
	}
	return defaultValue
}

var (
	REDIS_URL      = getEnvOrDefault("REDIS_URL", "localhost:6379")
	REDIS_USERNAME = getEnvOrDefault("REDIS_USERNAME", "")
	REDIS_PASSWORD = getEnvOrDefault("REDIS_PASSWORD", "localpass")
	REDIS_USE_TLS  = getEnvOrDefault("REDIS_USE_TLS", "NO")
	SERVER_PORT    = getEnvOrDefault("PORT", "5000")
)

func setupWebSockets() {
	wt := api.NewWebsocketAPI()
	wt.InitHandlers()

	// Add Dependencies
	db, err := state.NewRedisState(
		REDIS_URL, DEFAULT_LOGICAL_REDIS_DB,
		REDIS_PASSWORD, REDIS_USERNAME,
		REDIS_USE_TLS != "NO",
	)
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

	slog.Info("Listening on :" + SERVER_PORT)
	if err := http.ListenAndServe(":"+SERVER_PORT, nil); err != nil {
		slog.Error("Failed to start HttpServer", "err", err)
	}
}
