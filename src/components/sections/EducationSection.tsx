'use client'

import { JSX, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from '@/contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

interface TimelineEvent {
  year: string;
  period: string;
  title: string;
  description: string;
  detailedDescription: string;
  links?: Array<{
    label: string;
    url: string;
    type?: 'github' | 'demo' | 'website' | 'document';
  }>;
  status: "completed" | "current" | "upcoming";
}

export const EducationSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<(HTMLDivElement | null)[]>([]);
  const detailsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const timelineEvents: TimelineEvent[] = [
    {
      year: t.education.periods.bac.year,
      period: t.education.periods.bac.period,
      title: t.education.periods.bac.title,
      description: t.education.periods.bac.description,
      detailedDescription: t.education.periods.bac.detailedDescription,
      status: "completed"
    },
    {
      year: t.education.periods.year1.year,
      period: t.education.periods.year1.period,
      title: t.education.periods.year1.title,
      description: t.education.periods.year1.description,
      detailedDescription: t.education.periods.year1.detailedDescription,
      status: "completed"
    },
    {
      year: t.education.periods.internship1.year,
      period: t.education.periods.internship1.period,
      title: t.education.periods.internship1.title,
      description: t.education.periods.internship1.description,
      detailedDescription: t.education.periods.internship1.detailedDescription,
      status: "completed"
    },
    {
      year: t.education.periods.year2.year,
      period: t.education.periods.year2.period,
      title: t.education.periods.year2.title,
      description: t.education.periods.year2.description,
      detailedDescription: t.education.periods.year2.detailedDescription,
      links: [
        { label: "Projet Arcade", url: "https://github.com/remythai/Arcade-Epitech", type: "github" }
      ],
      status: "completed"
    },
    {
      year: t.education.periods.summer.year,
      period: t.education.periods.summer.period,
      title: t.education.periods.summer.title,
      description: t.education.periods.summer.description,
      detailedDescription: t.education.periods.summer.detailedDescription,
      links: [
        { label: "Mon avis Google", url: "https://maps.app.goo.gl/c12Ri7KysGTZ9NeG8", type: "website" }
      ],
      status: "completed"
    },
    {
      year: t.education.periods.year3.year,
      period: t.education.periods.year3.period,
      title: t.education.periods.year3.title,
      description: t.education.periods.year3.description,
      detailedDescription: t.education.periods.year3.detailedDescription,
      links: [
        { label: "Projet R-TYPE", url: "https://github.com/remythai/R-TYPE", type: "github" },
        { label: "Projet AREA", url: "https://github.com/LoukaOrtegaCand/AREA", type: "github" }
      ],
      status: "current"
    },
    {
      year: t.education.periods.internship2.year,
      period: t.education.periods.internship2.period,
      title: t.education.periods.internship2.title,
      description: t.education.periods.internship2.description,
      detailedDescription: t.education.periods.internship2.detailedDescription,
      status: "upcoming"
    },
    {
      year: t.education.periods.year4.year,
      period: t.education.periods.year4.period,
      title: t.education.periods.year4.title,
      description: t.education.periods.year4.description,
      detailedDescription: t.education.periods.year4.detailedDescription,
      status: "upcoming"
    },
    {
      year: t.education.periods.year5.year,
      period: t.education.periods.year5.period,
      title: t.education.periods.year5.title,
      description: t.education.periods.year5.description,
      detailedDescription: t.education.periods.year5.detailedDescription,
      status: "upcoming"
    }
  ];

  const toggleDetails = (index: number) => {
    const detail = detailsRef.current[index];
    if (!detail) return;

    if (expandedIndex === index) {
      gsap.to(detail, {
        height: 0,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => setExpandedIndex(null)
      });
    } else {
      if (expandedIndex !== null && detailsRef.current[expandedIndex]) {
        gsap.to(detailsRef.current[expandedIndex], {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut"
        });
      }

      setExpandedIndex(index);
      gsap.set(detail, { height: "auto", opacity: 0 });
      const autoHeight = detail.offsetHeight;
      gsap.set(detail, { height: 0 });

      gsap.to(detail, {
        height: autoHeight,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      });

      const content = detail.querySelector('.detail-content') as HTMLElement;
      if (content) {
        gsap.fromTo(content,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: "power2.out" }
        );
      }
    }
  };

  const handleLinkHover = (linkElement: HTMLAnchorElement, isEntering: boolean) => {
    const underline = linkElement.querySelector('.link-underline');
    const icon = linkElement.querySelector('.link-icon');

    if (isEntering) {
      gsap.to(underline, {
        scaleX: 1,
        transformOrigin: 'left',
        duration: 0.3,
        ease: "power2.out"
      });
      gsap.to(icon, {
        x: 3,
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      gsap.to(underline, {
        scaleX: 0,
        transformOrigin: 'right',
        duration: 0.3,
        ease: "power2.in"
      });
      gsap.to(icon, {
        x: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  };

  const getLinkIcon = (type?: string) => {
    switch (type) {
      case 'github':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        );
    }
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        {
          height: "0%",
          opacity: 0.3
        },
        {
          height: "100%",
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 30%",
            end: "bottom 70%",
            scrub: 1.5,
          }
        }
      );

      eventsRef.current.forEach((event, index) => {
        if (!event) return;

        const isLeft = index % 2 === 0;
        const isMobile = window.innerWidth < 768;

        gsap.fromTo(
          event,
          {
            opacity: 0,
            x: isMobile ? 0 : (isLeft ? -80 : 80),
            scale: 0.9
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: event,
              start: "top 80%",
              end: "top 50%",
              scrub: 1,
              toggleActions: "play none none reverse"
            }
          }
        );

        const dot = event.querySelector('.timeline-dot');
        if (dot) {
          gsap.fromTo(
            dot,
            {
              scale: 0,
              opacity: 0
            },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: event,
                start: "top 75%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-white dark:bg-white border-2 border-black dark:border-white";
      case "current":
        return "bg-blue-400 border-blue-400 border-2 animate-pulse";
      case "upcoming":
        return "bg-white/30 dark:bg-white/30 border-2 border-black/30 dark:border-white/30";
      default:
        return "bg-white dark:bg-white border-2 border-black dark:border-white";
    }
  };

  const getBorderClass = (status: string) => {
    if (status === "current") return "border-blue-400";
    if (status === "completed") return "border-black dark:border-white";
    return "border-black/30 dark:border-white/30";
  };

  return (
    <section
      id="education"
      ref={sectionRef}
      className="relative w-full min-h-screen py-16 md:py-24 overflow-x-hidden transition-colors duration-300 bg-[#f5f5f5] dark:bg-[#303030]"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl">
        <div className="mb-16 md:mb-24">
          <h2 className="font-bold text-2xl md:text-3xl tracking-[5.56px] mb-6 transition-colors duration-300 text-black dark:text-white">
            {t.education.title}
          </h2>
          <p className="font-normal text-sm md:text-[15px] leading-relaxed max-w-2xl transition-colors duration-300 text-black dark:text-white">
            {t.education.description}
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 w-0.5 h-full -translate-x-1/2 hidden md:block transition-colors duration-300 bg-black/20 dark:bg-white/20">
            <div
              ref={lineRef}
              className="absolute top-0 left-0 w-full origin-top transition-colors duration-300 bg-black dark:bg-white"
              style={{ height: "0%" }}
            />
          </div>

          <div className="absolute left-2 top-0 w-0.5 h-full md:hidden transition-colors duration-300 bg-black/20 dark:bg-white/20">
            <div
              className="absolute top-0 left-0 w-full origin-top transition-colors duration-300 bg-black dark:bg-white"
              style={{ height: "100%" }}
            />
          </div>

          <div className="space-y-12 md:space-y-24">
            {timelineEvents.map((event, index) => {
              const isLeft = index % 2 === 0;
              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={index}
                  ref={(el) => { eventsRef.current[index] = el; }}
                  className={`relative flex items-start ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`w-full md:w-[calc(50%-2rem)] ${isLeft ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'} pl-12 md:pl-0`}>
                    <div className="space-y-3">
                      <div className={`inline-block px-4 py-1 border-l-2 transition-colors duration-300 ${getBorderClass(event.status)}`}>
                        <span className="font-bold text-xs md:text-sm tracking-[1.6px] transition-colors duration-300 text-black dark:text-white">
                          {event.period}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg md:text-xl transition-colors duration-300 text-black dark:text-white">
                        {event.title}
                      </h3>

                      <p className="font-normal text-sm md:text-[15px] leading-relaxed transition-colors duration-300 text-black/80 dark:text-white/80">
                        {event.description}
                      </p>

                      <p className="font-semibold text-xs transition-colors duration-300 text-black/60 dark:text-white/60">
                        {event.year}
                      </p>

                      <div className={`flex ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                        <button
                          onClick={() => toggleDetails(index)}
                          className="group flex items-center gap-2 mt-4 transition-colors duration-300 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
                        >
                          <span className="text-sm font-medium">
                            {isExpanded ? t.education.seeLess : t.education.seeMore}
                          </span>
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      <div
                        ref={(el) => { detailsRef.current[index] = el; }}
                        className="overflow-hidden"
                        style={{ height: 0, opacity: 0 }}
                      >
                        <div className="detail-content mt-4 pt-4 border-t transition-colors duration-300 border-black/20 dark:border-white/20">
                          <p className="font-normal text-sm md:text-[15px] leading-relaxed mb-4 transition-colors duration-300 text-black/70 dark:text-white/70">
                            {event.detailedDescription}
                          </p>

                          {event.links && event.links.length > 0 && (
                            <div className={`flex flex-wrap gap-3 ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                              {event.links.map((link, linkIndex) => (
                                <a
                                  key={linkIndex}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-black/20 dark:border-white/20"
                                  onMouseEnter={(e) => handleLinkHover(e.currentTarget, true)}
                                  onMouseLeave={(e) => handleLinkHover(e.currentTarget, false)}
                                >
                                  <span className="link-icon transition-colors duration-300 text-black/70 dark:text-white/70 group-hover:text-black dark:group-hover:text-white">
                                    {getLinkIcon(link.type)}
                                  </span>
                                  <span className="text-sm font-medium transition-colors duration-300 text-black/70 dark:text-white/70 group-hover:text-black dark:group-hover:text-white">
                                    {link.label}
                                  </span>
                                  <span className="link-underline absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 origin-left scale-x-0" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-2 md:left-1/2 md:-translate-x-1/2 -translate-x-1/2 timeline-dot">
                    <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${getStatusClasses(event.status)}`} />
                    {event.status === "current" && (
                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-blue-400 opacity-30 animate-ping" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
