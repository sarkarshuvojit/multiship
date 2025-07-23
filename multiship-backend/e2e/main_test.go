package e2e

import (
	"context"
	"log/slog"
	"os"
	"testing"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
)

var shutdown context.CancelFunc

var MockDB = state.NewInMemState()

func TestMain(m *testing.M) {
	slog.SetLogLoggerLevel(slog.LevelDebug.Level())
	// Setup
	stop, ready := StartWebsocketServer(MockDB)
	shutdown = stop

	<-ready
	slog.Info("Websocket Server Started")
	// Run tests
	code := m.Run()

	// Teardown
	stop()
	os.Exit(code)
}
