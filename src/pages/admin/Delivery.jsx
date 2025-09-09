import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function Delivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);

        // 🟢 Dummy data
        const res = {
          data: [
            { id: "DLV001", orderId: "ORD001", driver: "Amit", status: "Assigned" },
            { id: "DLV002", orderId: "ORD002", driver: "Rahul", status: "Delivered" },
            { id: "DLV003", orderId: "ORD003", driver: "Sneha", status: "In Transit" },
          ],
        };

        setDeliveries(res.data);

        // ✅ Backend integration
        // const res = await axios.get("/api/admin/deliveries");
        // setDeliveries(res.data);

      } catch (err) {
        console.error("Delivery Error:", err);
        toast.error("Failed to load deliveries.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Delivery Management</h1>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading deliveries...</div>
      ) : deliveries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No delivery records found.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Delivery ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Driver</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {deliveries.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{d.id}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{d.orderId}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{d.driver}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
