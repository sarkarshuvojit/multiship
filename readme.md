# Multiship

[![Run tests](https://github.com/sarkarshuvojit/multiship/actions/workflows/main.yml/badge.svg)](https://github.com/sarkarshuvojit/multiship/actions/workflows/main.yml)

A real-time multiplayer(upto 3 players at the moment) Battleship game built with Go and React. Players can create rooms, join games, and battle against multiple opponents in classic naval warfare gameplay.

## Status

**Work in Progress** - This project is actively under development. Core multiplayer functionality is implemented with ongoing enhancements to game mechanics and user experience.

## Architecture

### Backend (`multiship-backend/`)
- **Language**: Go 1.24.2
- **WebSocket Framework**: Melody (gorilla/websocket)
- **State Management**: Redis with in-memory fallback
- **Architecture**: Event-driven system with async job processing
- **Testing**: E2E WebSocket tests

### Frontend (`multiship-ui/`)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: TailwindCSS
- **WebSocket Integration**: Custom middleware with typed events

## Features

### Implemented
- Real-time WebSocket communication
- Multi-player room creation and management
- User authentication and live user tracking
- Event-driven architecture with typed events
- Background job processing for game state management
- Redis-backed state persistence
- Responsive React UI with grid-based gameplay

### In Development
- Complete Battleship game logic implementation
- Enhanced UI/UX for ship placement and targeting
- Game state synchronization improvements
- Advanced room management features

## Quick Start

### Prerequisites
- Go 1.24.2 or later
- Node.js and Yarn
- Redis (or use Docker Compose)

### Backend Setup
```bash
cd multiship-backend

# Start Redis (using Docker)
docker-compose up -d

# Run development server
make serve

# Run tests
make test
```

### Frontend Setup
```bash
cd multiship-ui

# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

## Development

### Backend Commands
- `make serve` - Start development server
- `make test` - Run all tests
- `make testv` - Run tests with verbose output
- `make testw` - Run tests in watch mode

### Frontend Commands
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run ESLint
- `yarn preview` - Preview production build

### Environment Variables
Backend configuration:
- `REDIS_URL` (default: localhost:6379)
- `REDIS_PASSWORD` (default: localpass)
- `REDIS_USERNAME` (default: empty)
- `REDIS_USE_TLS` (default: NO)
- `PORT` (default: 5000)

## Project Structure

```
multiship/
├── multiship-backend/          # Go WebSocket API server
│   ├── internal/api/          # WebSocket handlers and events
│   ├── internal/game/         # Battleship game logic
│   ├── e2e/                   # End-to-end tests
│   └── cmd/serve/             # Server entry point
└── multiship-ui/              # React frontend
    ├── src/components/        # React components
    ├── src/features/          # Redux slices
    ├── src/ws/               # WebSocket client
    └── src/types/            # TypeScript definitions
```

## Communication Protocol

The application uses a WebSocket-based real-time communication system with typed events:

- **Inbound Events**: `Signup`, `CreateRoom`, `JoinRoom`, `SubmitBoard`
- **Outbound Events**: `LiveUserUpdate`, `RoomStateUpdate`, `GameStateUpdate`
- **Event System**: Strongly typed with Go structs and TypeScript interfaces

## Testing

- **Backend**: E2E WebSocket tests covering connectivity, user management, and room operations
- **Frontend**: Component and integration tests (planned)

## Contributing

This is a work-in-progress project. Key areas for contribution:
- Game logic completion and refinement
- UI/UX improvements
- Performance optimizations
- Additional game features

## License

MIT License - see LICENSE file for details.
