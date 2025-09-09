"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import StatsSection from "../components/StatsSection";
import Lottie from "lottie-react";
import api from "../api"; // axios instance

// Lottie animations
import bookingAnim from "../assets/lottie/booking.json";
import pickupAnim from "../assets/lottie/pickup.json";
import washingAnim from "../assets/lottie/washing.json";
import deliveryAnim from "../assets/lottie/delivery.json";

export default function Home() {
  const { t } = useTranslation();

  // Backend states
  const [whyChoose, setWhyChoose] = useState([]);
  const [howItWorks, setHowItWorks] = useState([]);
  const [finalCta, setFinalCta] = useState({});

  // Axios fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [whyRes, worksRes, ctaRes] = await Promise.all([
          api.get("/why-choose"),      // returns [{ title, desc, border }]
          api.get("/how-it-works"),    // returns [{ step, desc, animKey }]
          api.get("/final-cta"),       // returns { title, desc, ctaText }
        ]);

        setWhyChoose(whyRes.data);
        setHowItWorks(worksRes.data);
        setFinalCta(ctaRes.data);
      } catch (err) {
        console.error("Error fetching Home data:", err);
      }
    };
    fetchData();
  }, []);

  const scrollToWorks = () => {
    const section = document.getElementById("how-it-works");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };

  const animMap = { booking: bookingAnim, pickup: pickupAnim, washing: washingAnim, delivery: deliveryAnim };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      {/* 🔥 Urgency Banner */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 dark:from-yellow-700 dark:via-yellow-600 dark:to-yellow-500 text-center py-2 text-xs sm:text-sm font-semibold text-yellow-900 dark:text-white shadow-md"
      >
        🔥 {t("limitedSlots")} <span className="underline">{t("bookBefore")}</span> {t("sameDay")}
      </motion.div>

      {/* 🚀 Hero Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={fadeUp}
        transition={{ duration: 1 }}
        className="relative text-center py-20 sm:py-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden"
      >
        <motion.div
          animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] [background-size:25px_25px]"
        />
        <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg">{t("heroTitle")} 🚀</h1>
        <p className="relative mt-4 text-base sm:text-lg md:text-xl opacity-90 max-w-2xl mx-auto px-4">{t("heroTagline")}</p>
        <div className="relative mt-8 flex flex-col sm:flex-row justify-center gap-4 px-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="px-6 sm:px-8 py-3 bg-yellow-400 text-black font-semibold rounded-2xl shadow-lg hover:bg-yellow-300 transition"
          >
            {t("ctaToday")}
          </motion.button>
          <motion.button
            onClick={scrollToWorks}
            whileHover={{ scale: 1.05 }}
            className="px-6 sm:px-8 py-3 border border-white rounded-2xl hover:bg-white hover:text-indigo-600 transition"
          >
            {t("seeHow")}
          </motion.button>
        </div>
      </motion.section>

      {/* ⭐ Why Choose Us */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-14 text-gray-800 dark:text-gray-100">{t("whyChoose")}</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10 text-center">
          {whyChoose.map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              variants={fadeUp}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className={`p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition border-t-4 ${item.border}`}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✅ Stats Section */}
      <StatsSection />

      {/* ⚡ How It Works */}
      <section id="how-it-works" className="py-20 sm:py-24 relative bg-gray-50 dark:bg-gray-900">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-16 sm:mb-20 text-gray-800 dark:text-white">⚡ {t("howWorks")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12 text-center">
          {howItWorks.map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
              transition={{ delay: i * 0.25 }}
              whileHover={{ scale: 1.05 }}
              className="relative p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-purple-500/30 transition"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4">
                <Lottie animationData={animMap[item.animKey]} loop />
              </div>
              <h4 className="font-bold text-base sm:text-lg dark:text-white">{item.step}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🎯 Final CTA */}
      <section className="py-20 sm:py-24 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-center text-white relative overflow-hidden">
        <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} transition={{ duration: 1 }} className="relative text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg px-4">{finalCta.title}</motion.h2>
        <motion.p initial="hidden" whileInView="visible" variants={fadeUp} transition={{ delay: 0.3 }} className="relative mt-3 text-base sm:text-lg md:text-xl opacity-90 max-w-2xl mx-auto px-4">{finalCta.desc}</motion.p>
        <motion.button whileHover={{ scale: 1.1 }} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="relative mt-8 px-8 py-3 sm:px-10 sm:py-4 bg-yellow-400 text-black font-semibold rounded-2xl shadow-lg hover:bg-yellow-300">{finalCta.ctaText}</motion.button>
      </section>
    </div>
  );
}
