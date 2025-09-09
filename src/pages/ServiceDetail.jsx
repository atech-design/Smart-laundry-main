"use client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addToCartAsync, toggleFavourite } from "../slices/cartSlice";
import { ArrowLeft, ShoppingCart, Heart, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../api";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const fast = { duration: 0.35, ease: "easeOut" };

export default function ServiceDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const language = useSelector((state) => state.language.language || "en");
  const cart = useSelector((state) => state.cart.items);
  const favourites = useSelector((state) => state.cart.favourites);

  const [data, setData] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${id}?lang=${language}`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching service:", err);
        setData({ error: true });
      }
    };
    fetchService();
  }, [id, language]);

  if (!data) return <div className="p-10 text-center">{t("loading")}</div>;
  if (data.error) return <div className="p-10 text-center">{t("service_not_found")}</div>;

  const isInCart = (oid) => cart.some((i) => i.id === oid);
  const isFav = (oid) => favourites.some((f) => f.id === oid);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-12">
      {/* Top Bar */}
      <div className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/services")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow hover:shadow-md border border-gray-200 dark:border-gray-700"
        >
          <ArrowLeft size={18} /> {t("back")}
        </button>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black font-medium shadow hover:bg-yellow-300"
        >
          <ShoppingCart size={18} /> {t("cart")} ({cart.length})
        </Link>
      </div>

      {/* Hero */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        transition={fast}
        className="max-w-6xl mx-auto px-6 mt-6 mb-8"
      >
        <div className="rounded-3xl p-6 md:p-10 bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-600 text-white shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#ffffff_1px,_transparent_1px)] [background-size:22px_22px]" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold flex items-center gap-3">
                <span className="text-4xl md:text-5xl">{data.emoji}</span>
                {t(data.nameKey, data.name)}
              </h1>
              <p className="mt-2 text-white/90 text-base md:text-lg">{t(data.taglineKey, data.tagline)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <div className="text-sm opacity-90">{t("before")}</div>
                <div className="text-lg">{data.before}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <div className="text-sm opacity-90">{t("after")}</div>
                <div className="text-lg">{data.after}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-6 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.steps.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              transition={{ ...fast, delay: i * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 text-center"
            >
              <div className="mx-auto w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-2">
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{i + 1}</span>
              </div>
              {t(s.key, s)}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Options */}
      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-4">
          {t("choose_items_in")} <span className="text-indigo-600 dark:text-yellow-300">{t(data.nameKey, data.name)}</span>
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {data.options.map((o, idx) => (
              <motion.div
                key={o.id}
                variants={fadeUp}
                transition={{ ...fast, delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-5 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{o.emoji}</div>
                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => dispatch(toggleFavourite({ id: o.id, name: o.label, price: o.price }))}
                      className={`p-1 rounded-full cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 ${isFav(o.id) ? "text-red-500" : "text-gray-400"}`}
                    >
                      <Heart size={18} />
                    </div>
                    <div className="text-sm px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900">
                      ₹{o.price}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(o.labelKey, o.label)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("fast_careful", { service: t(data.nameKey, data.name) })}</p>
                </div>
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => dispatch(addToCartAsync({ id: o.id, name: o.label, price: o.price }))}
                    className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl ${isInCart(o.id) ? "bg-gray-300 text-black cursor-not-allowed" : "bg-yellow-400 text-black hover:bg-yellow-300"}`}
                    disabled={isInCart(o.id)}
                  >
                    <ShoppingCart size={16} /> {isInCart(o.id) ? t("in_cart") : t("add_to_cart")}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Perks */}
      <section className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data.perks.map((p, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              transition={{ ...fast, delay: i * 0.05 }}
              className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl shadow p-4"
            >
              <CheckCircle2 className="text-green-500 shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-200">{t(p.key, p)}</span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
