export interface SignupDto {
  email: string;
  name: string;
  avatar: string;
}

export interface JoinRoomDto {
  roomCode: string;
}

export type RoomStatus = 'IDLE' | 'WAITING' | 'BOARD_SELECTION' | 'PLAYERS_READY' | 'ONGOING' | 'FINISHED';
export type ServerCellState = 'HIDDEN' | 'HIT' | 'MISS';
export type ShipDirection = 'HORIZONTAL' | 'VERTICAL';
export type ServerPlayerStatus = 'JOINED' | 'BOARD_READY' | 'CURRENT_TURN';

export interface ShipState {
  x: number;
  y: number;
  direction: ShipDirection;
  length: number;
}

export interface PlayerView {
  sessionId: string;
  name: string;
  avatar: string;
  status: ServerPlayerStatus;
  isHost: boolean;
  isBot: boolean;
  eliminated: boolean;
  board: ServerCellState[][];
  shipsRemaining: number;
  sunkShips: ShipState[];
}

export interface RoomView {
  roomId: string;
  code: string;
  status: RoomStatus;
  hostId: string;
  currentPlayer: string;
  winnerId: string;
  maxPlayers: number;
  players: PlayerView[];
}

export interface SubmitBoardDto {
  roomId: string;
  ships: ShipState[];
}

export interface TryHitDto {
  roomId: string;
  targetSessionId: string;
  x: number;
  y: number;
}

export interface HitAttemptedPayload {
  roomId: string;
  attackerSessionId: string;
  targetSessionId: string;
  x: number;
  y: number;
  result: ServerCellState;
}

export interface ShipSunkPayload {
  roomId: string;
  targetSessionId: string;
  ship: ShipState;
}

export interface PlayerEliminatedPayload {
  roomId: string;
  sessionId: string;
}

export interface GameOverPayload {
  roomId: string;
  winnerId: string;
}
