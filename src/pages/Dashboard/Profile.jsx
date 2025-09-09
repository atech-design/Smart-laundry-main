import React, { useEffect, useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm space-y-2">
      <p className="font-semibold">Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.phone}</p>
      <p>Role: {profile.role}</p>
    </div>
  );
}
