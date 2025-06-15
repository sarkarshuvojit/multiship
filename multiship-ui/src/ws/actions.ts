import type { JoinRoomDto, SignupDto } from '@/types/multiship.types';
import type { InboundEvent } from '@/types/wsevents';
import { createAction } from '@reduxjs/toolkit';

export const wsSend = createAction<InboundEvent<any>>('ws/send'); 
export const SIGNUP = createAction<InboundEvent<SignupDto>>('ws/send'); 
export const CREATE_ROOM = createAction<InboundEvent<any>>('ws/send'); 
export const JOIN_ROOM = createAction<InboundEvent<JoinRoomDto>>('ws/send'); 
