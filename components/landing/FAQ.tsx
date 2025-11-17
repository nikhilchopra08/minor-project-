'use client';

import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How much does solar installation cost?",
      answer: "The cost varies based on your home size and energy needs, but most residential installations range from $15,000 to $25,000. With federal tax credits and state incentives, your out-of-pocket cost can be reduced by 30-50%. We offer flexible financing options with $0 down payment available."
    },
    {
      question: "How long does the installation process take?",
      answer: "Most residential solar installations are completed within 1-3 days. The entire process from consultation to activation typically takes 4-8 weeks, including site assessment, permitting, installation, and utility approval. We handle all the paperwork for you."
    },
    {
      question: "Are all dealers verified and certified?",
      answer: "Yes! Every dealer on Greenify is thoroughly vetted and must hold NABCEP certification or equivalent. We verify their licenses, insurance, customer reviews, and track record. Only the top 20% of applicants are accepted onto our platform."
    },
    {
      question: "What government subsidies and incentives are available?",
      answer: "You can benefit from the 30% federal solar tax credit, state-level rebates, net metering programs, and local utility incentives. Our experts help you identify and apply for all eligible subsidies, potentially saving you thousands on your installation."
    },
    {
      question: "Do solar panels work during power outages?",
      answer: "Standard grid-tied systems shut down during outages for safety. However, you can add battery storage (like Tesla Powerwall) to power essential appliances during outages. Our dealers can help design a system that meets your backup power needs."
    },
    {
      question: "What maintenance do solar panels require?",
      answer: "Solar panels require minimal maintenance. Occasional cleaning (2-4 times per year) and annual inspections are recommended. Most systems come with 25-year performance warranties and 10-12 year equipment warranties for peace of mind."
    },
    {
      question: "Can I install solar if I rent my home?",
      answer: "While rooftop solar typically requires home ownership, renters can explore community solar programs or portable solar options. We also work with landlords who want to add solar to their rental properties."
    },
    {
      question: "How much can I save on electricity bills?",
      answer: "Most homeowners save 50-90% on their electricity bills. Exact savings depend on your location, energy consumption, and system size. Many customers achieve full return on investment within 5-8 years through energy savings and incentives."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get answers to common questions about going solar with Greenify
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-emerald-100 rounded-lg bg-green-50 hover:bg-emerald-50 transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset rounded-lg transition-colors duration-1000"
              >
                <span className="text-lg font-semibold text-gray-800 pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-emerald-500 transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed transform transition-transform duration-300">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help CTA */}
        <div className="text-center mt-12 pt-8 border-t border-emerald-100">
          <p className="text-gray-600 mb-6">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
              Contact Support
            </button>
            <button className="border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}