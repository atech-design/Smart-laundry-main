// src/pages/Aboutus.jsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import CountUp from "react-countup";
import { Sparkles, ShieldCheck, HeartHandshake, Clock, Recycle, Users, Star, Truck, Shirt } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../api";

import en from "../locales/en.json";
import hi from "../locales/hi.json";
import mr from "../locales/mr.json";

const translations = { en, hi, mr };

// Map backend icon names to lucide-react icons
const getIcon = (name) => {
  const icons = {
    Users: <Users className="w-6 h-6"/>,
    Shirt: <Shirt className="w-6 h-6"/>,
    Clock: <Clock className="w-6 h-6"/>,
    ShieldCheck: <ShieldCheck className="w-6 h-6"/>,
    Truck: <Truck className="w-6 h-6"/>,
    Recycle: <Recycle className="w-6 h-6"/>,
    HeartHandshake: <HeartHandshake className="w-6 h-6"/>
  };
  return icons[name] || <Sparkles className="w-6 h-6"/>;
};

// Reusable motion section
const MotionSection = ({ children }) => {
  const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
      {children}
    </motion.div>
  );
};

export default function Aboutus() {
  const language = useSelector((state) => state.language.language || "en");

  // Translation helper
  const t = (key, fallback = "") => {
    const keys = key.split(".");
    let result = translations[language];
    for (let k of keys) {
      result = result?.[k];
      if (result === undefined) return fallback || key;
    }
    return result;
  };

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 20, mass: 0.2 });

  // API Data
  const [data, setData] = useState({ stats: [], values: [], timeline: [], team: [], testimonials: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/aboutus")
      .then(res => setData(res.data || {}))
      .catch(err => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* Scroll Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 right-0 top-16 h-[3px] origin-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-40"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"/>
        <motion.div
          aria-hidden
          animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <MotionSection>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow">
              {t("aboutus.hero.title","We Make Laundry Feel Like Magic ✨")}
            </h1>
          </MotionSection>
          <MotionSection>
            <p className="mt-4 md:mt-6 text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
              {t("aboutus.hero.subtitle","Fast pickup, premium wash, and on-time delivery.")}
            </p>
          </MotionSection>
          <MotionSection>
            <div className="mt-8 inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full shadow-lg justify-center mx-auto">
              <Sparkles className="w-5 h-5 text-yellow-500"/>
              <span className="font-semibold">{t("aboutus.hero.trusted","Trusted by your neighborhood")}</span>
            </div>
          </MotionSection>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {data.stats.map((s,i)=>(
          <MotionSection key={i}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow text-center">
              <div className="flex items-center justify-center text-indigo-500 mb-3">{getIcon(s.icon)}</div>
              <div className="text-2xl font-bold"><CountUp end={s.value} duration={2}/> {s.suffix || ""}</div>
              <div className="text-gray-600 dark:text-gray-300 mt-1">{s.label}</div>
            </div>
          </MotionSection>
        ))}
      </section>

      {/* Values */}
      <section className="py-16 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {data.values.map((v,i)=>(
          <MotionSection key={i}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center text-center gap-4">
              <div className="text-indigo-500">{getIcon(v.icon)}</div>
              <h3 className="font-bold text-lg">{v.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{v.desc}</p>
            </div>
          </MotionSection>
        ))}
      </section>

      {/* Timeline / Our Story */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-12 text-center">{t("aboutus.timeline.heading","Our Story")}</h2>
        <div className="flex flex-col items-center gap-8">
          {data.timeline.map((item,i)=>(
            <MotionSection key={i}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow text-center max-w-xl mx-auto">
                <div className="font-bold text-indigo-500 text-lg">{item.year}</div>
                <h3 className="font-semibold text-xl mt-1">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{item.text}</p>
              </div>
            </MotionSection>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">{t("aboutus.team.heading","Our Team")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 justify-items-center">
          {data.team.map((m,i)=>(
            <MotionSection key={i}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow text-center">
                <div className="text-4xl">{m.emoji}</div>
                <h3 className="font-bold mt-2">{m.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{m.role}</p>
              </div>
            </MotionSection>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">{t("aboutus.testimonials.heading","Testimonials")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {data.testimonials.map((tst,i)=>(
            <MotionSection key={i}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow text-center max-w-sm">
                <p className="text-gray-600 dark:text-gray-300">"{tst.text}"</p>
                <div className="flex items-center gap-2 mt-4 justify-center">
                  <Star className="w-4 h-4 text-yellow-400"/>
                  <span>{tst.rating}/5</span>
                </div>
                <p className="mt-2 font-semibold">{tst.name}</p>
              </div>
            </MotionSection>
          ))}
        </div>
      </section>

    </div>
  );
}
