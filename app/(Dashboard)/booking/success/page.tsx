'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Clock, MessageCircle, Home, ArrowLeft } from 'lucide-react';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Thank you for your booking request. Our dealer will get in touch with you shortly to discuss your free quote and project details.
          </p>

          {/* Booking ID */}
          {bookingId && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-emerald-800 font-medium">
                Booking Reference: <span className="font-mono">{bookingId}</span>
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Dealer will contact you within 24 hours</span>
              </li>
              <li className="flex items-start">
                <MessageCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Discuss your project requirements and schedule site visit</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Receive your free, no-obligation quote</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/services')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </button>
            
            <button
              onClick={() => router.push('/services')}
              className="w-full border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Browse More Services
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need immediate assistance?{' '}
              <button 
                onClick={() => router.push('/contact')}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Contact support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}