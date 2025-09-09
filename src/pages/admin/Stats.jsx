import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function Stats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0,
    pendingDeliveries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // 🟢 Dummy data
        const res = {
          data: {
            totalOrders: 128,
            totalUsers: 56,
            revenue: 45200,
            pendingDeliveries: 12,
          },
        };

        setStats(res.data);

        // ✅ Backend integration
        // const res = await axios.get("/api/admin/stats");
        // setStats(res.data);

      } catch (err) {
        console.error("Stats Error:", err);
        toast.error("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Analytics & Stats</h1>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalOrders}</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{stats.revenue}</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Deliveries</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingDeliveries}</h2>
          </div>
        </div>
      )}
    </div>
  );
}
