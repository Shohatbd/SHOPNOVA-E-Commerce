import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';

interface LanguageContextType {
  lang: Language;
  language: Language;
  setLang: (lang: Language) => void;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  isBn: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('shopnova_lang');
    return (saved === 'bn' || saved === 'en') ? saved : 'bn';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('shopnova_lang', newLang);
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const isBn = lang === 'bn';

  const t = (key: keyof typeof translations.en): string => {
    const currentDict = isBn ? translations.bn : translations.en;
    return (currentDict as any)[key] || translations.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, language: lang, setLang, setLanguage: setLang, t, isBn }}>
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

