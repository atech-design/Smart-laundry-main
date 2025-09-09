// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "../slices/cartSlice";
import languageSlice from "../slices/languageSlice";
import themeSlice from "../slices/themeSlice";
import categoriesSlice from "../slices/categoriesSlice";
import servicesSlice from "../slices/servicesSlice";
import authSlice from "../slices/authSlice"; // ✅ yeh missing tha

const store = configureStore({
  reducer: {
    cart: cartSlice,
    language: languageSlice,
    theme: themeSlice,
    categories: categoriesSlice,
    services: servicesSlice,
    auth: authSlice, // ✅ ab kaam karega
  },
});

export default store;
