'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect } from 'react'
import type { ComponentProps } from 'react'

export function ThemeProvider({ 
  children, 
  ...props 
}: ComponentProps<typeof NextThemesProvider>) {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const classList = document.documentElement.classList;
      if (classList.contains('light')) {
        classList.remove('light');
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="portfolio-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
