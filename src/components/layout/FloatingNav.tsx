'use client'

import { JSX, useState, useEffect } from "react";
import { gsap } from "gsap";

const sections = ['#hero', '#education','#about', '#skills', '#portfolio', '#contact'];

export const FloatingNav = (): JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      sections.forEach((section, index) => {
        const element = document.querySelector(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;
          
          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setCurrentIndex(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(sections.length - 1, currentIndex + 1);

    gsap.to(window, {
      duration: 1,
      scrollTo: {
        y: sections[targetIndex],
        offsetY: 0
      },
      ease: "power3.inOut"
    });
  };

  const canGoUp = currentIndex > 0;
  const canGoDown = currentIndex < sections.length - 1;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
      <button
        onClick={() => scrollToSection('up')}
        disabled={!canGoUp}
        className={`group w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white shadow-lg hover:shadow-xl transition-all border-2 border-black ${
          canGoUp 
            ? 'hover:bg-black hover:text-white cursor-pointer' 
            : 'opacity-30 cursor-not-allowed'
        }`}
        aria-label="Section précédente"
      >
        <svg 
          className="w-6 h-6 transition-transform group-hover:-translate-y-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        onClick={() => scrollToSection('down')}
        disabled={!canGoDown}
        className={`group w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white shadow-lg hover:shadow-xl transition-all border-2 border-black ${
          canGoDown 
            ? 'hover:bg-black hover:text-white cursor-pointer' 
            : 'opacity-30 cursor-not-allowed'
        }`}
        aria-label="Section suivante"
      >
        <svg 
          className="w-6 h-6 transition-transform group-hover:translate-y-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};
