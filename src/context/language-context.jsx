
'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import or from '@/locales/or.json';

const translations = { en, hi, or };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('guardian-angel-lang');
    if (storedLang && translations[storedLang]) {
      setLanguage(storedLang);
    }
  }, []);

  const setLanguageAndStore = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('guardian-angel-lang', lang);
    }
  };
  
  const t = useMemo(() => (key, replacements = {}) => {
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      result = result?.[k];
    }
    
    // Fallback to English if translation is missing
    if (result === undefined) {
        let fallbackResult = translations['en'];
        for (const k of keys) {
            fallbackResult = fallbackResult?.[k];
        }
        result = fallbackResult;
    }

    if (result === undefined) {
        return key;
    }
    
    if (typeof result === 'string' && Object.keys(replacements).length > 0) {
      return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
        return acc.replace(`{${placeholder}}`, value);
      }, result);
    }
    
    return result;
  }, [language]);

  const value = { language, setLanguage: setLanguageAndStore, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
