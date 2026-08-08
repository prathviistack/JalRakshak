import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as requestAPI from "../../services/requestAPI.js";

export const fetchRequestsThunk = createAsyncThunk(
  "request/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const data = await requestAPI.getRequests(params);
      return data.requests;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load requests");
    }
  }
);

export const createRequestThunk = createAsyncThunk(
  "request/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await requestAPI.createRequest(payload);
      return data.request;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to submit request");
    }
  }
);

const requestSlice = createSlice({
  name: "request",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    upsertFromSocket: (state, action) => {
      const incoming = action.payload;
      const idx = state.items.findIndex((r) => r._id === incoming._id);
      if (idx >= 0) state.items[idx] = incoming;
      else state.items.unshift(incoming);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequestsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRequestsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRequestsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createRequestThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const { upsertFromSocket } = requestSlice.actions;
export default requestSlice.reducer;
