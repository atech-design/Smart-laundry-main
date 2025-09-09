import React, { useEffect, useState } from "react";
import api from "../../api";
import toast, { Toaster } from "react-hot-toast";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get("/orders/my"); // ✅ backend endpoint
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-10">
        Loading your orders...
      </div>
    );

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      {orders.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="p-4 border rounded-xl bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center"
          >
            {/* Order Info */}
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {order.serviceName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order ID: {order._id}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Amount: ₹{order.total || 0}
              </p>
            </div>

            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === "Delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : order.status === "In Progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {order.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
