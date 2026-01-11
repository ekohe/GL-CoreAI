import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { getStorage } from "../utils";
import { DEFAULT_LANGUAGE } from "../utils/constants";
import i18n from "../locales";

export type Language = "en" | "zh_CN" | "fr" | "ja";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE as Language);

  // Load saved language on mount
  useEffect(() => {
    getStorage(["GASLanguage"], (result) => {
      if (result.GASLanguage) {
        const savedLang = result.GASLanguage as Language;
        setLanguageState(savedLang);
        i18n.changeLanguage(savedLang);
      }
    });
  }, []);

  // Update i18n when language changes
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  const context = useContext(LanguageContext);
  const { t } = useTranslation();

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return { ...context, t };
};

export { LanguageProvider, useLanguage };
