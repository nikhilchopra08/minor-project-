export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Tell Us About Your Needs",
      description: "Share your energy requirements, roof details, and location. We'll match you with the best solar dealers in your area.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      number: "02",
      title: "Get Matched with Verified Dealers",
      description: "Our platform connects you with pre-screened, certified solar installation professionals in your region.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      number: "03",
      title: "Compare Quotes & Reviews",
      description: "Receive multiple competitive quotes and compare dealer ratings, customer reviews, and portfolio examples.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      number: "04",
      title: "Go Solar & Save",
      description: "Choose your preferred dealer and start your solar journey. Enjoy cleaner energy and significant savings on your bills.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            How <span className="text-emerald-600">Greenify</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Getting solar power has never been easier. Our simple 4-step process connects you directly with trusted solar professionals.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-8 border border-emerald-100 group hover:border-emerald-200"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm group-hover:bg-emerald-600 transition-colors duration-300">
                {step.number}
              </div>

              {/* Icon */}
              <div className="text-emerald-500 mb-6 mt-4 group-hover:text-emerald-600 transition-colors duration-300">
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 leading-tight">
                {step.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line (Desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-emerald-200 group-hover:bg-emerald-300 transition-colors duration-300"></div>
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-emerald-200 rounded-full bg-white group-hover:border-emerald-300 transition-colors duration-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-white rounded-2xl shadow-sm p-12 border border-emerald-100">
          <h3 className="text-3xl font-semibold text-gray-800 mb-6">
            Ready to Start Your Solar Journey?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of homeowners who have already made the switch to clean, renewable energy with Greenify.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-5 rounded-xl text-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1">
              Get Started Today
            </button>
            <button className="border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white px-12 py-5 rounded-xl text-xl font-semibold transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}