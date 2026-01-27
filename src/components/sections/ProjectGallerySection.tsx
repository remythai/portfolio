'use client'
import { JSX, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLanguage } from '@/contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: number;
  title: string;
  descriptionKey: string;
  category: Array<'school' | 'other'>;
  tags: string;
  githubLink: string | null;
  demoLink: string | null;
  image: string;
  inProgress: boolean;
}

export const ProjectGallerySection = (): JSX.Element => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [mounted, setMounted] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentRotation, setCurrentRotation] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  
  const { t } = useLanguage();

  const filterCategories = [
    { id: "all", label: t.portfolio.all },
    { id: "school", label: t.portfolio.school },
    { id: "other", label: t.portfolio.others },
  ];

  const projectData: Project[] = [
    {
      id: 1,
      title: "AREA",
      descriptionKey: "area",
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
      descriptionKey: "rtype",
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
      descriptionKey: "neuralnetwork",
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
      descriptionKey: "arcade",
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
      descriptionKey: "nanotekspice",
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
      descriptionKey: "mypaint",
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
      descriptionKey: "init",
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
      descriptionKey: "mtech",
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
      descriptionKey: "paupropre",
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
      descriptionKey: "astexte",
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
      descriptionKey: "portfolio",
      category: ["other"],
      tags: "Jour - Nuit • Responsiveness • Portfolio",
      githubLink: null,
      demoLink: null,
      image: "/pau.jpg",
      inProgress: false,
    },
  ];

  const filteredProjects = projectData.filter((project) => {
    if (activeFilter === "all") return true;
    return project.category.includes(activeFilter as 'school' | 'other');
  });

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
    setSelectedProject(null);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const rotateNext = () => {
    const quantity = filteredProjects.length;
    const angleStep = 360 / quantity;
    setCurrentRotation(prev => prev + angleStep);
  };

  const rotatePrev = () => {
    const quantity = filteredProjects.length;
    const angleStep = 360 / quantity;
    setCurrentRotation(prev => prev - angleStep);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentRotation(prev => prev + 0.1);
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying]);

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
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!mounted) {
    return <></>;
  }

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="relative w-full min-h-screen pb-12 md:pb-16 lg:pb-20 overflow-hidden transition-colors duration-300 bg-[#D2D2D2] dark:bg-[#1a1a1a]"
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
            {t.portfolio.title}
          </h2>
        </div>
      </div>

      <nav
        className="max-w-2xl mx-auto px-4 mb-8 md:mb-12 relative z-10"
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
              className={`relative px-4 md:px-6 py-2 md:py-3 font-montserrat font-semibold text-sm md:text-base tracking-wide transition-all duration-300 ${
                activeFilter === category.id
                  ? "text-[#25283B] dark:text-white"
                  : "text-[#999999] dark:text-[#7c7c7c] hover:text-[#25283B] dark:hover:text-white"
              }`}
              aria-pressed={activeFilter === category.id}
            >
              {category.label}
            </button>
          ))}
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-1 transition-colors duration-300 bg-[#25283B] dark:bg-white rounded-full"
            style={{ width: 0, left: 0 }}
          />
        </div>
      </nav>

      <div className="relative w-full min-h-[550px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px] text-center overflow-visible">
        <div
          ref={carouselRef}
          className="absolute w-[150px] h-[190px] sm:w-[180px] sm:h-[225px] md:w-[200px] md:h-[250px] top-[20%] sm:top-[15%] md:top-[10%] lg:top-[5%] left-1/2 -translate-x-1/2 z-20 transition-transform duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `perspective(1000px) rotateX(-16deg) rotateY(${currentRotation}deg)`,
          }}
        >
          {filteredProjects.map((project, index) => {
            const quantity = filteredProjects.length;
            const position = index + 1;
            
            return (
              <div
                key={project.id}
                className="absolute inset-0 cursor-pointer group"
                style={{
                  transform: `
                    rotateY(calc(${(position - 1) * (360 / quantity)}deg))
                    translateZ(450px)
                  `,
                }}
                onClick={() => handleProjectClick(project)}
              >
                <div className="relative w-full h-full overflow-hidden rounded-lg shadow-2xl">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    quality={80}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300" />
                  {project.inProgress && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-montserrat font-semibold">
                      {t.portfolio.inProgress}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="font-montserrat font-bold text-white text-xs sm:text-sm md:text-base">
                      {project.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 z-30">
          <button
            onClick={rotatePrev}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#303030] shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#404040] transition-all"
            aria-label="Projet précédent"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={togglePlayPause}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-[#303030] shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#404040] transition-all"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={rotateNext}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#303030] shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#404040] transition-all"
            aria-label="Projet suivant"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {selectedProject && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white dark:bg-[#303030] rounded-lg max-w-2xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-2xl font-bold text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400"
            >
              ×
            </button>
            
            <div className="relative w-full h-48 sm:h-64 md:h-80 mb-6 rounded-lg overflow-hidden">
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                fill
                className="object-cover"
                quality={90}
              />
            </div>

            {selectedProject.inProgress && (
              <div className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-montserrat font-semibold mb-4">
                {t.portfolio.inProgress}
              </div>
            )}

            <p className="font-montserrat font-semibold text-blue-500 text-sm mb-2">
              {selectedProject.tags}
            </p>

            <h3 className="font-montserrat font-bold text-xl sm:text-2xl md:text-3xl mb-4 text-black dark:text-white">
              {selectedProject.title}
            </h3>

            <p className="font-montserrat text-sm sm:text-base leading-relaxed mb-6 text-black/80 dark:text-white/80">
              {t.portfolio.projects[selectedProject.descriptionKey as keyof typeof t.portfolio.projects]}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {selectedProject.githubLink && (
                <a
                  href={selectedProject.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-montserrat font-semibold px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-opacity-80 transition-all text-center"
                >
                  {t.portfolio.github}
                </a>
              )}
              {selectedProject.demoLink && (
                <a
                  href={selectedProject.demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-montserrat font-semibold px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all text-center"
                >
                  {t.portfolio.demo}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};