export enum InboundEventType {
  SIGN_UP = 'SIGN_UP',
  CREATE_ROOM = 'CREATE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  SUBMIT_BOARD = 'SUBMIT_BOARD',
  TRY_HIT = 'TRY_HIT',
  START_GAME = 'START_GAME',
  LEAVE_ROOM = 'LEAVE_ROOM',
  REMATCH = 'REMATCH',
}

export enum OutboundEventType {
  WELCOME = 'WELCOME',
  SIGNED_UP = 'SIGNED_UP',
  ROOM_CREATED = 'ROOM_CREATED',
  ROOM_JOINED = 'ROOM_JOINED',
  ROOM_LEFT = 'ROOM_LEFT',
  ROOM_STATE = 'ROOM_STATE',
  BOARD_SUBMITTED = 'BOARD_SUBMITTED',
  NEXT_TURN = 'NEXT_TURN',
  HIT_ATTEMPTED = 'HIT_ATTEMPTED',
  BOARD_UPDATED = 'BOARD_UPDATED',
  SHIP_SUNK = 'SHIP_SUNK',
  PLAYER_ELIMINATED = 'PLAYER_ELIMINATED',
  GAME_OVER = 'GAME_OVER',
  GENERAL_ERROR = 'GENERAL_ERROR',
  LIVE_USERS_UPDATED = 'LIVE_USERS_UPDATED',
}

export interface InboundEvent<T> {
  eventType: InboundEventType;
  payload: T;
}

export interface OutboundEvent {
  eventType: OutboundEventType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}
