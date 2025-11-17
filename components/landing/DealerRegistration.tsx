import Link from "next/link";

export default function DealerRegistration() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span>⭐</span>
                <span>NEW OPPORTUNITY</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Want to work with us?
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-emerald-600 mb-6">
                Become a Greenify Dealer
              </h3>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <h4 className="text-2xl md:text-3xl font-bold text-gray-800">
                Grow Your Solar Business
              </h4>
              <p className="text-lg text-gray-600">
                Join our network of trusted solar professionals and expand your reach 
                with qualified customer leads.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              {[
                {
                  icon: "✅",
                  title: "Get verified by Greenify",
                  description: "Build trust with our certification badge"
                },
                {
                  icon: "📈",
                  title: "Receive customer leads directly",
                  description: "Get matched with homeowners in your area"
                },
                {
                  icon: "🛠️",
                  title: "Manage installations with ease",
                  description: "Use our dealer dashboard for project management"
                },
                {
                  icon: "🎯",
                  title: "Zero commission for early partners",
                  description: "Limited time offer - join our founding dealer network"
                }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-emerald-100 group-hover:shadow-md transition-all duration-300 flex-shrink-0">
                    <span className="text-xl">{benefit.icon}</span>
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-1">
                      {benefit.title}
                    </h5>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href={'/dealer/register'}>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 flex items-center justify-center space-x-2">
                <span>Register as Dealer</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              </Link>
              
              <button className="border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
                <span>Learn More</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

          </div>

          {/* Right Column - Illustration Placeholder */}
          <div className="relative">
            <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-200 shadow-lg flex items-center justify-center">
              {/* Spline Model Placeholder */}
              <div className="text-center space-y-4 p-8">
                <div className="w-32 h-32 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🤝</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-800">Dealer Partnership</h4>
                <p className="text-gray-600 max-w-md">
                  Interactive illustration showing solar professionals collaborating with homeowners
                </p>
                <div className="text-sm text-gray-500 mt-4">
                  Spline Model: Dealer toolkit & handshake animation
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-6 right-6 w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">☀️</span>
              </div>
              <div className="absolute bottom-6 left-6 w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-emerald-200 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-green-200 rounded-full opacity-30 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}