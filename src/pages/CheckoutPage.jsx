"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "../slices/cartSlice"; // fallback, agar backend fail kare
import Modal from "react-modal";
import Confetti from "react-confetti";
import { useTranslation } from "react-i18next";
import axios from "axios";

Modal.setAppElement("#root");

export default function Checkout() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(""); // "success" | "failed"
  const [isProcessing, setIsProcessing] = useState(false);

  // 🟢 Cart ko backend se fetch karna
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/cart");
        if (res.data) {
          setCart(res.data.items || []);
          setCartTotal(res.data.total || 0);
        }
      } catch (err) {
        console.error("⚠️ Cart fetch failed:", err);
        setCart([]);
        setCartTotal(0);
      }
    };
    fetchCart();
  }, []);

  // 🟢 Payment backend pe bhejna
  const handlePayment = async () => {
    if (cart.length === 0) return alert(t("checkout.emptyCart"));
    setIsProcessing(true);

    try {
      const res = await axios.post("http://localhost:5000/api/checkout", {
        cart,
        total: cartTotal,
      });

      if (res.data?.success) {
        setPaymentStatus("success");
        setCart([]);
        setCartTotal(0);

        // Backend ko bhi clear karna
        await axios.delete("http://localhost:5000/api/cart/clear");

        // Redux clear (fallback)
        dispatch(clearCart());
      } else {
        setPaymentStatus("failed");
      }
    } catch (err) {
      console.error("⚠️ Payment API failed:", err);
      setPaymentStatus("failed");
    } finally {
      setModalOpen(true);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white">
        ✅ {t("checkout.title")}
      </h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
          {t("checkout.emptyCart")}
        </p>
      ) : (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {t("checkout.orderSummary")}
            </h2>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between py-3">
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.name} × {item.qty}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{item.price * item.qty}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between mt-6 text-lg font-semibold text-gray-900 dark:text-white">
              <span>{t("checkout.total")}:</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>

          {/* Payment Button */}
          <div className="text-center">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`inline-flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold transition-transform transform hover:scale-105 ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  {t("checkout.processing")}
                </>
              ) : (
                t("checkout.payNow")
              )}
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="max-w-md mx-auto mt-24 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl text-center"
        overlayClassName="fixed inset-0 bg-black/50 flex items-start justify-center"
      >
        {paymentStatus === "success" && <Confetti recycle={false} />}
        <div className="space-y-4">
          {paymentStatus === "success" ? (
            <>
              <h2 className="text-3xl font-bold text-green-600">
                🎉 {t("checkout.successTitle")}
              </h2>
              <p className="text-gray-700 dark:text-gray-200">
                {t("checkout.successMsg")}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-red-600">
                ❌ {t("checkout.failedTitle")}
              </h2>
              <p className="text-gray-700 dark:text-gray-200">
                {t("checkout.failedMsg")}
              </p>
            </>
          )}
          <button
            onClick={() => setModalOpen(false)}
            className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
          >
            {t("checkout.close")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
