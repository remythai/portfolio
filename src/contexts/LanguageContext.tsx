'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fr, Translations } from '@/locales/fr';
import { en } from '@/locales/en';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'fr';
  
  const browserLang = navigator.language || (navigator as any).userLanguage || 'fr';
  
  const shortLang = browserLang.substring(0, 2).toLowerCase();
  
  return shortLang === 'en' ? 'en' : 'fr';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language | null;
      
      if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      } else {
        const detectedLang = detectBrowserLanguage();
        setLanguageState(detectedLang);
        localStorage.setItem('language', detectedLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const translations = language === 'fr' ? fr : en;

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
