'use client'

import { JSX, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const filterCategories = [
  { id: "all", label: "TOUS" },
  { id: "school", label: "EPITECH" },
  { id: "other", label: "AUTRES" },
];

const projectData = [
  {
    id: 1,
    title: "AREA",
    description: "Plateforme Action-Reaction avec OAuth, Next.js, React, Node.js et PostgreSQL. Architecture full-stack moderne avec Docker et API REST. Disponible sur web & sur mobile.",
    category: ["school"],
    tags: "Next.js • OAuth • Docker",
    githubLink: "https://github.com/LoukaOrtegaCand/AREA",
    demoLink: null,
    image: "/projects/area.png",
    inProgress: false,
  },
  {
    id: 2,
    title: "R-TYPE",
    description: "Reproduction du célèbre shoot'em up en C++ avec architecture réseau client-serveur et ECS (Entity Component System) maison. Projet multiplateforme.",
    category: ["school"],
    tags: "C++ • Réseau • Game Engine",
    githubLink: "https://github.com/remythai/R-TYPE",
    demoLink: null,
    image: "/projects/rtype.png",
    inProgress: false,
  },
  {
    id: 3,
    title: "Neural Network",
    description: "Réseau de neurones pour l'analyse de positions d'échecs avec classification Check/Checkmate/Nothing. Dataset de 723K positions, accuracy ~84%.",
    category: ["school"],
    tags: "Python • Deep Learning • Chess",
    githubLink: "https://github.com/remythai/G-CNA-500-BDX-5-1-neuralnetwork-2",
    demoLink: null,
    image: "/projects/neuralnetwork.jpg",
    inProgress: false,
  },
  {
    id: 4,
    title: "Arcade",
    description: "Borne d'arcade avec abstraction de multiples librairies graphiques (SDL2, SFML, NCurses). Design patterns et architecture modulaire en C++.",
    category: ["school"],
    tags: "C++ • OOP • Design Patterns",
    githubLink: "https://github.com/remythai/Arcade-Epitech",
    demoLink: null,
    image: "/projects/arcade.png",
    inProgress: false,
  },
  {
    id: 5,
    title: "NanoTekSpice",
    description: "Simulateur de circuits électroniques numériques. Modélisation de composants logiques (portes AND, OR, NOT, ...) et circuits intégrés en C++.",
    category: ["school"],
    tags: "C++ • Logic Gates • Simulation",
    githubLink: "https://github.com/remythai/B-OOP-400-BDX-4-1-tekspice-remy.thai",
    demoLink: null,
    image: "/projects/nts.png",
    inProgress: false,
  },
  {
    id: 6,
    title: "my_paint",
    description: "Logiciel de dessin bitmap en C. Gestion d'événements, formes géométriques, calques et outils de peinture avec interface graphique.",
    category: ["school"],
    tags: "C • Graphics • UI",
    githubLink: "https://github.com/remythai/B-MUL-200-BDX-2-1-mypaint-remy.thai",
    demoLink: null,
    image: "/projects/paint.png",
    inProgress: false,
  },
  {
    id: 7,
    title: "Init",
    description: "Générateur d'applications de rencontre éphémère autour d'événements. Connecte des personnes partageant un même centre d'intérêt le temps d'un événement.",
    category: ["other"],
    tags: "Mobile • Event-based • Social",
    githubLink: null,
    demoLink: null,
    image: "/projects/init.png",
    inProgress: true,
  },
  {
    id: 8,
    title: "M-Tech",
    description: "Association étudiante de Bordeaux - Mandat 2024-2025. Organisation de soirées à thèmes et événements étudiants pour animer la vie du campus.",
    category: ["other"],
    tags: "Associatif • Événementiel • BDE",
    githubLink: null,
    demoLink: null,
    image: "/projects/mtech.jpg",
    inProgress: false,
  },
  {
    id: 9,
    title: "Pau'Propre",
    description: "Association écologique de Pau. Participation à des clean walks et actions de sensibilisation environnementale dans la région paloise.",
    category: ["other"],
    tags: "Écologie • Clean Walk • Bénévolat",
    githubLink: null,
    demoLink: null,
    image: "/projects/paupropre.jpg",
    inProgress: false,
  },
  {
    id: 10,
    title: "Astexte",
    description: "Assistance de la professeure de communication professionnelle à Epitech (2ème et 3ème année). Aide à la préparation, au bon déroulement des cours ainsi qu'à la notation des étudiants.",
    category: ["other"],
    tags: "Langues • Communication Professionnelle • Correcteur",
    githubLink: null,
    demoLink: null,
    image: "/pau.jpg",
    inProgress: false,
  },
  {
    id: 11,
    title: "Portfolio",
    description: "Vous êtes déjà au bon endroit ! Hébergé, nom de domaine, responsive !",
    category: ["other"],
    tags: "Jour - Nuit • Responsiveness • Portfolio",
    githubLink: null,
    demoLink: null,
    image: "/pau.jpg",
    inProgress: false,
  },
];

export const ProjectGallerySection = (): JSX.Element => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [mounted, setMounted] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(6);
  const [isExpanded, setIsExpanded] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const projectGridRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const filteredProjects = projectData.filter((project) => {
    if (activeFilter === "all") return true;
    return project.category.includes(activeFilter);
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setItemsToShow(isMobile ? 3 : 6);
      setIsExpanded(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!filterRef.current || !indicatorRef.current) return;

    const buttons = filterRef.current.querySelectorAll("button");
    const activeButton = Array.from(buttons).find(
      (btn) => btn.getAttribute("data-filter") === activeFilter
    ) as HTMLElement | undefined;

    if (activeButton) {
      gsap.to(indicatorRef.current, {
        width: activeButton.offsetWidth,
        x: activeButton.offsetLeft,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  }, [activeFilter]);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setIsExpanded(false);
  };

  const handleLoadMore = () => {
    setIsExpanded(true);
    setItemsToShow(filteredProjects.length);
  };

  const handleShowLess = () => {
    setIsExpanded(false);
    const isMobile = window.innerWidth < 768;
    setItemsToShow(isMobile ? 3 : 6);

    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const visibleProjects = filteredProjects.slice(0, itemsToShow);
  const hasMore = filteredProjects.length > itemsToShow;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        },
      });

      const projectCards = projectGridRef.current?.querySelectorAll(".project-card");
      if (projectCards) {
        gsap.from(projectCards, {
          opacity: 0,
          y: 80,
          scale: 0.9,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: projectGridRef.current,
            start: "top 70%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const projectCards = projectGridRef.current?.querySelectorAll(".project-card");
    if (projectCards && projectCards.length > 0) {
      gsap.fromTo(
        projectCards,
        { opacity: 0, scale: 0.95, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    }
  }, [filteredProjects, itemsToShow]);

  if (!mounted) {
    return <></>;
  }

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="relative w-full min-h-screen pb-12 md:pb-16 lg:pb-20 overflow-hidden transition-colors duration-300 bg-[#f5f5f5] dark:bg-[#303030]"
    >
      <div
        ref={titleRef}
        className="relative w-full h-48 md:h-64 lg:h-80 mb-8 md:mb-12 flex items-center justify-center overflow-hidden"
      >
        <Image
          src="/pau.jpg"
          alt="Portfolio background - Pau panoramic"
          fill
          sizes="100vw"
          className="object-cover"
          quality={75}
          priority
        />

        <div className="absolute inset-0 transition-colors duration-300 bg-black/40 dark:bg-black/60" />

        <div className="relative z-10 border-4 md:border-8 border-solid border-white px-8 md:px-12 py-4 md:py-6">
          <h2 className="font-montserrat font-bold text-2xl sm:text-3xl md:text-4xl text-center tracking-[8px] md:tracking-[10.66px] text-white">
            PORTFOLIO
          </h2>
        </div>
      </div>

      <nav
        className="max-w-2xl mx-auto px-4 mb-8 md:mb-12"
        aria-label="Portfolio filter"
      >
        <div
          ref={filterRef}
          className="relative flex items-center justify-center gap-4 md:gap-8 lg:gap-12 pb-2"
        >
          {filterCategories.map((category) => (
            <button
              key={category.id}
              data-filter={category.id}
              onClick={() => handleFilterChange(category.id)}
              className={`relative px-4 md:px-6 py-2 md:py-3 font-montserrat font-semibold text-sm md:text-base tracking-wide transition-all duration-300 ${activeFilter === category.id
                  ? "text-black dark:text-white"
                  : "text-[#999999] dark:text-[#7c7c7c] hover:text-black dark:hover:text-white"
                }`}
              aria-pressed={activeFilter === category.id}
            >
              {category.label}
            </button>
          ))}

          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-1 transition-colors duration-300 bg-black dark:bg-white rounded-full"
            style={{ width: 0, left: 0 }}
          />
        </div>
      </nav>

      <div className="w-full">
        <div
          ref={projectGridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"
        >
          {visibleProjects.map((project, index) => {
            const total = visibleProjects.length;
            const colsPerRow = 3;
            const fullRows = Math.floor(total / colsPerRow);
            const remainder = total % colsPerRow;
            const lastRowStart = fullRows * colsPerRow;

            let lastRowClasses = "";

            if (index >= lastRowStart && remainder > 0) {
              if (remainder === 1) {
                lastRowClasses = "lg:col-start-2";
              } else if (remainder === 2) {
                lastRowClasses = "lg:col-span-1.5";
              }
            }

            return (
              <div
                key={project.id}
                className={
                  "project-card group relative aspect-[4/3] overflow-hidden transition-all duration-300 " +
                  lastRowClasses
                }
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  quality={80}
                  loading="lazy"
                />

                <div className="absolute inset-0 transition-all duration-300 bg-black/30 dark:bg-black/40 group-hover:bg-black/60 dark:group-hover:bg-black/70" />

                {project.inProgress && (
                  <div className="absolute top-4 right-4 z-20 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-montserrat font-semibold tracking-wide">
                    EN DÉVELOPPEMENT
                  </div>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                  {project.tags && (
                    <p className="font-montserrat font-semibold text-blue-400 text-xs md:text-sm mb-2 tracking-wide">
                      {project.tags}
                    </p>
                  )}

                  <h3 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-3 tracking-wider">
                    {project.title}
                  </h3>

                  <p className="font-montserrat font-medium text-white/90 text-xs md:text-sm leading-relaxed mb-6 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.githubLink && (
                      <>
                        <div className="w-px h-6 bg-white/50" aria-hidden="true" />
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-montserrat font-semibold text-white text-xs tracking-widest hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white px-4 py-2"
                        >
                          GITHUB
                        </a>
                        <div className="w-px h-6 bg-white/50" aria-hidden="true" />
                      </>
                    )}

                    {project.demoLink && (
                      <>
                        <a
                          href={project.demoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-montserrat font-semibold text-white text-xs tracking-widest hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white px-4 py-2"
                        >
                          DEMO
                        </a>
                        <div className="w-px h-6 bg-white/50" aria-hidden="true" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(hasMore || isExpanded) && (
          <div className="flex justify-center mt-8 md:mt-12">
            {!isExpanded ? (
              <button
                onClick={handleLoadMore}
                className="group relative px-8 py-3 font-montserrat font-semibold text-sm md:text-base tracking-wide transition-all duration-300 bg-black dark:bg-white text-white dark:text-black hover:bg-opacity-80 dark:hover:bg-opacity-80 rounded-md overflow-hidden"
              >
                VOIR PLUS
                <span className="absolute inset-0 border-2 border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
              </button>
            ) : (
              <button
                onClick={handleShowLess}
                className="group relative px-8 py-3 font-montserrat font-semibold text-sm md:text-base tracking-wide transition-all duration-300 bg-gray-600 dark:bg-gray-400 text-white dark:text-black hover:bg-opacity-80 dark:hover:bg-opacity-80 rounded-md overflow-hidden"
              >
                VOIR MOINS
                <span className="absolute inset-0 border-2 border-gray-600 dark:border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
              </button>
            )}
          </div>
        )}

        <p className="text-center font-montserrat font-semibold text-lg md:text-xl lg:text-2xl mt-12 md:mt-16 px-4 transition-colors duration-300 text-black dark:text-white">
          Et bien d'autres à venir !
        </p>
      </div>
    </section>
  );
};
