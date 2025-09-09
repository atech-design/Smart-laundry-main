import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import i18n from "i18next";
import api from "../api"; // centralized axios instance

// ✅ Async thunk to fetch supported languages from backend
export const fetchLanguages = createAsyncThunk(
  "language/fetchLanguages",
  async () => {
    const res = await api.get("/languages"); // backend endpoint
    return res.data; // e.g., ["en", "hi", "mr"]
  }
);

const initialState = {
  language: "en",        // default language
  supportedLanguages: ["en", "hi", "mr"], // fallback if backend fails
  status: "idle",        // idle | loading | failed
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      i18n.changeLanguage(action.payload);
    },
    toggleLanguage: (state) => {
      const currentIndex = state.supportedLanguages.indexOf(state.language);
      const nextLang =
        state.supportedLanguages[(currentIndex + 1) % state.supportedLanguages.length];
      state.language = nextLang;
      i18n.changeLanguage(nextLang);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.status = "idle";
        state.supportedLanguages = action.payload;
        // optionally set first language as current
        if (!state.supportedLanguages.includes(state.language)) {
          state.language = state.supportedLanguages[0] || "en";
          i18n.changeLanguage(state.language);
        }
      })
      .addCase(fetchLanguages.rejected, (state) => {
        state.status = "failed";
      });
  },
});

// Exports
export const { setLanguage, toggleLanguage } = languageSlice.actions;

// Selectors
export const selectLanguage = (state) => state.language.language;
export const selectSupportedLanguages = (state) => state.language.supportedLanguages;
export const selectLanguageStatus = (state) => state.language.status;

export default languageSlice.reducer;
