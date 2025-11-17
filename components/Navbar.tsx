'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-[#708E62] border-b border-green-700 sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('hero')}
              className="flex-shrink-0 flex items-center cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                {/* <Image src={'/hero.png'} height={10} width={19} alt={"logo"} className='size-16'/> */}
                <span className="text-3xl font-bold text-white">Greenify</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <button
              onClick={() => handleNavClick('dealers')}
              className="text-white hover:text-green-100 px-5 py-3 rounded-lg text-lg font-semibold transition-colors duration-200"
            >
              Find Dealers
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="text-white hover:text-green-100 px-5 py-3 rounded-lg text-lg font-semibold transition-colors duration-200"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-white hover:text-green-100 px-5 py-3 rounded-lg text-lg font-semibold transition-colors duration-200"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-white hover:text-green-100 px-5 py-3 rounded-lg text-lg font-semibold transition-colors duration-200"
            >
              Contact
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/login"
              className="text-white hover:text-green-100 px-5 py-3 rounded-lg text-lg font-semibold transition-colors duration-200"
            >
              Login
            </Link>
            <button
              onClick={() => handleNavClick('get-started')}
              className="bg-green-50 hover:bg-green-50 text-[#708E62] px-8 py-4 rounded-lg text-lg font-bold transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-4 rounded-lg text-white hover:text-green-100 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-8 w-8`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-8 w-8`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#708E62] border-t border-green-700`}>
        <div className="px-4 pt-4 pb-6 space-y-3 sm:px-6">
          <button
            onClick={() => handleNavClick('dealers')}
            className="text-white hover:text-green-100 block px-5 py-4 rounded-lg text-xl font-semibold transition-colors duration-200 w-full text-left"
          >
            Find Dealers
          </button>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="text-white hover:text-green-100 block px-5 py-4 rounded-lg text-xl font-semibold transition-colors duration-200 w-full text-left"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="text-white hover:text-green-100 block px-5 py-4 rounded-lg text-xl font-semibold transition-colors duration-200 w-full text-left"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="text-white hover:text-green-100 block px-5 py-4 rounded-lg text-xl font-semibold transition-colors duration-200 w-full text-left"
          >
            Contact
          </button>
          <div className="border-t border-green-700 pt-6">
            <Link
              href="/login"
              className="text-white hover:text-green-100 block px-5 py-4 rounded-lg text-xl font-semibold transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <button
              onClick={() => handleNavClick('get-started')}
              className="bg-green-50 hover:bg-green-50 text-[#708E62] block px-5 py-4 rounded-lg text-xl font-bold transition-colors duration-200 w-full text-center shadow-md hover:shadow-lg mt-4"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}