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
  const secondSectionRef = useRef<HTMLDivElement>(null);
  const thirdSectionRef = useRef<HTMLDivElement>(null);
  const masterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // --- ULTRA SMOOTH LENIS ---
    const lenis = new Lenis({
      duration: 1.6,
      smoothWheel: true,
      smoothTouch: true,
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // buttery cubic smoothing
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Get elements
    const zoomText = zoomTextRef.current;
    const nextSection = nextSectionRef.current;
    const secondSection = secondSectionRef.current;
    const thirdSection = thirdSectionRef.current;
    const masterContainer = masterContainerRef.current;

    if (zoomText && nextSection && secondSection && thirdSection && masterContainer) {
      // Get all text elements
      const nextSectionText = nextSection.querySelector("h2");
      const secondSectionText = secondSection.querySelector("h2");
      const thirdSectionText = thirdSection.querySelector("h2");

      // Initial section states (soft)
      gsap.set([nextSection, secondSection, thirdSection], {
        opacity: 0,
        scale: 0.92,
      });

      // Initial text scales
      gsap.set([zoomText, nextSectionText, secondSectionText, thirdSectionText], {
        scale: 1,
      });

      // MASTER TIMELINE (extra smooth with better pacing)
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: masterContainer,
          start: "top top",
          end: "+=900%",      // more scroll distance for better control
          scrub: 2.4,          // ultra smooth motion
          pin: true,
        },
        defaults: { ease: "power1.inOut" },
      });

      // --- FIRST → NEXT ---
      // Hold first section fully visible
      masterTl.to(zoomText, {
        scale: 1,
        duration: 6,
      });

      // Scale up first text while fading out
      masterTl.to(zoomText, {
        scale: 1.1,
        duration: 6,
      });

      masterTl.to(zoomText.parentElement, {
        opacity: 0,
        scale: 1.1,
        duration: 5,
      }, "<");

      // Scale in next section text
      masterTl.fromTo(
        nextSectionText,
        { scale: 10 },
        {
          scale: 1,
          duration: 5,
        },
        "<50%"
      );

      masterTl.to(
        nextSection,
        {
          opacity: 1,
          scale: 1,
          duration: 5,
        },
        "<"
      );

      // Hold next section fully visible
      masterTl.to(nextSectionText, {
        scale: 1,
        duration: 6,
      });

      // --- NEXT → SECOND ---
      // Scale up next section text while fading out
      masterTl.to(nextSectionText, {
        scale: 10,
        duration: 5,
      });

      masterTl.to(nextSection, {
        opacity: 0,
        scale: 1.05,
        duration: 5,
      }, "<");

      // Scale in second section text
      masterTl.fromTo(
        secondSectionText,
        { scale: 0.1 },
        {
          scale: 1,
          duration: 5,
        },
        "<50%"
      );

      masterTl.to(
        secondSection,
        {
          opacity: 1,
          scale: 1,
          duration: 5,
        },
        "<"
      );

      // Hold second section fully visible
      masterTl.to(secondSectionText, {
        scale: 1,
        duration: 6,
      });

      // --- SECOND → THIRD ---
      // Scale up second section text while fading out
      masterTl.to(secondSectionText, {
        scale: 10,
        duration: 5,
      });

      masterTl.to(secondSection, {
        opacity: 0,
        scale: 1.05,
        duration: 5,
      }, "<");

      // Scale in third section text
      masterTl.fromTo(
        thirdSectionText,
        { scale: 0.1 },
        {
          scale: 1,
          duration: 5,
        },
        "<50%"
      );

      masterTl.to(
        thirdSection,
        {
          opacity: 1,
          scale: 1,
          duration: 5,
        },
        "<"
      );

      // Hold third section fully visible
      masterTl.to(thirdSectionText, {
        scale: 1,
        duration: 6,
      });
    }

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
      <div className="h-[100vh] bg-black" />

      {/* MASTER CONTAINER */}
      <div ref={masterContainerRef} className="relative">

        {/* FIRST SECTION */}
        <section className="absolute top-0 left-0 w-full h-screen bg-blue-500 flex flex-col justify-between items-center py-8">
          <p className="text-xl md:text-2xl text-white text-center px-4 mt-8">
            Every story has its conclusion
          </p>

          <h2
            ref={zoomTextRef}
            className="text-6xl md:text-8xl font-bold text-white text-center px-4"
          >
            THE JOURNEY ENDS HERE
          </h2>

          <p className="text-xl md:text-2xl text-white text-center px-4 mb-8">
            But memories last forever
          </p>
        </section>

        {/* NEXT SECTION */}
        <section
          ref={nextSectionRef}
          className="absolute top-0 left-0 w-full h-screen bg-purple-600 flex justify-center items-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white text-center">
            A NEW CHAPTER BEGINS
          </h2>
        </section>

        {/* SECOND SECTION */}
        <section
          ref={secondSectionRef}
          className="absolute top-0 left-0 w-full h-screen bg-orange-500 flex justify-center items-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white text-center">
            SECOND CHAPTER
          </h2>
        </section>

        {/* THIRD SECTION */}
        <section
          ref={thirdSectionRef}
          className="absolute top-0 left-0 w-full h-screen bg-green-500 flex justify-center items-center"
        >
        </section>
      </div>

      {/* Outro spacing */}
      <div className="h-[100vh] bg-black" />
    </div>
  );
}