import React, { useState, useEffect } from "react";
import api from "../../api";
import toast from "react-hot-toast";

export default function TrackOrder() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my");
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch orders");
      }
    };
    fetchOrders();
  }, []);

  const orderStatus = selectedOrder?.status;

  return (
    <div>
      <select
        className="p-2 border rounded-xl mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full"
        onChange={(e) =>
          setSelectedOrder(orders.find((o) => o._id === e.target.value))
        }
      >
        <option value="">Select Order</option>
        {orders.map((o) => (
          <option key={o._id} value={o._id}>
            {o.serviceName} (ID: {o._id})
          </option>
        ))}
      </select>

      {selectedOrder && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="font-semibold mb-2">Order ID: {selectedOrder._id}</p>
          <p>
            Status: <span className="font-bold">{orderStatus}</span>
          </p>
          <p>Pickup: {selectedOrder.pickupTime}</p>
          <p>Delivery: {selectedOrder.deliveryTime}</p>
        </div>
      )}
    </div>
  );
}
