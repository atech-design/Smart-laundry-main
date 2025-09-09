// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // ✅ Replace with real backend API endpoints
        const [statsRes, ordersRes] = await Promise.all([
          axios.get("/api/admin/stats"),
          axios.get("/api/admin/recent-orders"),
        ]);

        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
      } catch (err) {
        console.error("Admin Dashboard Error:", err);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Admin Dashboard
      </h1>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 shadow rounded-xl p-5"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalOrders}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 shadow rounded-xl p-5"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Orders</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.pendingOrders}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 shadow rounded-xl p-5"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed Orders</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.completedOrders}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 shadow rounded-xl p-5"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalUsers}
              </h2>
            </motion.div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recent Orders
            </h2>

            {recentOrders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No recent orders.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Order ID
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        User
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{order.id}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{order.user}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{order.status}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">${order.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
