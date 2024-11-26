import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ServerDetails {
  server_details_id: number;
  server_name: string;
  ip_address: string;
  operating_system: string;
  location?: string;
  description?: string;
  created_date?: string;
  updated_date?: string;
}

interface ServerDetailState {
  selectedServer: ServerDetails | null;
}

const initialState: ServerDetailState = {
  selectedServer: null,
};

const serverDetailSlice = createSlice({
  name: "serverDetail",
  initialState,
  reducers: {
    setSelectedServer: (state, action: PayloadAction<ServerDetails>) => {
      state.selectedServer = action.payload;
    },
    clearSelectedServer: (state) => {
      state.selectedServer = null;
    },
  },
});

export const { setSelectedServer, clearSelectedServer } =
  serverDetailSlice.actions;
export default serverDetailSlice.reducer;

export const selectServerDetail = (state: {
  serverDetail: ServerDetailState;
}) => state.serverDetail.selectedServer;

import axios from "axios";

interface DateRangeParams {
  ip_address: string;
  port?: number;
  start_time: string;
  end_time: string;
}

const serverService = {
  // ... existing methods ...

  getRangeData: async (params: DateRangeParams) => {
    try {
      const formattedStartTime = encodeURIComponent(params.start_time);
      const formattedEndTime = encodeURIComponent(params.end_time);

      const response = await axios.get(
        `http://${params.ip_address}:${params.port || 5000}/monitor/range`,
        {
          params: {
            start_time: formattedStartTime,
            end_time: formattedEndTime,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in getRangeData:", error);
      throw error;
    }
  },
};

export { serverService };
