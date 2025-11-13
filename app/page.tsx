"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

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

    // --- 3D Section Animations ---
    const sections = gsap.utils.toArray<HTMLElement>(".section");

    sections.forEach((section, i) => {
      const text = section.querySelector(".text");

      gsap.fromTo(
        section,
        {
          opacity: 0,
          rotateY: i % 2 === 0 ? -45 : 45,
          scale: 0.85,
        },
        {
          opacity: 1,
          rotateY: 0,
          scale: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 60%",
            scrub: true,
          },
        }
      );

      if (text) {
        gsap.fromTo(
          text,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 60%",
              scrub: true,
            },
          }
        );
      }
    });

    // --- Smooth Image Transition Effect ---
    const transition = gsap.timeline({
      scrollTrigger: {
        trigger: ".image-transition",
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: true,
      },
    });

    transition
      .fromTo(
        ".image-next",
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", ease: "none" }
      )
      .fromTo(".image-next", { opacity: 0 }, { opacity: 1, ease: "none" }, "<");

    // --- Fixed Final Text Zoom + Fade Effect ---
    const textZoom = gsap.timeline({
      scrollTrigger: {
        trigger: ".text-zoom-section",
        start: "top bottom", // Start when section enters viewport
        end: "bottom top", // End when section leaves viewport
        scrub: 1, // Smooth scrubbing
        pin: true,
        anticipatePin: 1,
      },
    });

    // First text: starts normal, zooms in massively, then fades out
    textZoom
      .fromTo(".zoom-text-1", 
        { scale: 1, opacity: 1 },
        { 
          scale: 15, // Massive zoom effect
          opacity: 0,
          ease: "power2.inOut",
          duration: 1
        }
      )
      // Second text: appears as first one fades out
      .fromTo(".zoom-text-2",
        { scale: 0.5, opacity: 0 },
        {
          scale: 1.2, // Slight zoom in
          opacity: 1,
          ease: "power2.out",
          duration: 0.8
        },
        "-=0.3" // Start 0.3 seconds before first animation ends
      )
      // Final scale adjustment for second text
      .to(".zoom-text-2", {
        scale: 1,
        ease: "power2.inOut",
        duration: 0.5
      });

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
      {/* Hero Section */}
      <section className="section relative h-screen flex flex-col justify-center items-center">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="hero"
        />
        <h1 className="text text-6xl font-bold relative z-10">
          Welcome to the Future
        </h1>
        <p className="text-lg mt-4 relative z-10">Scroll to explore</p>
      </section>

      {/* Smooth Image Transition Section */}
      <section className="image-transition relative h-screen w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1400&q=80"
          className="image-base absolute inset-0 w-full h-full object-cover"
          alt="base"
        />
        <img
          src="https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1400&q=80"
          className="image-next absolute inset-0 w-full h-full object-cover"
          alt="next"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center z-10">
          <h2 className="text-5xl font-semibold">Scene Transition</h2>
          <p className="text-lg mt-4 opacity-80">
            Scroll to morph one world into another
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="section relative h-screen flex justify-center items-center">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="section2"
        />
        <h2 className="text text-5xl font-semibold relative z-10">
          Seamless Experience
        </h2>
      </section>

      {/* Section 3 */}
      <section className="section relative h-screen flex justify-center items-center">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="section3"
        />
        <h2 className="text text-5xl font-semibold relative z-10">
          Smooth 3D Transitions
        </h2>
      </section>

      {/* Final Text Zoom + Fade Section */}
      <section className="text-zoom-section relative h-screen bg-black flex justify-center items-center overflow-hidden">
        <div className="absolute inset-0 flex justify-center items-center">
          <h2 className="zoom-text-1 text-6xl md:text-8xl font-bold text-white text-center px-4">
            The Journey Ends Here
          </h2>
        </div>
        <div className="absolute inset-0 flex justify-center items-center">
          <h2 className="zoom-text-2 text-6xl md:text-8xl font-bold text-white text-center px-4 opacity-0">
            A New Beginning Awaits 🚀
          </h2>
        </div>
      </section>
    </div>
  );
}