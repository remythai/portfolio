'use client'

import { JSX, useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export const DynamicNavbar = (): JSX.Element => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

    // Eyes follow cursor
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
        if (!isCollapsed) return;
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
        if (!isCollapsed) return;
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

    const handleEyeClick = (eyeRef: React.RefObject<HTMLDivElement>) => {
        if (!eyeRef.current) return;

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

        const pupilRef = eyeRef === leftEyeContainerRef ? leftPupilRef : rightPupilRef;

        gsap.to(pupilRef.current, {
            opacity: 0,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
    };

    return (
        <nav className="fixed top-6 right-6 z-50">
            <div
                ref={navContainerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex items-center bg-white/95 backdrop-blur-md px-3 py-2 rounded-full border border-black/10 shadow-lg"
            >
                <div
                    ref={leftEyeContainerRef}
                    onClick={() => handleEyeClick(leftEyeContainerRef)}
                    className="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                >
                    <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center relative overflow-hidden">
                        <div
                            ref={leftPupilRef}
                            className="w-2 h-4 bg-white rounded-full"
                        />
                    </div>
                </div>
                <div
                    ref={expandedNavRef}
                    className="flex items-center gap-4 overflow-hidden"
                    style={{ maxWidth: isCollapsed ? 0 : 400, opacity: isCollapsed ? 0 : 1, paddingLeft: isCollapsed ? 0 : 20, paddingRight: isCollapsed ? 0 : 20 }}
                >
                    {navigationLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection(link.href);
                            }}
                            className="relative font-montserrat font-medium text-black text-xs hover:text-gray-600 transition-colors cursor-pointer whitespace-nowrap group"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                </div>
                <div
                    ref={rightEyeContainerRef}
                    onClick={() => handleEyeClick(rightEyeContainerRef)}
                    className="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                >
                    <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center relative overflow-hidden">
                        <div
                            ref={rightPupilRef}
                            className="w-2 h-4 bg-white rounded-full"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};
