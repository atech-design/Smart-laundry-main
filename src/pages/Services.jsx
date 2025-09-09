"use client";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

// Redux imports
import {
  fetchServices,
  setCategory,
  selectFilteredServices,
  selectCategories,
  selectActiveCategory,
  selectServicesStatus,
} from "../slices/servicesSlice";

export default function Services() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux selectors
  const services = useSelector(selectFilteredServices);
  const categories = useSelector(selectCategories);
  const activeCategory = useSelector(selectActiveCategory);
  const status = useSelector(selectServicesStatus);

  // Fetch services from backend on mount
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  // Loading / Error handling
  if (status === "loading") {
    return <div className="p-10 text-center">{t("loading", "Loading...")}</div>;
  }
  if (status === "failed") {
    return (
      <div className="p-10 text-center text-red-500">
        {t("service_not_found", "⚠️ Failed to load services.")}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 py-20 min-h-screen">
      {/* Title */}
      <h2 className="text-4xl font-extrabold text-center mb-4 text-gray-900 dark:text-white">
        {t("services.title", "✨ Our Premium Services ✨")}
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
        {t(
          "services.subtitle",
          "From daily wear to delicate couture — we handle everything with love, care & expertise."
        )}
      </p>

      {/* Categories */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => dispatch(setCategory(cat))}
            className={`px-5 py-2 rounded-full font-medium border transition-all
              ${
                activeCategory === cat
                  ? "bg-indigo-500 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-indigo-100 dark:hover:bg-gray-700"
              }`}
          >
            {t(`categories.${cat}`, cat)}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl px-6 justify-items-center">
          {services.length > 0 ? (
            services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="flex flex-col items-center justify-between h-60 w-64 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-2xl transition border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-yellow-400"
              >
                <div className="text-5xl mb-3">{service.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-yellow-300 text-center">
                  {t(service.nameKey, service.name)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                  {t(service.descKey, service.description)}
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
              {t("no_services", "No services available at the moment.")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
