'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface CharacterAnimationProps {
  word?: string;
  topColor?: string;
  bottomCharColor?: string;
  bottomBgColor?: string;
  finalColor?: string;
  backgroundColor?: string;
  duration?: number;
}

const CharacterAnimation: React.FC<CharacterAnimationProps> = ({
  word = "ANIMATE",
  topColor = "#ff6b6b",
  bottomCharColor = "#ffffff",
  bottomBgColor = "#4ecdc4", 
  finalColor = "#ffffff",
  backgroundColor = "#2d3436",
  duration = 1.5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<(HTMLDivElement | null)[]>([]);
  const bottomBgRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  // Get first 6 characters of the word
  const displayChars = word.slice(0, 6).split('');
  
  // Create alternating pattern: characters at even indices go to top, odd to bottom
  const topChars = displayChars.filter((_, index) => index % 2 === 0);
  const bottomChars = displayChars.filter((_, index) => index % 2 === 1);

  useEffect(() => {
    if (!containerRef.current || isAnimating.current) return;
    isAnimating.current = true;

    const chars = charsRef.current.filter(Boolean) as HTMLDivElement[];
    const topCharElements = chars.filter((_, index) => index % 2 === 0);
    const bottomCharElements = chars.filter((_, index) => index % 2 === 1);
    const bottomBg = bottomBgRef.current;

    // Set initial positions - ALL characters visible from start
    gsap.set(chars, { 
      opacity: 1
    });
    
    // Set initial positions - top characters at Y: 0 (centered)
    gsap.set(topCharElements, { 
      color: topColor,
      y: 0
    });
    
    // Bottom characters start at the very bottom of the screen
    gsap.set(bottomCharElements, { 
      y: window.innerHeight,
      color: bottomCharColor
    });

    // Bottom background starts well below the screen
    if (bottomBg) {
      gsap.set(bottomBg, {
        y: window.innerHeight + 350, // Start completely off-screen at the bottom
        backgroundColor: bottomBgColor,
        width: '100vw',
        height: '100vh',
        opacity: 1,
        position: 'absolute',
        top: 0,
        left: 0
      });
    }

    // Create timeline
    const tl = gsap.timeline();

    // Animate bottom characters up first (faster)
    tl.to(bottomCharElements, {
      y: 0,
      duration: duration * 0.7, // 70% of total duration - faster
      // ease: "back.out(1)"
    }, 0);

    // Background animates up slower than the characters
    tl.to(bottomBg, {
      y: 0, // Background moves to cover the screen
      duration: duration, // Full duration - slower
      ease: "power2.out"
    }, 0);

    // Start color change when background is about 70% of the way up
    // This makes the color change complete around the same time the background reaches top
    tl.to([...topCharElements, ...bottomCharElements], {
      color: backgroundColor, // Change text color to the original background color
      duration: duration * 0.6, // Shorter duration for color change
      ease: "power2.inOut"
    }, duration * 0.4); // Start color change when background is 40% through its animation

    return () => {
      tl.kill();
    };
  }, [word, topColor, bottomCharColor, bottomBgColor, finalColor, backgroundColor, duration]);

  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    charsRef.current[index] = el;
  };

  // Create the character layout with proper alternating order
  const renderCharacters = () => {
    const elements: JSX.Element[] = [];
    
    displayChars.forEach((char, index) => {
      const isTop = index % 2 === 0;
      
      elements.push(
        <div
          key={index}
          ref={(el) => addToRefs(el, index)}
          style={{
            color: isTop ? topColor : bottomCharColor,
            willChange: 'transform',
            zIndex: isTop ? 20 : 30 // Bottom characters have HIGHER z-index to be on top of bg
          }}
        >
          {char}
        </div>
      );
    });
    
    return elements;
  };

  return (
    <div 
      ref={containerRef}
      style={{
        backgroundColor: backgroundColor,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        overflow: 'hidden',
        position: 'relative',
        transition: 'background-color 0.5s ease'
      }}
    >
      {/* Full width bottom background that moves below the bottom characters */}
      <div 
        ref={bottomBgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 0,
          zIndex: 10 // Lower z-index than bottom characters (which have z-index 30)
        }}
      />
      
      <div style={{
        display: 'flex',
        gap: '20px',
        fontSize: '4rem',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        zIndex: 20 // Base z-index for character container
      }}>
        {renderCharacters()}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <main>
      <CharacterAnimation 
        word="GSAPJS"
        topColor="#ff6b6b"
        bottomCharColor="#ffffff"
        bottomBgColor="#4ecdc4"
        finalColor="#ffffff"
        backgroundColor="#2d3436"
        duration={1.5}
      />
    </main>
  );
}