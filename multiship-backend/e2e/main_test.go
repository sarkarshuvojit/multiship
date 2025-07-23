package e2e

import (
	"context"
	"log/slog"
	"os"
	"testing"
)

var shutdown context.CancelFunc

func TestMain(m *testing.M) {
	slog.SetLogLoggerLevel(slog.LevelDebug.Level())
	// Setup
	stop, ready := StartWebsocketServer()
	shutdown = stop

	<-ready
	slog.Info("Websocket Server Started")
	// Run tests
	code := m.Run()

	// Teardown
	stop()
	os.Exit(code)
}
