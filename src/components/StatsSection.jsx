"use client";
import { useState, useEffect } from "react";
import { Users, Shirt, Clock } from "lucide-react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import api from "../api"; // ✅ centralized axios instance

export default function StatsSection() {
  const { t } = useTranslation();
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats"); // ✅ no need full URL
        if (res.data) {
          setStats([
            {
              id: 1,
              label: t("stat_customers"),
              value: res.data.customers,
              suffix: "+",
              icon: <Users size={32} className="text-indigo-600" />,
            },
            {
              id: 2,
              label: t("stat_clothes"),
              value: res.data.clothes,
              suffix: "+",
              icon: <Shirt size={32} className="text-green-600" />,
            },
            {
              id: 3,
              label: t("stat_years"),
              value: res.data.years,
              suffix: "+",
              icon: <Clock size={32} className="text-yellow-500" />,
            },
          ]);
        }
      } catch (err) {
        console.error("⚠️ Stats API failed:", err);
        setStats([]); // empty hi rakhega, kuch nahi dikhega
      }
    };

    fetchStats();
  }, [t]);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-12">
          {t("stats_heading")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.length > 0 ? (
            stats.map((stat, i) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="flex flex-col items-center justify-center p-8 
                           bg-white dark:bg-gray-800 rounded-2xl shadow-lg 
                           hover:scale-105 transition transform"
              >
                <div className="mb-4">{stat.icon}</div>
                <h3 className="text-3xl font-bold text-indigo-600 dark:text-yellow-300">
                  <CountUp end={stat.value} duration={2.5} enableScrollSpy />
                  {stat.suffix}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  {stat.label}
                </p>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              {t("loading_stats")}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
