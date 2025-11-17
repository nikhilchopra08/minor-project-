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
    <div className='h-[90vh] w-screen'>
      <Navbar/>
      <Image className='h-full w-full' src={'/hero.png'} height={500}  width={500} alt='hero'/>
      <HeroSection/>
      <HowItWorks/>
      <DealerRegistration/>
      <FAQSection/>
      {/* <Contact/> */}
      <Footer/>
    </div>
  )
}

export default page