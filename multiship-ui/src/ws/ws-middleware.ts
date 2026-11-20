import type { MiddlewareAPI, Dispatch, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { wsClient } from './ws-client';
import { handleWsEvent } from './event-handlers';
import type { InboundEvent } from '@/types/wsevents';
import { gameActions } from '@/features/game/game-slice';

export const wsMiddleware = (_store: MiddlewareAPI<Dispatch<UnknownAction>, unknown>) => // eslint-disable-line @typescript-eslint/no-unused-vars
  (next: Dispatch<UnknownAction>) =>
    (action: UnknownAction) => {
      if (action.type === 'ws/send') {
        const payloadAction = action as PayloadAction<InboundEvent<unknown>>;
        wsClient.send(payloadAction.payload);
      }

      return next(action);
    };

export const initWebSocket = (url: string, store: { dispatch: Dispatch<UnknownAction> }) => {
  wsClient.onMessage = (message) => handleWsEvent(message, store);
  wsClient.onClose = () => store.dispatch(gameActions.disconnected());
  wsClient.connect(url);
};
