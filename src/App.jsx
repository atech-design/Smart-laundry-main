// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { useEffect, Suspense, lazy, useState } from "react";
import store from "./store/store";
import api from "./api";   // 👈 Flask API import

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Aboutus = lazy(() => import("./pages/Aboutus"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const Login = lazy(() => import("./pages/Login"));
const UserDashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// Simple 404 page
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <h1 className="text-4xl font-bold text-red-600">404</h1>
      <p className="text-lg text-gray-500 dark:text-gray-300">
        Page not found
      </p>
    </div>
  );
}

// Layout wrapper (theme + navbar)
function Layout({ children }) {
  const theme = useSelector((state) => state.theme.mode || "light");
  const [backendStatus, setBackendStatus] = useState("");

  useEffect(() => {
    // 👇 Flask backend ko ping karo
    api.get("/hello")
      .then((res) => setBackendStatus(res.data.message))
      .catch(() => setBackendStatus("Backend not reachable"));

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      {/* Backend connection status */}
      <div className="text-center text-sm text-gray-500 py-2">
        {backendStatus ? `Backend: ${backendStatus}` : "Checking backend..."}
      </div>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-screen text-lg text-gray-500">
                Loading...
              </div>
            }
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/aboutus" element={<Aboutus />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<CheckoutPage />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />

              {/* Protected User Route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute role="user">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </Provider>
  );
}
