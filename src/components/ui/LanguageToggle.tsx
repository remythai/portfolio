'use client'

import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10" aria-hidden="true" />
    );
  }

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-white/95 dark:bg-[#303030]/95 border border-black/10 dark:border-white/20 shadow-lg hover:scale-110"
      aria-label={`Switch to ${language === 'fr' ? 'English' : 'French'}`}
    >
      <span className="font-montserrat font-bold text-sm md:text-base text-black dark:text-white">
        {language === 'fr' ? 'EN' : 'FR'}
      </span>
    </button>
  );
};
