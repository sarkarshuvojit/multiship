# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack multiplayer Battleship game with two main components:
- `multiship-backend/` - Go backend with WebSocket API and Redis state management
- `multiship-ui/` - React TypeScript frontend with Redux Toolkit state management

## Development Commands

### Backend (Go)
```bash
cd multiship-backend
make serve           # Start the development server
make test           # Run all tests
make testv          # Run tests with verbose output
make testw          # Run tests in watch mode (requires air)
```

### Frontend (React/TypeScript)
```bash
cd multiship-ui
yarn dev            # Start development server
yarn build          # Build for production (includes TypeScript compilation)
yarn lint           # Run ESLint
yarn preview        # Preview production build
```

### Infrastructure
```bash
cd multiship-backend
docker-compose up   # Start Redis instance for local development
```

## Architecture Overview

### Backend Architecture
- **WebSocket API**: Built with `melody` package for real-time communication
- **Event-driven system**: Uses typed events for inbound/outbound WebSocket communication
- **State management**: Redis-backed state with in-memory fallback
- **Job system**: Async job processing for game state recalculation
- **Repository pattern**: Data access layer for users and rooms

Key backend packages:
- `internal/api/websockets.go` - Main WebSocket API implementation
- `internal/api/events/` - Event type definitions and routing
- `internal/api/handlers/` - Event handlers (signup, room management, board submission)
- `internal/api/jobs/` - Background job processing
- `internal/api/state/` - Redis and in-memory state implementations
- `internal/game/` - Core Battleship game logic

### Frontend Architecture
- **React 19** with **TypeScript** and **Vite**
- **Redux Toolkit** for state management with custom WebSocket middleware
- **TailwindCSS** for styling
- **React Router** for navigation

Key frontend structure:
- `src/ws/` - WebSocket client and Redux middleware
- `src/features/` - Redux slices organized by feature
- `src/components/` - React components for game UI
- `src/types/` - TypeScript type definitions for WebSocket events and game state

### Communication Protocol
- WebSocket-based real-time communication
- Typed event system with `InboundEvent` and `OutboundEvent` interfaces
- Events include: `Signup`, `CreateRoom`, `JoinRoom`, `SubmitBoard`, `LiveUserUpdate`

## Testing

### Backend Tests
- E2E tests in `multiship-backend/e2e/` test WebSocket functionality
- Tests cover basic connectivity, user management, room creation, and game flow
- Use `make test` or `make testv` to run tests

### Environment Variables
Backend accepts these environment variables:
- `REDIS_URL` (default: localhost:6379)
- `REDIS_PASSWORD` (default: localpass)
- `REDIS_USERNAME` (default: empty)
- `REDIS_USE_TLS` (default: NO)
- `PORT` (default: 5000)

## Current Branch Context
Working on `feat/async-jobs` branch which implements background job processing for game state management.