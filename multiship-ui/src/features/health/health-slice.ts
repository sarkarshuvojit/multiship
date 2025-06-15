import { createSlice } from "@reduxjs/toolkit";

export enum HealthStatus {
  INIT = "INIT",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "CONNECTED"
}

interface HealthSlice {
  status: HealthStatus;
  lastStatusAt: number;
}

const initialState: HealthSlice = {
    status: HealthStatus.INIT,
    lastStatusAt: new Date().getTime(),
}

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    healthChecked: (state, _action) => {
      console.info("Health checked");
      state.status = HealthStatus.CONNECTED;
      state.lastStatusAt = new Date().getTime();
    },
  },
});

export const { healthChecked: HEALTH_CHECKED } = healthSlice.actions;
export default healthSlice.reducer;
