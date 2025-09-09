// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

// ✅ Local fallback (agar backend fail kare to)
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";

i18n
  // ✅ Add backend plugin
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    // ✅ Resources as fallback
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    lng: "en", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      // ✅ API endpoint for translations
      loadPath: "http://localhost:5000/locales/{{lng}}.json",
    },
  });

export default i18n;
