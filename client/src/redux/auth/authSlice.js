import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authAPI from "../../services/authAPI.js";

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem("jr_user")) || null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: storedUser,
  isAuthenticated: !!localStorage.getItem("jr_access_token"),
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const persistSession = (data) => {
  localStorage.setItem("jr_access_token", data.accessToken);
  localStorage.setItem("jr_refresh_token", data.refreshToken);
  localStorage.setItem("jr_user", JSON.stringify(data.user));
};

export const registerThunk = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const data = await authAPI.register(payload);
    persistSession(data);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const loginThunk = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const data = await authAPI.login(payload);
    persistSession(data);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authAPI.updateProfile(payload);
      localStorage.setItem("jr_user", JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutLocal: (state) => {
      localStorage.removeItem("jr_access_token");
      localStorage.removeItem("jr_refresh_token");
      localStorage.removeItem("jr_user");
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logoutLocal } = authSlice.actions;
export default authSlice.reducer;
