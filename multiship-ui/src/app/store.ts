// src/app/store.ts
import healthSlice from '@/features/health/health-slice';
import gameSlice from '@/features/game/game-slice';
import { wsMiddleware } from '@/ws/ws-middleware';
import { configureStore, type Middleware } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    health: healthSlice,
    game: gameSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(wsMiddleware as Middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

