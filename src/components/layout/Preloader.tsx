'use client'

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useTheme } from 'next-themes';

export const Preloader = () => {
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cubesContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.body.style.overflow = 'hidden';

    const cols = 10;
    const rows = 8;
    const totalCubes = cols * rows;

    if (cubesContainerRef.current) {
      cubesContainerRef.current.innerHTML = '';
      
      for (let i = 0; i < totalCubes; i++) {
        const cube = document.createElement('div');
        cube.className = 'cube';
        cube.style.cssText = `
          position: absolute;
          width: ${100 / cols}%;
          height: ${100 / rows}%;
          left: ${(i % cols) * (100 / cols)}%;
          top: ${Math.floor(i / cols) * (100 / rows)}%;
          background: ${isDark ? '#303030' : '#f5f5f5'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
          box-sizing: border-box;
          opacity: 0;
        `;
        cubesContainerRef.current.appendChild(cube);
      }
    }

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        setTimeout(() => setIsComplete(true), 100);
      }
    });

    const cubes = document.querySelectorAll('.cube');

    tl.fromTo(
      textRef.current,
      { 
        opacity: 0, 
        scale: 0.8,
        y: 30
      },
      { 
        opacity: 1, 
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out'
      }
    )
    .to(textRef.current, {
      opacity: 1,
      duration: 0.6
    })
    .to(cubes, {
      opacity: 1,
      duration: 0.01,
      stagger: {
        each: 0.025,
        from: 'random',
        ease: 'none'
      }
    }, '-=0.3')
    .to(textRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      ease: 'power2.inOut'
    }, '<')
    .to({}, { duration: 0.3 })
    .to(backgroundRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut'
    })
    .to(cubes, {
      opacity: 0,
      duration: 0.01,
      stagger: {
        each: 0.02,
        from: 'random',
        ease: 'none'
      }
    }, '-=0.2')
    .to(preloaderRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.inOut',
      onStart: () => {
        if (preloaderRef.current) {
          preloaderRef.current.style.pointerEvents = 'none';
        }
      }
    });

    return () => {
      document.body.style.overflow = '';
    };
  }, [isDark, mounted]);

  if (!mounted || isComplete) return null;

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-[9998]"
        style={{ backgroundColor: '#303030' }}
      />
      <div
        ref={textRef}
        className="absolute inset-0 flex items-center justify-center z-[10001]"
        style={{ opacity: 0 }}
      >
        <h1 className="font-raleway font-bold text-5xl md:text-7xl lg:text-8xl text-white tracking-wider">
          Bienvenue
        </h1>
      </div>
      <div
        ref={cubesContainerRef}
        className="absolute inset-0 pointer-events-none z-[10000]"
      />
    </div>
  );
};
