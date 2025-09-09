import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        // 🟢 Dummy data
        const res = {
          data: [
            { id: "USR001", name: "Sujal", email: "sujal@example.com", role: "Admin" },
            { id: "USR002", name: "Ravi", email: "ravi@example.com", role: "User" },
            { id: "USR003", name: "Priya", email: "priya@example.com", role: "User" },
          ],
        };

        setUsers(res.data);

        // ✅ Backend integration
        // const res = await axios.get("/api/admin/users");
        // setUsers(res.data);

      } catch (err) {
        console.error("Users Error:", err);
        toast.error("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Users</h1>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading users...</div>
      ) : users.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No users found.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">User ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{u.id}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{u.name}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{u.email}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
