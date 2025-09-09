import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // 🟢 Dummy data
        const res = {
          data: [
            { id: "ORD001", user: "Sujal", status: "Pending", total: 250 },
            { id: "ORD002", user: "Ravi", status: "Completed", total: 480 },
            { id: "ORD003", user: "Priya", status: "In Progress", total: 320 },
          ],
        };

        setOrders(res.data);

        // ✅ Backend integration (enable when ready)
        // const res = await axios.get("/api/admin/orders");
        // setOrders(res.data);

      } catch (err) {
        console.error("Orders Error:", err);
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Orders</h1>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{o.id}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{o.user}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{o.status}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">${o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
