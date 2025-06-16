import { createSlice } from "@reduxjs/toolkit";

export enum HealthStatus {
  INIT = "INIT",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "CONNECTED"
}

interface HealthSlice {
  status: HealthStatus;
  liveUsers: number;
  lastStatusAt: number;
}

const initialState: HealthSlice = {
    status: HealthStatus.INIT,
    liveUsers: 0,
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
    liveUsersUpdated: (state, action) => {
      console.info("Live users updated");
      state.liveUsers = parseInt(action.payload?.liveUsers);
    },
  },
});

export const { 
  healthChecked: HEALTH_CHECKED,
  liveUsersUpdated: LIVE_USERS_UPDATED, 
} = healthSlice.actions;
export default healthSlice.reducer;
