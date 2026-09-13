import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import { useSettings } from './SettingsContext.tsx';

interface LanguageContextType {
  lang: Language;
  language: Language;
  setLang: (lang: Language) => void;
  setLanguage: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: keyof typeof translations.en) => string;
  isBn: boolean;
  storeDefaultLang: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();

  // Admin-configured default language (defaults to 'en' per user requirement)
  const storeDefaultLang: Language =
    settings?.default_language === 'bn' || settings?.default_language === 'en'
      ? settings.default_language
      : 'en';

  const [lang, setLangState] = useState<Language>(() => {
    // 1. Check URL parameters for explicit language switch (e.g. ?lang=bn or ?lang=en)
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang');
        if (urlLang === 'bn' || urlLang === 'en') {
          sessionStorage.setItem('shophatbd_manual_lang', urlLang);
          return urlLang;
        }
      } catch {
        // ignore
      }
    }

    // 2. Check if user manually switched language during this browsing session
    if (typeof window !== 'undefined') {
      try {
        const sessionLang = sessionStorage.getItem('shophatbd_manual_lang');
        if (sessionLang === 'bn' || sessionLang === 'en') {
          return sessionLang;
        }
      } catch {
        // ignore
      }
    }

    // 3. Check previously stored choice
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('shophatbd_lang');
        if (saved === 'bn' || saved === 'en') {
          return saved;
        }
      } catch {
        // ignore
      }
    }

    // 4. Default language of the website is 'en' (English)
    return 'en';
  });

  // When admin changes the store language in Settings:
  useEffect(() => {
    if (!settings?.default_language) return;

    const targetLang: Language =
      settings.default_language === 'bn' || settings.default_language === 'en'
        ? settings.default_language
        : 'en';

    let lastAdminLang = null;
    try {
      lastAdminLang = localStorage.getItem('shophatbd_admin_configured_lang');
    } catch {
      // ignore
    }

    if (lastAdminLang !== targetLang) {
      try {
        localStorage.setItem('shophatbd_admin_configured_lang', targetLang);
        sessionStorage.removeItem('shophatbd_manual_lang');
      } catch {
        // ignore
      }
      setLangState(targetLang);
      document.documentElement.lang = targetLang;
    }
  }, [settings?.default_language]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    document.documentElement.lang = newLang;
    try {
      sessionStorage.setItem('shophatbd_manual_lang', newLang);
      localStorage.setItem('shophatbd_lang', newLang);
    } catch {
      // ignore
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  }, [lang, setLang]);

  // Keep synced across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'shophatbd_lang' || e.key === 'shopnova_lang') && (e.newValue === 'bn' || e.newValue === 'en')) {
        setLangState(e.newValue);
        document.documentElement.lang = e.newValue;
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = useCallback((key: keyof typeof translations.en): string => {
    const currentDict = lang === 'bn' ? translations.bn : translations.en;
    return (currentDict as any)[key] || translations.en[key] || String(key);
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      language: lang,
      setLang,
      setLanguage: setLang,
      toggleLang,
      t,
      isBn: lang === 'bn',
      storeDefaultLang,
    }),
    [lang, setLang, toggleLang, t, storeDefaultLang]
  );

  return (
    <LanguageContext.Provider value={value}>
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

