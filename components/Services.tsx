'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Leaf, Star, MapPin, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  dealer: {
    id: string;
    email: string;
    dealerProfile: {
      businessName: string;
      city: string;
      state: string;
    };
  };
  createdAt: string;
}

interface ServicesResponse {
  success: boolean;
  message: string;
  data: Service[];
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    dealerId: '',
    search: ''
  });

  const categories = [
    'Residential Installation',
    'Commercial Installation',
    'Maintenance',
    'Consultation',
    'System Upgrade',
    'Roof Assessment'
  ];

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.dealerId) params.append('dealerId', filters.dealerId);
      
      const response = await fetch(`/api/services?${params.toString()}`);
      const data: ServicesResponse = await response.json();
      
      if (data.success) {
        setAllServices(data.data);
        applyFilters(data.data, filters.search);
      } else {
        setError('Failed to fetch services');
      }
    } catch (err) {
      setError('Error fetching services');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (servicesList: Service[], searchTerm: string) => {
    let filteredServices = servicesList;
    
    // Apply search filter
    if (searchTerm) {
    const query = searchTerm.toLowerCase();

    filteredServices = filteredServices.filter(service => {
        const title = service.title?.toLowerCase() || "";
        const description = service.description?.toLowerCase() || "";
        const businessName =
        service.dealer?.dealerProfile?.businessName?.toLowerCase() || "";
        const category = service.category?.toLowerCase() || "";
    });
    }

    
    setServices(filteredServices);
  };

  useEffect(() => {
    fetchServices();
  }, [filters.category, filters.dealerId]);

  useEffect(() => {
    // Apply search filter when search term changes
    applyFilters(allServices, filters.search);
  }, [filters.search, allServices]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      dealerId: '',
      search: ''
    });
  };

  const viewServiceDetails = (serviceId: string) => {
    router.push(`/services/${serviceId}`);
  };

  const contactAgent = (service: Service) => {
    // Implement contact functionality
    console.log('Contact agent:', service.dealer.email);
    // You can open a modal or redirect to contact page
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Greenify Services</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with certified solar installation experts and find the perfect service for your renewable energy needs
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-green-50 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Services
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by service name, description, business, or category..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchServices}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && (
          <>
            {services.length === 0 ? (
              <div className="text-center py-12 bg-green-50 rounded-2xl shadow-lg">
                <Leaf className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold">{services.length}</span> services
                    {filters.search && (
                      <span className="ml-2">
                        for "<span className="font-semibold">{filters.search}</span>"
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onViewDetails={viewServiceDetails}
                      onContact={contactAgent}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Service Card Component
interface ServiceCardProps {
  service: Service;
  onViewDetails: (serviceId: string) => void;
  onContact: (service: Service) => void;
}

function ServiceCard({ service, onViewDetails, onContact }: ServiceCardProps) {
  return (
    <div className="bg-green-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100 group cursor-pointer">
      <div className="p-6">
        {/* Service Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
              {service.name}
            </h3>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {service.category}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Starting from</div>
            <div className="text-2xl font-bold text-green-600">
              ₹{service.price}
            </div>
          </div>
        </div>

        {/* Service Description */}
        <p className="text-gray-600 mb-6 line-clamp-3">
          {service.description}
        </p>

        {/* Dealer Info */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">
                {service.dealer.dealerProfile.businessName}
              </h4>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {service.dealer.dealerProfile.city}, {service.dealer.dealerProfile.state}
              </div>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">4.8</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => onContact(service)}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors text-center"
          >
            Contact Agent
          </button>
          <button 
            onClick={() => onViewDetails(service.id)}
            className="flex items-center justify-center px-4 py-3 border border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-colors group"
            title="View Details"
          >
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}