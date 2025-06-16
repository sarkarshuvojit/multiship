export enum InboundEventType {
  SIGN_UP = 'SIGN_UP',
  CREATE_ROOM = 'CREATE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  SUBMIT_BOARD = 'SUBMIT_BOARD',
  TRY_HIT = 'TRY_HIT',
  START_GAME = 'START_GAME',
}

export enum OutboundEventType {
  SIGNED_UP = 'SIGNED_UP',
  ROOM_CREATED = 'ROOM_CREATED',
  GENERAL_ERROR = 'GENERAL_ERROR',
  WELCOME = 'WELCOME',
  HIT_RESULT = 'HIT_RESULT',
  GAME_STARTED = 'GAME_STARTED',
  LIVE_USERS_UPDATED = 'LIVE_USERS_UPDATED'
}

export interface InboundEvent<T extends any> {
  eventType: InboundEventType;
  payload: T;
}

export interface OutboundEvent {
  eventType: OutboundEventType;
  payload: any;
}

