import React from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import HowItWorks from '@/components/landing/HowItWorks'
import Contact from '@/components/landing/Contact'
import HeroSection from '@/components/landing/Spline'
import FAQSection from '@/components/landing/FAQ'
import Footer from '@/components/landing/Footer'
import DealerRegistration from '@/components/landing/DealerRegistration'

const page = () => {
  return (
    <div className='w-screen'>
      <Navbar/>
      
      {/* Hero Section */}
      <section id="hero" className="min-h-screen">
        <Image 
          className='h-full w-full object-cover' 
          src={'/hero.png'} 
          height={500}  
          width={500} 
          alt='hero'
        />
        <div className="inset-0 h-[100vh] w-[100vw] flex items-center justify-center">
          <HeroSection/>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="">
        <HowItWorks/>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="min-h-screen bg-green-50">
        <DealerRegistration/>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="min-h-screen py-20 bg-gray-50">
        <FAQSection/>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen py-20">
        <Contact/>
      </section>

      <Footer/>
    </div>
  )
}

export default page