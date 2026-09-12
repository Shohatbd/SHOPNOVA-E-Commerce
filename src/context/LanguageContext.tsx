import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';

interface LanguageContextType {
  lang: Language;
  language: Language;
  setLang: (lang: Language) => void;
  setLanguage: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: keyof typeof translations.en) => string;
  isBn: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    // Check URL parameters for explicit language switch (e.g. ?lang=bn or ?lang=en)
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang');
        if (urlLang === 'bn' || urlLang === 'en') {
          localStorage.setItem('shophatbd_lang', urlLang);
          localStorage.setItem('shopnova_lang', urlLang);
          return urlLang;
        }
      } catch {
        // ignore
      }
    }

    const saved = localStorage.getItem('shophatbd_lang') || localStorage.getItem('shopnova_lang');
    return (saved === 'bn' || saved === 'en') ? saved : 'bn';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('shophatbd_lang', newLang);
      localStorage.setItem('shopnova_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Keep synced across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'shophatbd_lang' || e.key === 'shopnova_lang') && (e.newValue === 'bn' || e.newValue === 'en')) {
        setLangState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isBn = lang === 'bn';

  const t = (key: keyof typeof translations.en): string => {
    const currentDict = isBn ? translations.bn : translations.en;
    return (currentDict as any)[key] || translations.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, language: lang, setLang, setLanguage: setLang, toggleLang, t, isBn }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

