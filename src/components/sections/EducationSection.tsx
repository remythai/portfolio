'use client'
import { JSX, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

  const timelineEvents: TimelineEvent[] = [
    {
      year: "2021 - 2022",
      period: "Lycée Immaculée Conception - Pau",
      title: "Baccalauréat général - Mention Bien",
      description: "Spécialités Mathématiques et Physique-Chimie et section européenne",
      detailedDescription: "Après avoir lâché la spécialité Numérique et Sciences de l'Informatique en classe de 1ère, j'ai développé mes compétences analytiques et scientifiques à travers les spécialités Maths et Physique-Chimie. La section européenne m'a permis de renforcer mon anglais technique.",
      status: "completed"
    },
    {
      year: "2023",
      period: "EPITECH 1ère année",
      title: "Fondamentaux du Développement",
      description: "Introduction à la programmation, algorithmes et méthodologies de développement logiciel. En langage C.",
      detailedDescription: "Acquisition des bases solides en programmation C, structures de données, algorithmique et gestion de projets. Apprentissage de la méthodologie projet Epitech basée sur l'autonomie et le peer-learning.",
      status: "completed"
    },
    {
      year: "2024",
      period: "EPITECH 2ème année - Semestre 1",
      title: "Stage chez Rhinov",
      description: "Première expérience professionnelle significative en environnement de production.",
      detailedDescription: "Stage de 4 mois en environnement professionnel. Mise en pratique des compétences acquises, découverte des méthodologies agiles et intégration dans une équipe de développement. Migration du 'Book d'inspi' d'Angular à QwikJs.",
      status: "completed"
    },
    {
      year: "2024",
      period: "EPITECH 2ème année - Semestre 2",
      title: "Approfondissement Technique",
      description: "Développement avancé, architecture logicielle et projets collaboratifs en équipe. En langage C++.",
      detailedDescription: "Projets avancés incluant le développement d'une borne d'arcade avec plusieurs librairies graphiques en C++ (Projet Arcade). Maîtrise de la Programmation Orientée Objet, des design patterns et des outils de collaboration Git. Travail en équipe sur des projets complexes.",
      links: [
        { label: "Arcade Project", url: "https://github.com/remythai/Arcade-Epitech", type: "github" }
      ],
      status: "completed"
    },
    {
      year: "2024",
      period: "ÉTÉ 2024",
      title: "Job d'Été",
      description: "Runner au Diego à Arcachon Plage",
      detailedDescription: "Expérience estivale permettant de financer mes études tout en développant ma polyvalence. Service, bar, plonge, relation client, j'ai pu découvrir de nombreux aspects de la restauration. J'ai même obtenu un commentaire par rapport à mon service !",
      links: [
        { label: "Mon avis Google", url: "https://maps.app.goo.gl/c12Ri7KysGTZ9NeG8", type: "website" }
      ],
      status: "completed"
    },
    
    {
      year: "2025",
      period: "EPITECH YEAR 3 - S1",
      title: "Projets conséquents",
      description: "Développement full-stack, réalisation d'un moteur graphique de jeu, projets complexes et technologies modernes.",
      detailedDescription: "Projets comme l'AREA (plateforme d'Action-Reaction) avec OAuth, Next.js, React, Node.js et PostgreSQL. Maîtrise de Docker, des API REST et de l'architecture full-stack moderne. Ainsi que la réalisation du projet R-Type, reproduction du jeu R-Type en C++ en réseau avec un ECS maison.",
      links: [
        { label: "R-TYPE Project", url: "https://github.com/remythai/R-TYPE", type: "github" },
        { label: "AREA Project", url: "https://github.com/LoukaOrtegaCand/AREA", type: "github" }
      ],
      status: "current"
    },
    {
      year: "2025-2026",
      period: "EPITECH YEAR 3 - S2",
      title: "Stage chez Lemissa",
      description: "Application des compétences avancées en environnement professionnel.",
      detailedDescription: "Stage 4 mois pour approfondir mes compétences techniques et acquérir une expertise dans un domaine de spécialisation.",
      status: "upcoming"
    },
    {
      year: "2026-2027",
      period: "EPITECH YEAR 4",
      title: "Expérience Internationale",
      description: "Année à l'étranger pour ouverture culturelle et professionnelle à l'international.",
      detailedDescription: "Semestre d'études ou stage à l'international pour découvrir de nouvelles cultures de travail et développer mon réseau professionnel mondial.",
      status: "upcoming"
    },
    {
      year: "2027-2028",
      period: "EPITECH YEAR 5",
      title: "Expertise & Diplôme",
      description: "Projet de fin d'études et transition vers le monde professionnel en tant qu'ingénieur.",
      detailedDescription: "Projet de fin d'études ambitieux et stage de fin d'études. Obtention du titre d'Expert en Technologies de l'Information (niveau 7 - Bac+5).",
      status: "upcoming"
    }
  ];

  const toggleDetails = (index: number) => {
    const detail = detailsRef.current[index];
    if (!detail) return;

    if (expandedIndex === index) {
      // Fermeture
      gsap.to(detail, {
        height: 0,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => setExpandedIndex(null)
      });
    } else {
      // Ferme l'ancien
      if (expandedIndex !== null && detailsRef.current[expandedIndex]) {
        gsap.to(detailsRef.current[expandedIndex], {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut"
        });
      }

      // Calcule la hauteur réelle avant l'animation
      setExpandedIndex(index);
      const content = detail.querySelector('.detail-content') as HTMLElement;
      
      // Mesure temporaire de la hauteur
      gsap.set(detail, { height: "auto", opacity: 0 });
      const autoHeight = detail.offsetHeight;
      gsap.set(detail, { height: 0 });

      // Animation d'ouverture avec la hauteur calculée
      gsap.to(detail, {
        height: autoHeight,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      });
      
      // Animation du contenu
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
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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
        
        gsap.fromTo(
          event,
          {
            opacity: 0,
            x: isLeft ? -80 : 80,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-white border-white";
      case "current":
        return "bg-blue-400 border-blue-400 animate-pulse";
      case "upcoming":
        return "bg-white/30 border-white/30";
      default:
        return "bg-white border-white";
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full min-h-screen py-16 md:py-24"
    >
      {/* Fond #303030 */}
      <div className="absolute inset-0 bg-[#303030] -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl">
        <div className="mb-16 md:mb-24">
          <h2 className="font-bold text-white text-2xl md:text-3xl tracking-[5.56px] mb-6">
            MON PARCOURS
          </h2>
          <p className="font-normal text-white text-sm md:text-[15px] leading-relaxed max-w-2xl">
            De mes études secondaires à ma formation d'ingénieur chez Epitech, 
            découvrez les étapes clés qui ont façonné mon parcours professionnel.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 w-0.5 h-full -translate-x-1/2 bg-white/20 hidden md:block">
            <div 
              ref={lineRef}
              className="absolute top-0 left-0 w-full bg-white origin-top"
              style={{ height: "0%" }}
            />
          </div>

          <div className="absolute left-6 top-0 w-0.5 h-full bg-white/20 md:hidden">
            <div 
              ref={lineRef}
              className="absolute top-0 left-0 w-full bg-white origin-top"
              style={{ height: "0%" }}
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
                  className={`relative flex items-start ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-row`}
                >
                  <div className={`w-full md:w-[calc(50%-2rem)] ${
                    isLeft ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'
                  } pl-16 md:pl-0`}>
                    <div className="space-y-3">
                      <div className={`inline-block px-4 py-1 border-l-2 ${
                        event.status === "current" 
                          ? "border-blue-400" 
                          : event.status === "completed"
                          ? "border-white"
                          : "border-white/30"
                      }`}>
                        <span className="font-bold text-white text-xs md:text-sm tracking-[1.6px]">
                          {event.period}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-white text-lg md:text-xl">
                        {event.title}
                      </h3>
                      
                      <p className="font-normal text-white/80 text-sm md:text-[15px] leading-relaxed">
                        {event.description}
                      </p>
                      
                      <p className="font-semibold text-white/60 text-xs">
                        {event.year}
                      </p>

                      <div className={`flex ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                        <button
                          onClick={() => toggleDetails(index)}
                          className="group flex items-center gap-2 mt-4 text-white/70 hover:text-white transition-colors duration-300"
                        >
                          <span className="text-sm font-medium">
                            {isExpanded ? 'Voir moins' : 'En savoir plus'}
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

                      {/* Contenu caché avec height: 0 par défaut */}
                      <div
                        ref={(el) => { detailsRef.current[index] = el; }}
                        className="overflow-hidden"
                        style={{ height: 0, opacity: 0 }}
                      >
                        <div className="detail-content mt-4 pt-4 border-t border-white/20">
                          <p className="font-normal text-white/70 text-sm md:text-[15px] leading-relaxed mb-4">
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
                                  className="group relative inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-all duration-300"
                                  onMouseEnter={(e) => handleLinkHover(e.currentTarget, true)}
                                  onMouseLeave={(e) => handleLinkHover(e.currentTarget, false)}
                                >
                                  <span className="link-icon text-white/70 group-hover:text-white transition-colors duration-300">
                                    {getLinkIcon(link.type)}
                                  </span>
                                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors duration-300">
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

                  <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 timeline-dot">
                    <div className={`w-4 h-4 rounded-full border-2 ${getStatusColor(event.status)}`} />
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
