package e2e

import (
	"context"
	"flag"
	"io"
	"log/slog"
	"os"
	"testing"
)

var shutdown context.CancelFunc

func TestMain(m *testing.M) {
	flag.Parse()
	if testing.Verbose() {
		slog.SetLogLoggerLevel(slog.LevelDebug.Level())
	} else {
		slog.SetDefault(slog.New(slog.NewTextHandler(io.Discard, nil)))
	}
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
