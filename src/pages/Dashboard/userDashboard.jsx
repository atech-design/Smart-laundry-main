import React, { useState, useEffect } from "react";
import MyOrders from "./MyOrders";
import TrackOrder from "./TrackOrder";
import Profile from "./Profile";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        User Dashboard
      </h1>

      <div className="flex gap-4 mb-6">
        {["orders", "track", "profile"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "orders"
              ? "My Orders"
              : tab === "track"
              ? "Track Order"
              : "Profile"}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "orders" && <MyOrders />}
        {activeTab === "track" && <TrackOrder />}
        {activeTab === "profile" && <Profile />}
      </div>
    </div>
  );
}
