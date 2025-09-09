// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api", // 👈 Flask backend ka base URL
  withCredentials: true, // agar cookies use kar rahe ho to
});

// Token lagao agar localStorage me saved hai
const authData = localStorage.getItem("auth");
if (authData) {
  const { token } = JSON.parse(authData);
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

export default api;
