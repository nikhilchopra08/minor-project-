"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomTextRef = useRef<HTMLHeadingElement>(null);
  const nextSectionRef = useRef<HTMLDivElement>(null);
  const topSentenceRef = useRef<HTMLParagraphElement>(null);
  const boomSectionRef = useRef<HTMLDivElement>(null);
  const boomTextRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // --- Initialize Lenis ---
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // --- Timeline for first zoom transition ---
    const zoomText = zoomTextRef.current;
    const nextSection = nextSectionRef.current;
    const topSentence = topSentenceRef.current;

    if (zoomText && nextSection && topSentence) {
      const firstTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".zoom-section",
          start: "top top",
          end: "+=300%",
          scrub: true,
          pin: true,
        },
      });

      // Initial state - wait for top sentence to reach top
      firstTl.to({}, { duration: 0.2 });

      // Text zoom out and fade
      firstTl.to(zoomText, {
        scale: 10,
        opacity: 0,
        ease: "power2.inOut",
        duration: 0.8,
      });

      // Next section emerges from center simultaneously
      firstTl.fromTo(
        nextSection,
        { 
          opacity: 0, 
          scale: 0.3,
        },
        { 
          opacity: 1, 
          scale: 1, 
          ease: "power2.out",
          duration: 0.8,
        },
        "<"
      );
    }

    // --- Timeline for second zoom transition ---
    const boomSection = boomSectionRef.current;
    const boomText = boomTextRef.current;

    if (nextSection && boomSection && boomText) {
      const secondTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".next-section-container",
          start: "top top",
          end: "+=300%",
          scrub: true,
          pin: true,
        },
      });

      // Initial state
      secondTl.to({}, { duration: 0.2 });

      // "A NEW CHAPTER BEGINS" zooms out and fades
      secondTl.to(nextSection, {
        scale: 10,
        opacity: 0,
        ease: "power2.inOut",
        duration: 0.8,
      });

      // Boom section emerges from center simultaneously
      secondTl.fromTo(
        boomSection,
        { 
          opacity: 0, 
          scale: 0.3,
        },
        { 
          opacity: 1, 
          scale: 1, 
          ease: "power2.out",
          duration: 0.8,
        },
        "<"
      );
    }

    // Cleanup
    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white overflow-hidden"
    >
      {/* Intro spacing */}
      <div className="h-[100vh] bg-black"></div>

      {/* First Zoom Section */}
      <section className="zoom-section relative h-screen bg-blue-500 flex flex-col justify-between items-center py-8">
        {/* Top sentence - triggers the animation */}
        <p 
          ref={topSentenceRef}
          className="text-xl md:text-2xl text-white text-center px-4 mt-8"
        >
          Every story has its conclusion
        </p>

        {/* Main zoom text */}
        <h2
          ref={zoomTextRef}
          className="text-6xl md:text-8xl font-bold text-white text-center px-4"
        >
          THE JOURNEY ENDS HERE
        </h2>

        {/* Bottom sentence */}
        <p className="text-xl md:text-2xl text-white text-center px-4 mb-8">
          But memories last forever
        </p>
      </section>

      {/* Next Section Container */}
      <div className="next-section-container relative">
        {/* Next Section (Emerges from center) */}
        <section
          ref={nextSectionRef}
          className="next-section relative h-screen bg-purple-600 flex justify-center items-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white text-center">
            A NEW CHAPTER BEGINS
          </h2>
        </section>

        {/* Boom Section (Emerges from center) */}
        <section
          ref={boomSectionRef}
          className="boom-section fixed inset-0 flex justify-center items-center pointer-events-none opacity-0"
          style={{ transform: "scale(0.3)" }}
        >
          <h2 
            ref={boomTextRef}
            className="text-4xl md:text-6xl font-bold text-green-400 text-center"
          >
            boom new chapter again
          </h2>
        </section>
      </div>

      {/* Additional space */}
      <div className="h-[200vh] bg-black"></div>
    </div>
  );
}

