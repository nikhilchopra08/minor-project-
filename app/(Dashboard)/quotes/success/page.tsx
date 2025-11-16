'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Mail, Phone, ArrowRight } from 'lucide-react';

export default function QuoteSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quoteId = searchParams.get('quoteId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Quote Request Submitted!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your interest in going solar with Greenify. Your quote request has been received and our certified dealers will contact you shortly.
          </p>

          {/* Quote ID */}
          {quoteId && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600">Your reference number:</p>
              <p className="font-mono font-bold text-gray-900 text-lg">{quoteId}</p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-green-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-green-800 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-green-700">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Our certified dealers will review your requirements</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>You'll receive customized quotes within 24-48 hours</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Dealers may contact you for additional details</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/packages')}
              className="flex-1 px-6 py-3 border border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-colors font-semibold"
            >
              Browse More Packages
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
            >
              View My Quotes
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}