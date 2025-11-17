import Spline from "@splinetool/react-spline"

export default function HeroSection() {
  return (
    <section className="min-h-[80vh] flex items-center py-16 bg-gradient-to-br from-white via-emerald-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Switch to{" "}
                <span className="text-emerald-600">Solar</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg">
                Power your home with clean, renewable energy and join the green revolution. 
                Simple, affordable, and sustainable.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-3 pt-4">
              {[
                "Save up to 60% on electricity bills",
                "Verified & certified installers", 
                "Government subsidy support",
                "25-year performance warranty",
                "Zero upfront cost options",
                "Increase property value"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md">
                Get Free Quote
              </button>
              
              <button className="border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                Explore Benefits
              </button>
            </div>
          </div>

          {/* Right Column - Spline Model */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[550px]">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-200">
              <Spline 
                scene="https://prod.spline.design/bB4agAOISogKwuxY/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}