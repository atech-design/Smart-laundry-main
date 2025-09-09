// src/components/Cart.jsx
"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, Heart, ArrowLeft, ShoppingCart } from "lucide-react";
import {
  addToCart,
  decreaseQty,
  removeFromCart,
  clearCart,
  toggleFavourite,
  setCart,
} from "../slices/cartSlice";
import api from "../api"; // ✅ axios instance

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { items: cart, favourites } = useSelector((state) => state.cart);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  // ✅ Fetch cart from backend (on mount)
  React.useEffect(() => {
    async function fetchCart() {
      try {
        const res = await api.get("/cart");
        // ⚡ assume backend returns { items: [], total: 0 }
        dispatch(setCart(res.data.items || []));
      } catch (err) {
        console.error("❌ Failed to fetch cart:", err);
      }
    }
    fetchCart();
  }, [dispatch]);

  // ✅ Wrapper functions (frontend + backend sync)
  const handleAdd = async (item) => {
    dispatch(addToCart(item));
    try {
      await api.post("/cart/add", { id: item.id, qty: 1 });
    } catch (err) {
      console.error("❌ Add failed:", err);
    }
  };

  const handleDecrease = async (id) => {
    dispatch(decreaseQty(id));
    try {
      await api.post("/cart/decrease", { id });
    } catch (err) {
      console.error("❌ Decrease failed:", err);
    }
  };

  const handleRemove = async (id) => {
    dispatch(removeFromCart(id));
    try {
      await api.delete(`/cart/${id}`);
    } catch (err) {
      console.error("❌ Remove failed:", err);
    }
  };

  const handleClear = async () => {
    dispatch(clearCart());
    try {
      await api.delete("/cart");
    } catch (err) {
      console.error("❌ Clear failed:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/services")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow hover:shadow-md border border-gray-200 dark:border-gray-700"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart size={20} /> Cart ({totalItems})
        </div>
      </div>

      {/* Cart Section */}
      {cart.length === 0 ? (
        <p className="text-gray-500 text-lg text-center py-20">
          Your cart is empty. Add items from services!
        </p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700 transition mb-4"
            >
              {/* Item Info */}
              <div className="flex items-center gap-4">
                <div className="text-4xl">{item.emoji}</div>
                <div className="flex flex-col">
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{item.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Qty: {item.qty} • Price: ₹{item.price * item.qty}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleDecrease(item.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition"
                    >
                      <Minus size={16} className="text-red-600 dark:text-red-400" />
                    </button>
                    <span className="px-3 py-1 font-medium text-gray-800 dark:text-gray-200">{item.qty}</span>
                    <button
                      onClick={() => handleAdd(item)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 transition"
                    >
                      <Plus size={16} className="text-green-600 dark:text-green-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-4 md:mt-0 text-sm">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 transition"
                >
                  <Trash2 size={16} /> Remove
                </button>
                <button
                  onClick={() => dispatch(toggleFavourite(item))}
                  className={`flex items-center gap-1 transition ${
                    favourites.find((f) => f.id === item.id)
                      ? "text-red-500"
                      : "text-gray-400 dark:text-gray-400"
                  }`}
                >
                  <Heart size={16} />
                  {favourites.find((f) => f.id === item.id) ? "Favorited" : "Favorite"}
                </button>
              </div>
            </div>
          ))}

          {/* Cart Total */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-2xl font-bold bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl shadow-md">
            <span>Total:</span>
            <span>₹{cartTotal}</span>
          </div>

          {/* Cart Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleClear}
              className="flex-1 px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold"
            >
              Clear Cart
            </button>
            <Link
              to="/checkout"
              className="flex-1 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-center"
            >
              Checkout
            </Link>
          </div>
        </>
      )}

      {/* Favourites Section */}
      {favourites.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">💖 Favourites</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {favourites.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow flex flex-col"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="text-3xl">{item.emoji}</div>
                  <Heart size={18} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <span className="text-indigo-600 dark:text-indigo-300 mt-2">
                  ₹{item.price}
                </span>
                <button
                  onClick={() => handleAdd(item)}
                  disabled={cart.find((c) => c.id === item.id)}
                  className={`mt-auto px-3 py-2 rounded-xl ${
                    cart.find((c) => c.id === item.id)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-yellow-400 hover:bg-yellow-300"
                  } text-black font-medium mt-4`}
                >
                  {cart.find((c) => c.id === item.id) ? "Already in Cart" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
