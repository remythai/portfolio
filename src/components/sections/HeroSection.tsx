'use client'

import { JSX, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';

export const HeroSection = (): JSX.Element => {
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { t } = useLanguage();

  const socialIcons = [
    {
      alt: "CV",
      href: t.hero.cvLink,
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19H8V17H10V19M14,19H12V10H14V19M10,15H8V13H10V15M14,7H12V5H14V7Z" />
        </svg>
      )
    },
    {
      alt: "LinkedIn",
      href: "https://www.linkedin.com/in/remy-thai/",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      )
    },
    {
      alt: "Github",
      href: "https://github.com/remythai",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      )
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.1 }
      ).fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" },
        "-=0.5"
      ).fromTo(
        buttonRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" },
        "-=0.3"
      );
    });

    return () => ctx.revert();
  }, []);

  if (!mounted) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-[#f5f5f5] dark:bg-[#303030]" />
    );
  }

  return (
    <section className="relative w-full h-screen overflow-hidden transition-colors duration-300 bg-[#f5f5f5] dark:bg-[#303030]">
      <div
        className="absolute inset-0 hidden lg:block transition-colors duration-300 bg-[#303030] dark:bg-[#d7d7d7]"
        style={{
          clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 42% 100%)'
        }}
      />

      <div className="relative w-full h-full hidden lg:flex items-center px-4 lg:px-[271px] z-10">
        <div className="w-full flex flex-row items-center gap-12">
          <div ref={textRef} className="w-auto flex flex-col justify-center items-start">
            <div className="text-left">
              <p className="font-raleway font-bold text-[40px] mb-6 transition-colors duration-300 text-black dark:text-white">
                {t.hero.greeting}
              </p>

              <h1 className="font-raleway font-bold text-[80px] leading-tight mb-6 transition-colors duration-300 text-black dark:text-white">
                {t.hero.name}
              </h1>

              <p className="font-raleway font-extrabold text-[25px] mb-12 transition-colors duration-300 text-[#3a3a3a] dark:text-[#6f6f6f]">
                {t.hero.title}
              </p>

              <div className="flex gap-8 justify-start mb-8">
                {socialIcons.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target={social.alt !== "CV" ? "_blank" : undefined}
                    rel={social.alt !== "CV" ? "noopener noreferrer" : undefined}
                    className="w-16 h-16 shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center bg-[#e5e5e5] dark:bg-[#3b3b3b] text-[#303030] dark:text-[#d7d7d7]"
                    aria-label={social.alt}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              <a
                ref={buttonRef}
                href="#education"
                className="inline-flex items-center justify-center w-48 h-14 font-raleway font-bold text-lg bg-[#3a3a3a] dark:bg-[#d7d7d7] text-white dark:text-[#303030] shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-lg"
              >
                {t.hero.viewPath}
              </a>
            </div>
          </div>

          <div className="absolute bottom-0 right-[150px]">
            <div className="relative w-[700px] h-[784px]">
              <Image
                src={theme === 'dark' ? "/remy.png" : "/remy_white.png"}
                alt="Rémy Thai professional photo"
                fill
                sizes="700px"
                className="object-cover object-bottom transition-opacity duration-300"
                priority
                quality={85}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-full flex lg:hidden">
        <div ref={imageRef} className="absolute bottom-0 left-0 right-0 z-0">
          <div className="relative w-full h-[850px]">
            <Image
              src={theme === 'dark' ? "/remy.png" : "/remy_white.png"}
              alt="Rémy Thai professional photo"
              fill
              sizes="100vw"
              className="object-cover object-top transition-opacity duration-300"
              priority
              quality={85}
            />
          </div>
        </div>

        <div
          className="absolute inset-0 backdrop-blur-sm z-5 transition-colors duration-300"
          style={{
            backgroundColor: 'rgba(245, 245, 245, 0.6)',
            clipPath: 'polygon(0 82.5%, 100% 70%, 100% 100%, 0 100%)'
          }}
        />

        <div ref={textRef} className="absolute bottom-6 left-6 z-10">
          <p className="font-raleway font-bold text-lg mb-2 transition-colors duration-300 text-[#303030] dark:text-white">
            {t.hero.greeting}
          </p>

          <h1 className="font-raleway font-bold text-4xl leading-tight mb-2 transition-colors duration-300 text-[#303030] dark:text-white">
            {t.hero.name}
          </h1>

          <p className="font-raleway font-extrabold text-base transition-colors duration-300 text-[#505050] dark:text-[#e5e5e5]">
            {t.hero.title}
          </p>
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-20">
          {socialIcons.map((social, index) => (
            <a
              key={index}
              href={social.href}
              target={social.alt !== "CV" ? "_blank" : undefined}
              rel={social.alt !== "CV" ? "noopener noreferrer" : undefined}
              className="w-12 h-12 shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center rounded bg-[#505050] dark:bg-[#c4c4c4] text-white dark:text-[#303030]"
              aria-label={social.alt}
            >
              {social.icon}
            </a>
          ))}
          <a
            ref={buttonRef}
            href="#education"
            className="w-12 h-12 shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center rounded bg-[#3a3a3a] dark:bg-[#d7d7d7] text-white dark:text-[#303030]"
            aria-label="Aller à la section éducation"
          >
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};
