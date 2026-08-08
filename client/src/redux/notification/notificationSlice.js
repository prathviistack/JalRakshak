import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as notificationAPI from "../../services/notificationAPI.js";

export const fetchNotificationsThunk = createAsyncThunk(
  "notification/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationAPI.getNotifications();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load notifications");
    }
  }
);

export const markAsReadThunk = createAsyncThunk("notification/markAsRead", async (id) => {
  await notificationAPI.markAsRead(id);
  return id;
});

export const markAllAsReadThunk = createAsyncThunk("notification/markAllAsRead", async () => {
  await notificationAPI.markAllAsRead();
});

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    items: [],
    unreadCount: 0,
    status: "idle",
  },
  reducers: {
    receiveLiveNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAsReadThunk.fulfilled, (state, action) => {
        const n = state.items.find((i) => i._id === action.payload);
        if (n && !n.isRead) {
          n.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsReadThunk.fulfilled, (state) => {
        state.items.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export const { receiveLiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
