"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { sendContactForm } from "../api"; // ✅ centralized API call

// Locales
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import mr from "../locales/mr.json";

const translations = { en, hi, mr };

export default function Contact() {
  const language = useSelector((state) => state.language.language || "en");

  const t = (key, fallback = "") => {
    const keys = key.split(".");
    let result = translations[language];
    for (let k of keys) {
      result = result?.[k];
      if (result === undefined) return fallback;
    }
    return result;
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error"

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await sendContactForm(formData);
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("⚠️ Contact form submit failed:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-gray-900 dark:text-white">
        {t("contact_heading", "Contact Us")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto px-6">
        {/* Info */}
        <div className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-yellow-300">
            {t("contact_get_in_touch", "Get in Touch")}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {t("contact_description", "Have questions? Reach out to us!")}
          </p>

          <div className="space-y-4 text-gray-700 dark:text-gray-400">
            <p className="flex items-center gap-2">📍 <span>{t("contact_address", "Your Address Here")}</span></p>
            <p className="flex items-center gap-2">📞 <span>{t("contact_phone", "+91 1234567890")}</span></p>
            <p className="flex items-center gap-2">📧 <span>{t("contact_email", "info@example.com")}</span></p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 shadow-xl rounded-3xl bg-white dark:bg-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("form_name", "Your Name")}
              className="w-full p-4 border rounded-xl bg-gray-50 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white 
              focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("form_email", "Your Email")}
              className="w-full p-4 border rounded-xl bg-gray-50 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white 
              focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              placeholder={t("form_message", "Your Message")}
              className="w-full p-4 border rounded-xl bg-gray-50 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white 
              focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 font-semibold rounded-xl transition-all duration-200 shadow-lg flex justify-center items-center gap-2
              ${loading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            >
              {loading ? t("form_processing", "Sending...") : t("form_send", "Send Message")}
            </button>

            {status === "success" && (
              <p className="text-green-600 dark:text-green-400 mt-2 text-center">
                ✅ {t("form_success", "Message sent successfully!")}
              </p>
            )}
            {status === "error" && (
              <p className="text-red-600 dark:text-red-400 mt-2 text-center">
                ❌ {t("form_error", "Failed to send message. Try again!")}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
