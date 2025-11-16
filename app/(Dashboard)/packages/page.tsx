'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Leaf, Star, MapPin, Users, Clock, ArrowRight, Zap } from 'lucide-react';

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
      city: string;
      state: string;
    };
  };
  services: PackageService[];
}

interface PackagesResponse {
  success: boolean;
  message: string;
  data: Package[];
}

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dealerId: '',
    search: '',
    priceRange: 'all'
  });

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'basic', label: 'Basic ($0 - $5,000)' },
    { value: 'standard', label: 'Standard ($5,000 - $15,000)' },
    { value: 'premium', label: 'Premium ($15,000+)' }
  ];

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.dealerId) params.append('dealerId', filters.dealerId);
      
      const response = await fetch(`/api/packages?${params.toString()}`);
      const data: PackagesResponse = await response.json();
      
      if (data.success) {
        setAllPackages(data.data);
        applyFilters(data.data, filters.search, filters.priceRange);
      } else {
        setError('Failed to fetch packages');
      }
    } catch (err) {
      setError('Error fetching packages');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (packagesList: Package[], searchTerm: string, priceRange: string) => {
    let filteredPackages = packagesList;
    
    // Apply search filter
    if (searchTerm) {
      filteredPackages = filteredPackages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.dealer.dealerProfile.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.services.some(pkgService => 
          pkgService.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkgService.service.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply price range filter
    if (priceRange !== 'all') {
      filteredPackages = filteredPackages.filter(pkg => {
        switch (priceRange) {
          case 'basic':
            return pkg.price <= 5000;
          case 'standard':
            return pkg.price > 5000 && pkg.price <= 15000;
          case 'premium':
            return pkg.price > 15000;
          default:
            return true;
        }
      });
    }
    
    setPackages(filteredPackages);
  };

  useEffect(() => {
    fetchPackages();
  }, [filters.dealerId]);

  useEffect(() => {
    applyFilters(allPackages, filters.search, filters.priceRange);
  }, [filters.search, filters.priceRange, allPackages]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dealerId: '',
      search: '',
      priceRange: 'all'
    });
  };

  const viewPackageDetails = (packageId: string) => {
    router.push(`/packages/${packageId}`);
  };

  const contactDealer = (pkg: Package) => {
    // Implement contact functionality
    console.log('Contact dealer:', pkg.dealer.email);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPriceRangeLabel = (price: number) => {
    if (price <= 5000) return 'Basic';
    if (price <= 15000) return 'Standard';
    return 'Premium';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Solar Packages</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover comprehensive solar solutions with our curated packages. 
            From basic installations to premium systems, find the perfect fit for your energy needs.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Packages
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by package name, description, services, or dealer..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
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
              onClick={fetchPackages}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Packages Grid */}
        {!loading && !error && (
          <>
            {packages.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages found</h3>
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
                    Showing <span className="font-semibold">{packages.length}</span> packages
                    {filters.search && (
                      <span className="ml-2">
                        for "<span className="font-semibold">{filters.search}</span>"
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      onViewDetails={viewPackageDetails}
                      onContact={contactDealer}
                      formatPrice={formatPrice}
                      getPriceRangeLabel={getPriceRangeLabel}
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

// Package Card Component
interface PackageCardProps {
  pkg: Package;
  onViewDetails: (packageId: string) => void;
  onContact: (pkg: Package) => void;
  formatPrice: (price: number) => string;
  getPriceRangeLabel: (price: number) => string;
}

function PackageCard({ pkg, onViewDetails, onContact, formatPrice, getPriceRangeLabel }: PackageCardProps) {
  const priceRange = getPriceRangeLabel(pkg.price);
  const priceRangeColors = {
    Basic: 'bg-blue-100 text-blue-800',
    Standard: 'bg-green-100 text-green-800',
    Premium: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100 group">
      {/* Price Range Badge */}
      <div className={`px-4 py-2 ${priceRangeColors[priceRange as keyof typeof priceRangeColors]} text-sm font-semibold text-center`}>
        {priceRange} Package
      </div>

      <div className="p-6">
        {/* Package Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
              {pkg.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {pkg.duration}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {pkg.services.length} services
              </div>
            </div>
          </div>
        </div>

        {/* Package Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {pkg.description}
        </p>

        {/* Included Services */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Includes:</h4>
          <div className="space-y-1">
            {pkg.services.slice(0, 3).map((pkgService, index) => (
              <div key={pkgService.service.id} className="flex items-center text-sm text-gray-600">
                <Leaf className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                <span className="truncate">{pkgService.service.name}</span>
              </div>
            ))}
            {pkg.services.length > 3 && (
              <div className="text-sm text-green-600 font-medium">
                +{pkg.services.length - 3} more services
              </div>
            )}
          </div>
        </div>

        {/* Dealer Info */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {pkg.dealer.dealerProfile.businessName}
              </h4>
              <div className="flex items-center text-gray-500 text-xs mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {pkg.dealer.dealerProfile.city}, {pkg.dealer.dealerProfile.state}
              </div>
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 ml-1">4.8</span>
            </div>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(pkg.price)}
            </div>
            <div className="text-xs text-gray-500">Total package</div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => onContact(pkg)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
            >
              Contact
            </button>
            <button 
              onClick={() => onViewDetails(pkg.id)}
              className="p-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors group"
              title="View Details"
            >
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}