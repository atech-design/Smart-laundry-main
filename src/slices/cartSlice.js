import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

// Initial state
const initialState = {
  items: [],
  favourites: [],
  totalQty: 0,
  total: 0,
  status: "idle",
};

// ✅ Async thunks
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const res = await api.get("/cart");
  return res.data;
});

export const addToCartAsync = createAsyncThunk("cart/addToCart", async (item) => {
  await api.post("/cart/add", { id: item.id, qty: 1 });
  return item;
});

export const decreaseQtyAsync = createAsyncThunk("cart/decreaseQty", async (id) => {
  await api.post("/cart/decrease", { id });
  return id;
});

export const removeFromCartAsync = createAsyncThunk("cart/removeFromCart", async (id) => {
  await api.delete(`/cart/${id}`);
  return id;
});

export const clearCartAsync = createAsyncThunk("cart/clearCart", async () => {
  await api.delete("/cart");
  return [];
});

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    toggleFavourite: (state, action) => {
      const item = action.payload;
      const exists = state.favourites.find((f) => f.id === item.id);
      if (exists) {
        state.favourites = state.favourites.filter((f) => f.id !== item.id);
      } else {
        state.favourites.push(item);
      }
    },
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) existing.qty += 1;
      else state.items.push({ ...item, qty: 1 });
      state.totalQty += 1;
      state.total += item.price;
    },
    decreaseQty: (state, action) => {
      const id = action.payload;
      const existing = state.items.find((i) => i.id === id);
      if (existing) {
        existing.qty -= 1;
        state.totalQty -= 1;
        state.total -= existing.price;
        if (existing.qty <= 0) state.items = state.items.filter((i) => i.id !== id);
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      const existing = state.items.find((i) => i.id === id);
      if (existing) {
        state.totalQty -= existing.qty;
        state.total -= existing.price * existing.qty;
        state.items = state.items.filter((i) => i.id !== id);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQty = 0;
      state.total = 0;
    },
    setCart: (state, action) => {
      state.items = action.payload;
      state.totalQty = action.payload.reduce((sum, i) => sum + i.qty, 0);
      state.total = action.payload.reduce((sum, i) => sum + i.price * i.qty, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.status = "loading"; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload.items || [];
        state.totalQty = action.payload.totalQty || 0;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchCart.rejected, (state) => { state.status = "failed"; })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        const item = action.payload;
        const existing = state.items.find((i) => i.id === item.id);
        if (existing) existing.qty += 1;
        else state.items.push({ ...item, qty: 1 });
        state.totalQty += 1;
        state.total += item.price;
      })
      .addCase(decreaseQtyAsync.fulfilled, (state, action) => {
        const id = action.payload;
        const existing = state.items.find((i) => i.id === id);
        if (existing) {
          existing.qty -= 1;
          state.totalQty -= 1;
          state.total -= existing.price;
          if (existing.qty <= 0) state.items = state.items.filter((i) => i.id !== id);
        }
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        const id = action.payload;
        const existing = state.items.find((i) => i.id === id);
        if (existing) {
          state.totalQty -= existing.qty;
          state.total -= existing.price * existing.qty;
          state.items = state.items.filter((i) => i.id !== id);
        }
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.totalQty = 0;
        state.total = 0;
      });
  },
});

export const {
  toggleFavourite,
  addToCart,
  decreaseQty,
  removeFromCart,
  clearCart,
  setCart,
} = cartSlice.actions;

export const selectCart = (state) => state.cart.items;
export const selectFavourites = (state) => state.cart.favourites;
export const selectTotalQty = (state) => state.cart.totalQty;
export const selectTotal = (state) => state.cart.total;

export default cartSlice.reducer;
