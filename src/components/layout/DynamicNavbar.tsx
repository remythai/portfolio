'use client'

import { JSX, useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from 'next-themes';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export const DynamicNavbar = (): JSX.Element => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();

    const navContainerRef = useRef<HTMLDivElement>(null);
    const expandedNavRef = useRef<HTMLDivElement>(null);
    const leftPupilRef = useRef<HTMLDivElement>(null);
    const rightPupilRef = useRef<HTMLDivElement>(null);
    const leftEyeContainerRef = useRef<HTMLDivElement>(null);
    const rightEyeContainerRef = useRef<HTMLDivElement>(null);

    const navigationLinks = [
        { label: "Parcours", href: "#education" },
        { label: "A propos", href: "#about" },
        { label: "Compétences", href: "#skills" },
        { label: "Portfolio", href: "#portfolio" },
        { label: "Contact", href: "#contact" },
    ];

    const isDark = theme === 'dark';

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let rafId: number;

        const handleMouseMove = (e: MouseEvent) => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                setMousePos({ x: e.clientX, y: e.clientY });
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafId);
        };
    }, []);

    useEffect(() => {
        const blink = () => {
            const delay = 3000 + Math.random() * 2000;

            setTimeout(() => {
                gsap.to([leftPupilRef.current, rightPupilRef.current].map(ref => ref?.parentElement), {
                    scaleY: 0.1,
                    duration: 0.08,
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut",
                    onComplete: blink
                });
            }, delay);
        };

        blink();
    }, []);

    useEffect(() => {
        if (!leftPupilRef.current || !rightPupilRef.current ||
            !leftEyeContainerRef.current || !rightEyeContainerRef.current) return;

        const leftEyeRect = leftEyeContainerRef.current.getBoundingClientRect();
        const leftEyeCenterX = leftEyeRect.left + leftEyeRect.width / 2;
        const leftEyeCenterY = leftEyeRect.top + leftEyeRect.height / 2;

        const leftAngle = Math.atan2(mousePos.y - leftEyeCenterY, mousePos.x - leftEyeCenterX);
        const leftDistance = Math.min(3, Math.hypot(mousePos.x - leftEyeCenterX, mousePos.y - leftEyeCenterY) / 80);

        const leftX = Math.cos(leftAngle) * leftDistance;
        const leftY = Math.sin(leftAngle) * leftDistance;

        const rightEyeRect = rightEyeContainerRef.current.getBoundingClientRect();
        const rightEyeCenterX = rightEyeRect.left + rightEyeRect.width / 2;
        const rightEyeCenterY = rightEyeRect.top + rightEyeRect.height / 2;

        const rightAngle = Math.atan2(mousePos.y - rightEyeCenterY, mousePos.x - rightEyeCenterX);
        const rightDistance = Math.min(3, Math.hypot(mousePos.x - rightEyeCenterX, mousePos.y - rightEyeCenterY) / 80);

        const rightX = Math.cos(rightAngle) * rightDistance;
        const rightY = Math.sin(rightAngle) * rightDistance;

        gsap.to(leftPupilRef.current, {
            x: leftX,
            y: leftY,
            duration: 0.12,
            ease: "none",
            overwrite: "auto"
        });

        gsap.to(rightPupilRef.current, {
            x: rightX,
            y: rightY,
            duration: 0.12,
            ease: "none",
            overwrite: "auto"
        });
    }, [mousePos]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: "body",
                start: "200px top",
                onEnter: () => {
                    setIsCollapsed(true);

                    gsap.to(expandedNavRef.current, {
                        maxWidth: 0,
                        opacity: 0,
                        paddingLeft: 0,
                        paddingRight: 0,
                        duration: 0.4,
                        ease: "power2.in",
                    });
                },
                onLeaveBack: () => {
                    setIsCollapsed(false);

                    gsap.to(expandedNavRef.current, {
                        maxWidth: 400,
                        opacity: 1,
                        paddingLeft: 20,
                        paddingRight: 20,
                        duration: 0.4,
                        ease: "power2.out",
                    });
                }
            });
        });

        return () => ctx.revert();
    }, []);

    const handleMouseEnter = () => {
        if (!isCollapsed || window.innerWidth < 768) return;
        setIsHovered(true);

        gsap.to(expandedNavRef.current, {
            maxWidth: 400,
            opacity: 1,
            paddingLeft: 20,
            paddingRight: 20,
            duration: 0.5,
            ease: "power3.out",
        });
    };

    const handleMouseLeave = () => {
        if (!isCollapsed || window.innerWidth < 768) return;
        setIsHovered(false);

        gsap.to(expandedNavRef.current, {
            maxWidth: 0,
            opacity: 0,
            paddingLeft: 0,
            paddingRight: 0,
            duration: 0.4,
            ease: "power2.in",
        });
    };

    const scrollToSection = (href: string) => {
        const target = document.querySelector(href);
        if (!target) {
            console.warn(`Target not found: ${href}`);
            return;
        }

        const targetPosition = target.getBoundingClientRect().top + window.scrollY;

        gsap.to(window, {
            scrollTo: {
                y: targetPosition,
                autoKill: true
            },
            duration: 1.2,
            ease: "power3.inOut"
        });
    };

    const handleEyeClick = (side: 'left' | 'right') => {
        const eyeRef = side === 'left' ? leftEyeContainerRef : rightEyeContainerRef;
        const pupilRef = side === 'left' ? leftPupilRef : rightPupilRef;

        if (!eyeRef.current || !pupilRef.current) return;

        const tl = gsap.timeline();

        tl.to(eyeRef.current, {
            scaleY: 0.1,
            duration: 0.1,
            ease: "power2.in"
        })
            .to(eyeRef.current, {
                scaleY: 1,
                duration: 0.3,
                ease: "elastic.out(1, 0.5)",
                delay: 0.1
            });

        gsap.to(pupilRef.current, {
            opacity: 0,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });

        if (window.innerWidth < 768) {
            const newState = !isMobileExpanded;
            setIsMobileExpanded(newState);

            gsap.to(expandedNavRef.current, {
                maxWidth: newState ? 400 : 0,
                opacity: newState ? 1 : 0,
                paddingLeft: newState ? 20 : 0,
                paddingRight: newState ? 20 : 0,
                duration: 0.5,
                ease: newState ? "power3.out" : "power2.in",
            });
        }
    };

    if (!mounted) {
        return (
            <nav className="fixed top-6 right-6 z-50 flex items-center gap-3 pr-4 md:pr-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full" />
                <div className="flex items-center bg-white/95 backdrop-blur-md px-3 py-2 rounded-full border border-black/10 shadow-lg">
                    <div className="w-7 h-7 bg-gray-300 rounded-full animate-pulse" />
                    <div className="w-40 h-4 bg-gray-300 rounded mx-4 animate-pulse" />
                    <div className="w-7 h-7 bg-gray-300 rounded-full animate-pulse" />
                </div>
            </nav>
        );
    }

    return (
        <nav className="fixed top-4 right-4 md:top-6 md:right-6 z-50 flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-3">
            <div
                ref={navContainerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex items-center backdrop-blur-md px-3 py-2 rounded-full shadow-lg transition-all duration-300"
                style={{
                    backgroundColor: isDark ? 'rgba(48, 48, 48, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                }}
            >
                <div
                    ref={leftEyeContainerRef}
                    onClick={() => handleEyeClick('left')}
                    className="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                >
                    <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300"
                        style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}
                    >
                        <div
                            ref={leftPupilRef}
                            className="w-2 h-4 rounded-full transition-all duration-300"
                            style={{ backgroundColor: isDark ? '#000000' : '#ffffff' }}
                        />
                    </div>
                </div>
                <div
                    ref={expandedNavRef}
                    className="overflow-hidden"
                    style={{ maxWidth: isCollapsed ? 0 : 400, opacity: isCollapsed ? 0 : 1, paddingLeft: isCollapsed ? 0 : 20, paddingRight: isCollapsed ? 0 : 20 }}
                >
                    <div className="flex flex-col gap-2 md:hidden">
                        <div className="flex justify-center gap-3">
                            {navigationLinks.slice(0, 3).map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection(link.href);
                                    }}
                                    className="relative font-montserrat font-medium text-xs hover:opacity-70 transition-all cursor-pointer whitespace-nowrap group text-center"
                                    style={{ color: isDark ? '#ffffff' : '#000000' }}
                                >
                                    {link.label}
                                    <span 
                                        className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full" 
                                        style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}
                                    />
                                </a>
                            ))}
                        </div>
                        <div className="flex justify-center gap-3">
                            {navigationLinks.slice(3, 5).map((link, index) => (
                                <a
                                    key={index + 3}
                                    href={link.href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection(link.href);
                                    }}
                                    className="relative font-montserrat font-medium text-xs hover:opacity-70 transition-all cursor-pointer whitespace-nowrap group text-center"
                                    style={{ color: isDark ? '#ffffff' : '#000000' }}
                                >
                                    {link.label}
                                    <span 
                                        className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full" 
                                        style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        {navigationLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToSection(link.href);
                                }}
                                className="relative font-montserrat font-medium text-xs hover:opacity-70 transition-all cursor-pointer whitespace-nowrap group"
                                style={{ color: isDark ? '#ffffff' : '#000000' }}
                            >
                                {link.label}
                                <span 
                                    className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full" 
                                    style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}
                                />
                            </a>
                        ))}
                    </div>
                </div>
                <div
                    ref={rightEyeContainerRef}
                    onClick={() => handleEyeClick('right')}
                    className="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                >
                    <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300"
                        style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}
                    >
                        <div
                            ref={rightPupilRef}
                            className="w-2 h-4 rounded-full transition-all duration-300"
                            style={{ backgroundColor: isDark ? '#000000' : '#ffffff' }}
                        />
                    </div>
                </div>
            </div>
            <ThemeToggle />
        </nav>
    );
};
