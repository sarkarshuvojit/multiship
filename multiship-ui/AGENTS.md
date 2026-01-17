# AGENTS.md - Multiship UI

This document provides guidance for AI agents working on the multiship-ui frontend codebase.

## Project Overview

React TypeScript frontend for a multiplayer Battleship game with Redux state management and WebSocket-based real-time communication.

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript 5.8
- **Build Tool:** Vite 6
- **State:** Redux Toolkit
- **Styling:** TailwindCSS v4
- **Routing:** React Router DOM 7
- **Icons:** Lucide React

## Directory Structure

```
multiship-ui/
├── src/
│   ├── app/                      # Redux configuration
│   │   ├── store.ts             # Store setup with middleware
│   │   ├── hooks.ts             # Typed useDispatch/useSelector
│   │   └── page.tsx             # Home page component
│   ├── components/              # React components
│   │   ├── auth.screen.tsx      # Signup and room selection
│   │   ├── battleship-game.tsx  # Main game screen
│   │   ├── game-board.tsx       # Game board with actions
│   │   ├── game-grid.tsx        # 10x10 grid renderer
│   │   ├── opponent-slider.tsx  # Opponent board carousel
│   │   └── battleship-testcase-generator.tsx
│   ├── features/                # Redux slices
│   │   └── health/
│   │       └── health-slice.ts  # Connection status
│   ├── types/                   # TypeScript definitions
│   │   ├── multiship.types.ts   # Domain DTOs
│   │   └── wsevents.ts          # WebSocket event types
│   ├── ws/                      # WebSocket integration
│   │   ├── ws-client.ts         # WebSocket wrapper
│   │   ├── ws-middleware.ts     # Redux middleware
│   │   ├── actions.ts           # WS action creators
│   │   └── event-handlers.ts    # Inbound event routing
│   ├── lib/
│   │   └── utils.ts             # Tailwind cn() helper
│   ├── App.tsx                  # Router setup
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind imports
├── vite.config.ts               # Vite configuration
├── tsconfig.app.json            # TypeScript config
└── package.json                 # Dependencies
```

## Key Patterns

### Redux State Management

Always use typed hooks from `app/hooks.ts`:

```typescript
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// In component
const dispatch = useAppDispatch();
const liveUsers = useAppSelector((state) => state.health.liveUsers);
```

### WebSocket Communication Flow

```
Component → dispatch(wsSend({...}))
    ↓
wsMiddleware intercepts 'ws/send' actions
    ↓
wsClient.send() → Server
    ↓
Server responds → wsClient.onMessage
    ↓
handleWsEvent() dispatches Redux actions
    ↓
Component re-renders via selector
```

### Adding a New WebSocket Event

1. Add type to `types/wsevents.ts`
2. Create action in `ws/actions.ts`
3. Add handler in `ws/event-handlers.ts`

```typescript
// 1. types/wsevents.ts
export enum InboundEventType {
  MY_EVENT = "MY_EVENT",
}

// 2. ws/actions.ts
export const MY_EVENT = (payload: MyPayload) => ({
  type: 'ws/send',
  payload: {
    eventType: InboundEventType.MY_EVENT,
    payload,
  },
});

// 3. ws/event-handlers.ts
case OutboundEventType.MY_EVENT_RESPONSE:
  store.dispatch(mySlice.actions.handleResponse(event.payload));
  break;
```

### Adding a Redux Slice

Create in `features/<feature>/<feature>-slice.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MyState {
  data: string;
}

const initialState: MyState = {
  data: '',
};

const mySlice = createSlice({
  name: 'my',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<string>) => {
      state.data = action.payload;
    },
  },
});

export const { setData } = mySlice.actions;
export default mySlice.reducer;
```

Then add to store in `app/store.ts`.

## Component Conventions

### File Naming

- Components: `kebab-case.tsx`
- Slices: `<feature>-slice.ts`
- Types: `<domain>.types.ts`

### Component Structure

```typescript
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  // Hooks at top
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectData);

  // Handlers
  const handleClick = () => {
    onAction();
  };

  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

## Styling Guidelines

### TailwindCSS Usage

Use utility classes directly:

```tsx
<div className="flex flex-col items-center justify-center bg-gray-900 text-white">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

### Class Merging

Use `cn()` from `lib/utils.ts` for conditional classes:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)} />
```

### Common Patterns

- Dark theme: `bg-gray-900`, `bg-gray-800`
- Accent colors: `text-red-500`, `text-orange-500`
- Gradients: `bg-gradient-to-r from-red-500 to-orange-500`
- Hover states: `hover:bg-gray-700`, `hover:scale-105`
- Transitions: `transition-colors duration-300`

## Development Commands

```bash
yarn dev      # Start dev server (HMR)
yarn build    # TypeScript check + production build
yarn lint     # Run ESLint
yarn preview  # Preview production build
```

## Import Aliases

Use `@/` for src imports:

```typescript
import { useAppDispatch } from '@/app/hooks';
import { cn } from '@/lib/utils';
```

## Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | AuthScreen | Signup and room selection |
| `/debugging/tcgen` | BattleshipTestcaseGenerator | Test utility |

## Event Types Reference

### Inbound (Client → Server)

- `SIGN_UP` - User authentication
- `CREATE_ROOM` - Create game room
- `JOIN_ROOM` - Join existing room
- `SUBMIT_BOARD` - Submit ship placement
- `TRY_HIT` - Attack opponent cell
- `START_GAME` - Begin game

### Outbound (Server → Client)

- `WELCOME` - Connection established
- `SIGNED_UP` - Signup confirmed
- `ROOM_CREATED` - Room creation response
- `LIVE_USERS_UPDATED` - Active user count
- `GENERAL_ERROR` - Error message
- `HIT_RESULT` - Attack outcome

## Design Guidelines

*(To be refined by user)*

## Anti-Patterns to Avoid

- Don't use plain `useDispatch`/`useSelector` - use typed hooks
- Don't create inline event handlers in JSX for complex logic
- Don't bypass Redux for shared state
- Don't use CSS files when Tailwind utilities suffice
- Don't forget to handle loading/error states for async operations
