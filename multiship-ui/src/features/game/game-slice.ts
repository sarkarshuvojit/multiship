import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  GameOverPayload,
  HitAttemptedPayload,
  PlayerEliminatedPayload,
  RoomView,
  ShipState,
  ShipSunkPayload,
} from '@/types/multiship.types';
import type { GameLogEvent } from '@/components/layout/RetroGameLog';

export interface GameStats {
  hits: number;
  misses: number;
  shipsSunk: number;
}

interface GameSlice {
  connected: boolean;
  sessionId: string | null;
  name: string;
  avatar: string;
  signedUp: boolean;
  pending: boolean;
  room: RoomView | null;
  myShips: ShipState[];
  boardSubmitted: boolean;
  log: GameLogEvent[];
  stats: GameStats;
  lastAttackerId: string | null;
  error: string | null;
}

const emptyStats: GameStats = { hits: 0, misses: 0, shipsSunk: 0 };

const initialState: GameSlice = {
  connected: false,
  sessionId: null,
  name: '',
  avatar: '',
  signedUp: false,
  pending: false,
  room: null,
  myShips: [],
  boardSubmitted: false,
  log: [],
  stats: emptyStats,
  lastAttackerId: null,
  error: null,
};

let logCounter = 0;
const timestamp = () => new Date().toLocaleTimeString([], { hour12: false });
const coord = (x: number, y: number) => `${String.fromCharCode(65 + x)}${y + 1}`;

function nameOf(state: GameSlice, sessionId: string): string {
  if (sessionId === state.sessionId) return 'You';
  return state.room?.players.find((p) => p.sessionId === sessionId)?.name ?? 'Unknown';
}

function pushLog(state: GameSlice, message: string, type: GameLogEvent['type']) {
  state.log.push({ id: `log-${++logCounter}`, message, type, timestamp: timestamp() });
  if (state.log.length > 100) state.log.shift();
}

function resetRoom(state: GameSlice) {
  state.room = null;
  state.myShips = [];
  state.boardSubmitted = false;
  state.log = [];
  state.stats = { ...emptyStats };
  state.lastAttackerId = null;
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    connected: (state, action: PayloadAction<{ sessionId: string }>) => {
      state.connected = true;
      state.sessionId = action.payload.sessionId;
    },
    disconnected: (state) => {
      // The server issues a fresh session on reconnect, so everything resets.
      Object.assign(state, initialState, {
        name: state.name,
        avatar: state.avatar,
        error: 'Connection lost. Reconnecting...',
      });
    },
    signupRequested: (state, action: PayloadAction<{ name: string; avatar: string }>) => {
      state.name = action.payload.name;
      state.avatar = action.payload.avatar;
      state.pending = true;
      state.error = null;
    },
    signedUp: (state, action: PayloadAction<{ sessionId: string }>) => {
      state.signedUp = true;
      state.pending = false;
      state.sessionId = action.payload.sessionId ?? state.sessionId;
    },
    roomRequested: (state) => {
      state.pending = true;
      state.error = null;
    },
    roomEntered: (state) => {
      state.pending = false;
      resetRoom(state);
    },
    roomLeft: (state) => {
      state.pending = false;
      resetRoom(state);
    },
    roomStateReceived: (state, action: PayloadAction<RoomView>) => {
      const prev = state.room;
      const next = action.payload;
      state.pending = false;

      if (!prev || prev.roomId !== next.roomId) {
        resetRoom(state);
      }
      if (prev && prev.roomId === next.roomId) {
        if (prev.status !== 'BOARD_SELECTION' && next.status === 'BOARD_SELECTION') {
          pushLog(state, 'Deploy your fleet!', 'system');
        }
        if (prev.status !== 'ONGOING' && next.status === 'ONGOING') {
          pushLog(state, 'Battle stations! The fight begins.', 'system');
        }
        const prevIds = new Set(prev.players.map((p) => p.sessionId));
        const nextIds = new Set(next.players.map((p) => p.sessionId));
        next.players
          .filter((p) => !prevIds.has(p.sessionId))
          .forEach((p) => pushLog(state, `${p.name} joined the room`, 'system'));
        prev.players
          .filter((p) => !nextIds.has(p.sessionId))
          .forEach((p) => pushLog(state, `${p.name} left the room`, 'system'));
      }
      state.room = next;
      if (next.status === 'WAITING' || next.status === 'IDLE') {
        state.boardSubmitted = false;
      }
    },
    boardSubmitRequested: (state, action: PayloadAction<ShipState[]>) => {
      state.myShips = action.payload;
      state.pending = true;
      state.error = null;
    },
    boardSubmitted: (state) => {
      state.pending = false;
      state.boardSubmitted = true;
    },
    nextTurn: (state, action: PayloadAction<{ currentPlayerId: string }>) => {
      const id = action.payload.currentPlayerId;
      if (state.room) state.room.currentPlayer = id;
      pushLog(state, id === state.sessionId ? 'Your turn — fire!' : `${nameOf(state, id)}'s turn`, 'turn');
    },
    hitAttempted: (state, action: PayloadAction<HitAttemptedPayload>) => {
      const p = action.payload;
      const hit = p.result === 'HIT';
      state.lastAttackerId = p.attackerSessionId;
      if (p.attackerSessionId === state.sessionId) {
        if (hit) state.stats.hits++;
        else state.stats.misses++;
      }
      pushLog(
        state,
        `${nameOf(state, p.attackerSessionId)} → ${nameOf(state, p.targetSessionId)} @ ${coord(p.x, p.y)}: ${hit ? 'HIT' : 'miss'}`,
        hit ? 'hit' : 'miss',
      );
    },
    shipSunk: (state, action: PayloadAction<ShipSunkPayload>) => {
      const p = action.payload;
      if (state.lastAttackerId === state.sessionId) state.stats.shipsSunk++;
      const owner = p.targetSessionId === state.sessionId ? 'Your' : `${nameOf(state, p.targetSessionId)}'s`;
      pushLog(state, `${owner} ${p.ship.length}-cell ship was sunk!`, 'sunk');
    },
    playerEliminated: (state, action: PayloadAction<PlayerEliminatedPayload>) => {
      const id = action.payload.sessionId;
      pushLog(state, id === state.sessionId ? 'Your fleet is destroyed.' : `${nameOf(state, id)} is out!`, 'error');
    },
    gameOver: (state, action: PayloadAction<GameOverPayload>) => {
      const id = action.payload.winnerId;
      if (state.room) {
        state.room.status = 'FINISHED';
        state.room.winnerId = id;
        state.room.currentPlayer = '';
      }
      pushLog(state, id ? `${nameOf(state, id)} won the battle!` : 'Battle over.', 'system');
    },
    errorReceived: (state, action: PayloadAction<{ msg?: string }>) => {
      state.pending = false;
      state.error = action.payload?.msg ?? 'Something went wrong';
    },
    errorCleared: (state) => {
      state.error = null;
    },
  },
});

export const gameActions = gameSlice.actions;
export default gameSlice.reducer;
