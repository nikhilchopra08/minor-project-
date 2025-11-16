'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, Star, Leaf, Clock, Users, Zap, CheckCircle } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

interface PackageService {
  service: Service;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  isActive: boolean;
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
  services: PackageService[];
}

interface PackageResponse {
  success: boolean;
  message: string;
  data: Package;
}

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pkg, setPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/packages/${params.id}`);
        const data: PackageResponse = await response.json();
        
        if (data.success) {
          setPackage(data.data);
        } else {
          setError('Package not found');
        }
      } catch (err) {
        setError('Error fetching package details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPackage();
    }
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateSavings = (services: PackageService[]) => {
    const individualTotal = services.reduce((total, pkgService) => total + pkgService.service.price, 0);
    const packageTotal = pkg?.price || 0;
    return individualTotal - packageTotal;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
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

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Package Not Found</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/packages')}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
            >
              Back to Packages
            </button>
          </div>
        </div>
      </div>
    );
  }

  const savings = calculateSavings(pkg.services);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-green-600 hover:text-green-700 mb-8 font-semibold"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Packages
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{pkg.name}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{pkg.services.length} Services Included</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-300 fill-current mr-1" />
                    <span>4.8 (32 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{formatPrice(pkg.price)}</div>
                <div className="text-green-100">Complete Package</div>
                {savings > 0 && (
                  <div className="text-green-200 text-sm mt-1">
                    Save {formatPrice(savings)} vs individual
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Package Overview</h2>
                  <p className="text-gray-700 leading-relaxed">{pkg.description}</p>
                </section>

                {/* Included Services */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Included Services</h2>
                  <div className="grid gap-4">
                    {pkg.services.map((pkgService) => (
                      <div key={pkgService.service.id} className="border border-green-200 rounded-xl p-6 bg-green-50 hover:bg-green-100 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                              <h3 className="text-lg font-semibold text-gray-900">{pkgService.service.name}</h3>
                            </div>
                            <p className="text-gray-600 mb-3">{pkgService.service.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {pkgService.service.duration}
                              </div>
                              <div className="flex items-center">
                                <Zap className="h-4 w-4 mr-1" />
                                Individual: {formatPrice(pkgService.service.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Savings Calculation */}
                {savings > 0 && (
                  <section className="mb-8">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">Package Savings</h3>
                      <p className="mb-2">
                        Individual services total: <span className="font-semibold line-through">{formatPrice(savings + pkg.price)}</span>
                      </p>
                      <p className="mb-2">
                        Package price: <span className="font-semibold">{formatPrice(pkg.price)}</span>
                      </p>
                      <p className="text-lg font-bold">
                        You save: <span className="text-yellow-300">{formatPrice(savings)}</span>
                      </p>
                    </div>
                  </section>
                )}
              </div>

              {/* Dealer Info Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 sticky top-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Package Provider</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {pkg.dealer.dealerProfile.businessName}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {pkg.dealer.dealerProfile.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-gray-700">
                        <MapPin className="h-4 w-4 mr-3 text-green-600" />
                        <span className="text-sm">{pkg.dealer.dealerProfile.address}, {pkg.dealer.dealerProfile.city}, {pkg.dealer.dealerProfile.state}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Phone className="h-4 w-4 mr-3 text-green-600" />
                        <span className="text-sm">{pkg.dealer.dealerProfile.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Mail className="h-4 w-4 mr-3 text-green-600" />
                        <span className="text-sm">{pkg.dealer.dealerProfile.businessEmail}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <button className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                        Get This Package
                      </button>
                      <button className="w-full border border-green-600 text-green-600 py-3 px-4 rounded-xl font-semibold hover:bg-green-50 transition-colors">
                        Request Custom Quote
                      </button>
                      <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                        Download Brochure
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