'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, Star, Leaf, Calendar } from 'lucide-react';

interface Package {
  package: {
    id: string;
    name: string;
    price: number;
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  createdAt: string;
  dealer: {
    id: string;
    email: string;
    dealerProfile: {
      businessName: string;
      businessEmail: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      description: string;
    };
  };
  packages: Package[];
}

interface ServiceResponse {
  success: boolean;
  message: string;
  data: Service;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/services/${params.id}`);
        const data: ServiceResponse = await response.json();
        
        if (data.success) {
          setService(data.data);
        } else {
          setError('Service not found');
        }
      } catch (err) {
        setError('Error fetching service details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-green-50 rounded-2xl shadow-lg p-8">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen linear-to-br from-green-50 to-emerald-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Service Not Found</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/services')}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-green-600 hover:text-green-700 mb-8 font-semibold"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Services
        </button>

        {/* Service Details */}
        <div className="bg-green-50 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-green-600 to-emerald-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
                <div className="flex items-center gap-4">
                  <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-medium">
                    {service.category}
                  </span>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-300 fill-current mr-1" />
                    <span>4.8 (24 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">₹{service.price}</div>
                <div className="text-green-100">Starting Price</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h2>
                  <p className="text-gray-700 leading-relaxed">{service.description}</p>
                </section>

                {/* Packages Section */}
                {service.packages && service.packages.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Packages</h2>
                    <div className="grid gap-4">
                      {service.packages.map((pkg, index) => (
                        <div key={pkg.package.id} className="border border-green-200 rounded-xl p-4 bg-green-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">{pkg.package.name}</h3>
                              <p className="text-green-600 font-bold text-lg">₹{pkg.package.price}</p>
                            </div>
                            <button onClick={() => router.push(`/packages/${pkg.package.id}`)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              Select Package
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Dealer Info Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Service Provider</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {service.dealer.dealerProfile.businessName}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {service.dealer.dealerProfile.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-gray-700">
                        <MapPin className="h-4 w-4 mr-3 text-green-600" />
                        <span>{service.dealer.dealerProfile.address}, {service.dealer.dealerProfile.city}, {service.dealer.dealerProfile.state}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Phone className="h-4 w-4 mr-3 text-green-600" />
                        <span>{service.dealer.dealerProfile.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Mail className="h-4 w-4 mr-3 text-green-600" />
                        <span>{service.dealer.dealerProfile.businessEmail}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors mb-3">
                        Contact Provider
                      </button>
                      <button
                         onClick={() => router.push(`/services/${service.id}/booking`)}
                      className="w-full border border-green-600 text-green-600 py-3 px-4 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center justify-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Schedule Consultation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}