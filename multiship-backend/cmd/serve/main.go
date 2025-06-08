package main

import (
	"log/slog"
	"net/http"

	"github.com/sarkarshuvojit/multiship-backend/pkg/transport"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/events"
	"github.com/sarkarshuvojit/multiship-backend/pkg/transport/handlers"
)

func setupWebSockets() {
	wt := transport.NewWebsocketTransport()
	wt.InitHandlers()

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
