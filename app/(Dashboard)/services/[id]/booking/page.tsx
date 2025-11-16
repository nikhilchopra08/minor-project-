'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, MapPin, User, Mail, Phone, CheckCircle, Home, Zap } from 'lucide-react';
import { apiClient } from '@/frontend-lib/api';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
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
    };
  };
}

interface BookingForm {
  serviceId: string;
  dealerId: string;
  scheduledDate: string;
  startTime: string;
  estimatedHours: number;
  location: string;
  contactPhone: string;
  contactEmail: string;
  specialNotes: string;
}

export default function ServiceBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookingForm>({
    serviceId: params.id as string,
    dealerId: '',
    scheduledDate: '',
    startTime: '09:00',
    estimatedHours: 4,
    location: '',
    contactPhone: '',
    contactEmail: '',
    specialNotes: ''
  });

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const durationOptions = [2, 4, 6, 8];

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/services/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setService(data.data);
          setFormData(prev => ({
            ...prev,
            dealerId: data.data.dealer.id
          }));
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

  const handleInputChange = (field: keyof BookingForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (bookingError) setBookingError(null);
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum 1 day in advance
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // Maximum 3 months in advance
    return maxDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);

    try {
    //   const response = await fetch('/api/booking/create', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(formData),
    //   });
    const response = await apiClient.post('/api/booking/create', formData);

      const data = await response.json();

      if (data.success) {
        router.push(`/booking/success?bookingId=${data.data.id}`);
      } else {
        setBookingError(data.message || 'Failed to create booking');
      }
    } catch (err) {
      setBookingError('An error occurred while creating your booking');
      console.error('Booking error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/services/${params.id}`)}
            className="flex items-center text-green-600 hover:text-green-700 mb-6 font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Service
          </button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Book Service
            </h1>
            <p className="text-xl text-gray-600">
              Schedule your <span className="font-semibold text-green-600">{service.name}</span> with {service.dealer.dealerProfile.businessName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Summary */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-green-800 mb-2">Service Details</h3>
                  <p className="text-green-700">{service.name}</p>
                  <p className="text-green-600 text-sm">{service.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-green-600">${service.price}</span>
                    <span className="text-sm text-green-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="contactPhone"
                        required
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="Your phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        required
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="Your email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Service Location
                  </h3>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <input
                    type="text"
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter the complete address where service will be performed"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>

                {/* Scheduling */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    Schedule Service
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        id="scheduledDate"
                        required
                        value={formData.scheduledDate}
                        onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time *
                      </label>
                      <select
                        id="startTime"
                        required
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      >
                        {timeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
                        Duration *
                      </label>
                      <select
                        id="estimatedHours"
                        required
                        value={formData.estimatedHours}
                        onChange={(e) => handleInputChange('estimatedHours', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      >
                        {durationOptions.map(hours => (
                          <option key={hours} value={hours}>{hours} hours</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Special Notes */}
                <div>
                  <label htmlFor="specialNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="specialNotes"
                    rows={4}
                    value={formData.specialNotes}
                    onChange={(e) => handleInputChange('specialNotes', e.target.value)}
                    placeholder="Any special requirements, access instructions, or additional information..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical"
                  />
                </div>

                {/* Error Message */}
                {bookingError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-800 text-sm">{bookingError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </div>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Service Provider Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Service Provider</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {service.dealer.dealerProfile.businessName}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Professional solar installation service
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-3 text-green-600" />
                    <span className="text-sm">{service.dealer.dealerProfile.city}, {service.dealer.dealerProfile.state}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-3 text-green-600" />
                    <span className="text-sm">{service.dealer.dealerProfile.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-4 w-4 mr-3 text-green-600" />
                    <span className="text-sm">{service.dealer.dealerProfile.businessEmail}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Service Price:</span>
                    <span className="font-semibold text-green-600">${service.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estimated Duration:</span>
                    <span className="font-semibold text-gray-900">{service.duration}</span>
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