# AGENTS.md - Multiship Backend

This document provides guidance for AI agents working on the multiship-backend codebase.

## Project Overview

Go-based WebSocket server for a multiplayer Battleship game with real-time communication, async job processing, and Redis state management.

## Tech Stack

- **Language:** Go 1.21+
- **WebSocket:** melody (gorilla/websocket wrapper)
- **State:** Redis with in-memory fallback
- **Testing:** testify
- **UUID:** google/uuid

## Directory Structure

```
multiship-backend/
├── cmd/serve/main.go              # Entry point
├── internal/
│   ├── api/
│   │   ├── websockets.go          # WebSocket API core
│   │   ├── events/                # Event type definitions
│   │   │   ├── in.go              # Inbound events (client → server)
│   │   │   ├── out.go             # Outbound events (server → client)
│   │   │   ├── jobs.go            # Job event types
│   │   │   └── err.go             # Error types
│   │   ├── handlers/              # Event handlers
│   │   │   ├── auth.go            # Signup handler
│   │   │   └── room.go            # Room management handlers
│   │   ├── jobs/                  # Async job processing
│   │   │   ├── jobs.go            # Job dispatcher
│   │   │   └── game_jobs.go       # Game state jobs
│   │   ├── repo/                  # Repository layer
│   │   │   ├── room.go            # Room data access
│   │   │   └── users.go           # User data access
│   │   ├── state/                 # State management
│   │   │   ├── state.go           # State interface
│   │   │   ├── redis.go           # Redis implementation
│   │   │   ├── inmemory.go        # In-memory implementation
│   │   │   └── state_keys.go      # Key naming conventions
│   │   ├── dto/                   # Data transfer objects
│   │   └── utils/                 # Utilities
│   └── game/                      # Game logic
│       ├── multiship.go           # Room/game state
│       ├── types.go               # Domain types
│       └── utils.go               # Board validation
├── e2e/                           # End-to-end tests
└── Makefile                       # Build commands
```

## Key Patterns

### Event-Driven Architecture

All communication follows the event pattern:

```go
// Inbound (client → server)
type InboundEvent struct {
    EventType InboundEventType `json:"eventType"`
    Payload   json.RawMessage  `json:"payload"`
}

// Outbound (server → client)
type OutboundEvent struct {
    EventType OutboundEventType `json:"eventType"`
    Payload   any               `json:"payload"`
}
```

### Adding a New Event Handler

1. Define event type in `events/in.go`
2. Create handler function in `handlers/`
3. Register handler in `websockets.go` setup

```go
// 1. events/in.go
const MyNewEvent InboundEventType = "MY_NEW_EVENT"

// 2. handlers/my_handler.go
func MyNewHandler(ctx context.Context, event events.InboundEvent) error {
    db := utils.FromContext[state.State](ctx, utils.Redis)
    session := utils.FromContext[*melody.Session](ctx, utils.Session)
    // Handler logic...
    return nil
}

// 3. websockets.go
wsapi.RegisterHandler(events.MyNewEvent, handlers.MyNewHandler)
```

### State Management

All state operations go through the `State` interface:

```go
type State interface {
    Set(string, string) error
    Get(string) (string, bool)
    Has(string) (bool, error)
    Delete(string) error
    Incr(string) error
    Decr(string) error
}
```

Key naming conventions:
- Sessions: `session:<sessionID>`
- Rooms: `room:<roomID>`
- Room codes: `roomCode:<roomCode>`
- Live users: `live-users`

### Async Job Processing

Jobs are dispatched for background processing:

```go
// Dispatch a job
errChan := jobs.DispatchJob(ctx, events.JobEvent{
    Type:    events.RecomputeRoomState,
    Payload: payload,
})

// Optionally wait for result
if err := <-errChan; err != nil {
    // Handle error
}
```

### Context Pattern

Dependencies are injected via context:

```go
// Store
ctx = utils.ToContext(ctx, utils.Redis, db)

// Retrieve
db := utils.FromContext[state.State](ctx, utils.Redis)
```

## Game Domain

### Room States

1. `WAITING` - Room created, waiting for players
2. `BOARD_SELECTION` - 3 players joined, awaiting board submissions
3. `ONGOING` - All boards submitted, game active

### Player States

1. `JOINED` - Player connected to room
2. `BOARD_READY` - Board submitted and validated

### Board Validation Rules

Required ships (10 total):
- 1x length 4 (Battleship)
- 2x length 3 (Cruisers)
- 3x length 2 (Destroyers)
- 4x length 1 (Submarines)

Validation checks:
1. Correct ship count per length
2. Ships within 10x10 board boundaries
3. No overlapping ships

## Testing

### Running Tests

```bash
make test     # Run all tests
make testv    # Verbose output
make testw    # Watch mode
```

### Test Utilities (e2e/)

```go
// Create test client
client := NewTestClient(url)
defer client.Close()

// Send events
client.SendMessage(events.InboundEvent{...})

// Wait for response
msg := client.WaitForMessage(timeout)
```

### Adding E2E Tests

1. Create file in `e2e/` with `_test.go` suffix
2. Use `AssertX` helpers from `asserts.go`
3. Tests share in-memory state (reset between tests if needed)

## Environment Variables

```
REDIS_URL        # default: localhost:6379
REDIS_USERNAME   # default: ""
REDIS_PASSWORD   # default: localpass
REDIS_USE_TLS    # default: NO
PORT             # default: 5000
```

## Common Tasks

### Adding a New Outbound Event

1. Add type to `events/out.go`
2. Create payload struct in `dto/` if needed
3. Send via `wsapi.SendResponse()` or `wsapi.SendToAll()`

### Modifying Room State Transitions

Edit `jobs/game_jobs.go` - `getRoomStatusFromPlayerState()` function handles state machine logic.

### Adding Repository Methods

Add to appropriate file in `repo/` following existing patterns:
- Use `state.State` interface for data access
- JSON serialize/deserialize for complex objects
- Use `utils.QuickMarshal/QuickUnmarshal` for convenience

## Critical Notes

1. **Always dispatch RecalculateRoomState job** when room composition changes
2. **Max 3 players per room** - enforced in JoinRoomHandler
3. **Sessions expire in 30 minutes** (Redis DEFAULT_EXPIRY)
4. **Message size limit:** 2048 bytes
5. **Room codes format:** "abc-def-ghi" (3 random words)
6. **All state is JSON-serialized** - no binary formats

## Anti-Patterns to Avoid

- Don't bypass the State interface for Redis operations
- Don't send responses before handler completion
- Don't forget to dispatch room state recalculation jobs
- Don't use blocking operations in handlers without goroutines
- Don't panic on JSON errors in production code (only QuickX functions)
