'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, Home, Building, Zap, Calculator, MapPin } from 'lucide-react';

interface QuoteRequestForm {
  dealerId: string;
  location: string;
  currentSetup: string;
  powerUsage: string;
  renovationType: 'NEW_INSTALLATION' | 'SYSTEM_UPGRADE' | 'MAINTENANCE' | 'REPAIR';
  description: string;
  images: string[];
}

export default function QuoteRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');
  const dealerId = searchParams.get('dealerId');

  const [formData, setFormData] = useState<QuoteRequestForm>({
    dealerId: dealerId || '',
    location: '',
    currentSetup: '',
    powerUsage: '',
    renovationType: 'NEW_INSTALLATION',
    description: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const renovationTypes = [
    { value: 'NEW_INSTALLATION', label: 'New Installation', icon: Home },
    { value: 'SYSTEM_UPGRADE', label: 'System Upgrade', icon: Zap },
    { value: 'MAINTENANCE', label: 'Maintenance', icon: Building },
    { value: 'REPAIR', label: 'Repair', icon: Calculator }
  ];

  const handleInputChange = (field: keyof QuoteRequestForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach(file => {
      // In a real app, you would upload to cloud storage and get URL
      // For now, we'll create object URLs for preview
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
      newImages.push(`placeholder-url-for-${file.name}`); // Replace with actual uploaded URL
    });

    setImagePreviews(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...newImages] 
    }));
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quotes/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/quotes/success?quoteId=${data.data.id}`);
      } else {
        setError(data.message || 'Failed to submit quote request');
      }
    } catch (err) {
      setError('An error occurred while submitting your request');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-green-600 hover:text-green-700 mb-6 font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Request Solar Quote
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Provide details about your solar energy needs and get a customized quote from our certified dealers.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-green-50 rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Type */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Project Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renovationTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('renovationType', type.value)}
                      className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                        formData.renovationType === type.value
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                      }`}
                    >
                      <IconComponent className={`h-6 w-6 mb-2 ${
                        formData.renovationType === type.value ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-gray-900">{type.label}</h3>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Property Location
              </label>
              <input
                type="text"
                id="location"
                required
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter your full address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Current Setup */}
            <div>
              <label htmlFor="currentSetup" className="block text-sm font-medium text-gray-700 mb-2">
                Current Energy Setup
              </label>
              <textarea
                id="currentSetup"
                required
                rows={3}
                value={formData.currentSetup}
                onChange={(e) => handleInputChange('currentSetup', e.target.value)}
                placeholder="Describe your current energy setup (e.g., grid-connected, existing solar panels, battery storage)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical"
              />
            </div>

            {/* Power Usage */}
            <div>
              <label htmlFor="powerUsage" className="block text-sm font-medium text-gray-700 mb-2">
                Average Monthly Power Usage
              </label>
              <input
                type="text"
                id="powerUsage"
                required
                value={formData.powerUsage}
                onChange={(e) => handleInputChange('powerUsage', e.target.value)}
                placeholder="e.g., 500 kWh or provide your electricity bill amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Additional Details */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Requirements & Details
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Any specific requirements, timeline, budget constraints, or additional information that would help us provide an accurate quote..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload photos of your property, roof, or electrical setup</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium"
                >
                  Choose Files
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Photos:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Request Quote'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}