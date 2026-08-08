import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice.js";
import requestReducer from "./request/requestSlice.js";
import notificationReducer from "./notification/notificationSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    request: requestReducer,
    notification: notificationReducer,
  },
});
