import type {
  JoinRoomDto,
  SignupDto,
  SubmitBoardDto,
  TryHitDto,
} from '@/types/multiship.types';
import { InboundEventType, type InboundEvent } from '@/types/wsevents';
import { createAction } from '@reduxjs/toolkit';

// Any action of this type is forwarded to the server by the ws middleware.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wsSend = createAction<InboundEvent<any>>('ws/send');

export const SIGNUP = (payload: SignupDto) =>
  wsSend({ eventType: InboundEventType.SIGN_UP, payload });
export const CREATE_ROOM = () =>
  wsSend({ eventType: InboundEventType.CREATE_ROOM, payload: {} });
export const JOIN_ROOM = (payload: JoinRoomDto) =>
  wsSend({ eventType: InboundEventType.JOIN_ROOM, payload });
export const START_GAME = (roomId: string) =>
  wsSend({ eventType: InboundEventType.START_GAME, payload: { roomId } });
export const LEAVE_ROOM = () =>
  wsSend({ eventType: InboundEventType.LEAVE_ROOM, payload: {} });
export const REMATCH = (roomId: string) =>
  wsSend({ eventType: InboundEventType.REMATCH, payload: { roomId } });
export const SUBMIT_BOARD = (payload: SubmitBoardDto) =>
  wsSend({ eventType: InboundEventType.SUBMIT_BOARD, payload });
export const TRY_HIT = (payload: TryHitDto) =>
  wsSend({ eventType: InboundEventType.TRY_HIT, payload });
