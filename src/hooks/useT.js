import { useSelector } from "react-redux";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import mr from "../locales/mr.json";
import { selectLanguage } from "../slices/languageSlice";

const translations = { en, hi, mr };

export default function useT() {
  const language = useSelector(selectLanguage) || "en";

  const t = (key, fallback = "") => {
    const keys = key.split(".");
    let result = translations[language];
    for (let k of keys) {
      result = result?.[k];
      if (result === undefined) return fallback;
    }
    return result;
  };

  return t;
}
