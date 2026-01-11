import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import enSettings from "./en/settings.json";
import zhCNSettings from "./zh_CN/settings.json";
import frSettings from "./fr/settings.json";
import jaSettings from "./ja/settings.json";

// Resources organized by language
const resources = {
  en: {
    settings: enSettings,
  },
  zh_CN: {
    settings: zhCNSettings,
  },
  fr: {
    settings: frSettings,
  },
  ja: {
    settings: jaSettings,
  },
};

// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en",
  defaultNS: "settings",
  ns: ["settings"],
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
  react: {
    useSuspense: false, // Disable suspense for Chrome extension compatibility
  },
});

export default i18n;
