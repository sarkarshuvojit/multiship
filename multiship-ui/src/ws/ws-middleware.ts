import type { MiddlewareAPI, Dispatch, Action, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { wsClient } from './ws-client';
import { handleWsEvent } from './event-handlers';
import type { InboundEvent } from '@/types/wsevents';

export const wsMiddleware = (_store: MiddlewareAPI<Dispatch<UnknownAction>, any>) => 
  (next: Dispatch<UnknownAction>) => 
    (action: UnknownAction) => {
      if (action.type === 'ws/send') {
        const payloadAction = action as PayloadAction<InboundEvent<any>>;
        wsClient.send(payloadAction.payload);
      }

      return next(action);
    };

export const initWebSocket = (url: string, store: MiddlewareAPI<Dispatch<Action>, any>) => {
  wsClient.connect(url);
  wsClient.onMessage = (message) => handleWsEvent(message, store);
};

