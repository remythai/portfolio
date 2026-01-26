'use client'

import { JSX, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useLanguage } from '@/contexts/LanguageContext';

export const SocialMediaFooterSection = (): JSX.Element => {
  const { t } = useLanguage();
  const arrowRef = useRef<SVGSVGElement>(null);

  const socialMediaLinks = [
    {
      alt: "CV",
      href: t.footer.cvLink,
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19H8V17H10V19M14,19H12V10H14V19M10,15H8V13H10V15M14,7H12V5H14V7Z" />
        </svg>
      )
    },
    {
      alt: "LinkedIn",
      href: "https://www.linkedin.com/in/remy-thai/",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      )
    },
    {
      alt: "Github",
      href: "https://github.com/remythai",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      )
    },
  ];

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (arrowRef.current) {
      gsap.set(arrowRef.current, {
        transformOrigin: "center center"
      });

      gsap.fromTo(
        arrowRef.current,
        { rotation: 90 },
        { rotation: 0, duration: 1, ease: "power2.out" }
      );
    }
  }, []);

  const handleHover = (isEntering: boolean) => {
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        y: isEntering ? -4 : 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  return (
    <footer className="relative w-full transition-colors duration-300 bg-[#1a1a1a] dark:bg-black py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8 md:mb-12">
          <button
            onClick={handleBackToTop}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            className="group flex items-center gap-2 font-montserrat font-bold transition-colors duration-300 text-white hover:text-gray-300 dark:hover:text-gray-400 text-sm md:text-base tracking-wider bg-transparent border-0 cursor-pointer"
            aria-label="Back to top"
          >
            {t.footer.backToTop}
            <svg
              ref={arrowRef}
              className="w-4 h-4 inline-block"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 4l-8 8h6v8h4v-8h6z" />
            </svg>
          </button>
        </div>

        <nav
          className="flex justify-center gap-6 md:gap-8 mb-8 md:mb-12"
          aria-label="Social media links"
        >
          {socialMediaLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target={link.alt !== "CV" ? "_blank" : undefined}
              rel={link.alt !== "CV" ? "noopener noreferrer" : undefined}
              aria-label={link.alt}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 hover:scale-110 bg-[#303030] dark:bg-[#0a0a0a] hover:bg-[#404040] dark:hover:bg-[#1a1a1a] text-white"
            >
              {link.icon}
            </a>
          ))}
        </nav>

        <p className="text-center font-nunito text-white text-sm md:text-base lg:text-lg">
          <span className="font-bold">{t.footer.copyright}</span>
        </p>
        <p className="text-center font-nunito text-white text-sm md:text-base lg:text-lg">
          <span className="font-normal">{t.footer.madeWith}</span>
        </p>
      </div>
    </footer>
  );
};
