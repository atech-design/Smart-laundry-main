// src/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

// ✅ Save token & user in localStorage
const saveAuth = (user, token) => {
  localStorage.setItem("auth", JSON.stringify({ user, token }));
};

// ✅ Load from localStorage
const loadAuth = () => {
  try {
    const data = localStorage.getItem("auth");
    return data ? JSON.parse(data) : { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
};

// ✅ Login (OTP verify or Google)
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", formData); 
      return res.data; // { user, token }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// ✅ Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    ...loadAuth(),
    status: "idle", // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {
    // logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("auth");
    },
    // clear error
    clearError: (state) => {
      state.error = null;
    },
    // ✅ setUserFromToken (for restoring session from saved token)
    setUserFromToken: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;

        // ✅ Save to localStorage
        saveAuth(action.payload.user, action.payload.token);

        // ✅ Set default Authorization header for all API calls
        api.defaults.headers.common["Authorization"] = `Bearer ${action.payload.token}`;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// ✅ Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);

// ✅ Actions
export const { logout, clearError, setUserFromToken } = authSlice.actions;
export default authSlice.reducer;
