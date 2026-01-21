'use client'

import { JSX, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";

export const IntroductionHeroSection = (): JSX.Element => {
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const navigationLinks = [
    { label: "A propos", href: "#about" },
    { label: "Compétences", href: "#skills" },
    { label: "Portfolio", href: "#portfolio" },
  ];

  const socialIcons = [
    {
      alt: "CV",
      href: "/cv.pdf",
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
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      ).fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        "-=0.7"
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative w-full h-screen bg-[#d7d7d7] overflow-hidden">
      <div
        className="absolute inset-0 bg-[#303030]"
        style={{
          clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 42% 100%)'
        }}
      />

      <nav className="absolute top-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className="hidden lg:flex items-center gap-4 xl:gap-8">
          {navigationLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="font-montserrat font-bold text-white text-sm xl:text-[17px] hover:text-gray-300 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="px-6 py-2 bg-white text-black rounded-full border-4 border-white font-montserrat font-bold text-sm xl:text-[15px] hover:bg-transparent hover:text-white transition-all"
          >
            ME CONTACTER
          </a>
        </div>

        <button
          className="lg:hidden p-2 text-white"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      <div className="relative w-full h-full flex items-center px-4 lg:px-[271px] z-10">
        <div className="w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div ref={textRef} className="w-full lg:w-auto flex flex-col justify-center items-center lg:items-start order-2 lg:order-1">
            <div className="text-center lg:text-left">
              <p className="font-raleway font-bold text-black text-2xl sm:text-3xl md:text-[40px] mb-4 md:mb-6">
                Bonjour, je suis
              </p>

              <h1 className="font-raleway font-bold text-black text-4xl sm:text-5xl md:text-6xl lg:text-[80px] leading-tight mb-4 md:mb-6">
                Rémy Thai
              </h1>

              <p className="font-raleway font-extrabold text-[#909090] text-lg sm:text-xl md:text-[25px] mb-8 md:mb-12">
                Développeur informatique
              </p>

              <div className="flex gap-6 md:gap-8 justify-center lg:justify-start">
                {socialIcons.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target={social.alt !== "CV" ? "_blank" : undefined}
                    rel={social.alt !== "CV" ? "noopener noreferrer" : undefined}
                    className="w-14 h-14 md:w-16 md:h-16 bg-[#c4c4c4] shadow-lg hover:shadow-xl hover:scale-110 hover:bg-[#b0b0b0] transition-all flex items-center justify-center text-[#303030]"
                    aria-label={social.alt}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div ref={imageRef} className="absolute bottom-0 right-[150px] order-1 lg:order-2 hidden lg:block">
            <div className="relative w-[700px] h-[784px]">
              <Image
                src="/remy.png"
                alt="Rémy Thai professional photo"
                fill
                sizes="700px"
                className="object-cover object-bottom"
                priority
                quality={85}
              />
            </div>
          </div>
          <div className="relative flex-shrink-0 order-1 lg:hidden">
            <div className="relative w-[250px] sm:w-[350px] h-[280px] sm:h-[392px]">
              <Image
                src="/remy.png"
                alt="Rémy Thai professional photo"
                fill
                sizes="(max-width: 640px) 250px, 350px"
                className="object-cover object-top"
                priority
                quality={85}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
