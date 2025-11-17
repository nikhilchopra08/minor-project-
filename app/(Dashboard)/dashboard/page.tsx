'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/frontend-lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import ProfileCard from '@/components/ProfileCard';
import RawResponseCard from '@/components/RawResponseCard';
import EditProfileModal from '@/components/EditProfileModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ProfileApiResponse, UpdateProfileData } from '@/types/dashboard';

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [profileData, setProfileData] = useState<ProfileApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchProfileData();
  }, [isAuthenticated, router]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get('/api/user/profile');
      const data: ProfileApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setProfileData(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (updateData: UpdateProfileData) => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccessMessage(null);

      const response = await apiClient.put('/api/user/profile', updateData);
      const data: ProfileApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setProfileData(data);
      setSuccessMessage('Profile updated successfully!');
      setIsEditModalOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefresh = () => {
    fetchProfileData();
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setError(null);
  };

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.profile?.fullName || user?.email}!
          </h1>
          <p className="text-green-600">
            Here's your complete profile information from the Greenify system.
          </p>
        </div>

        {/* Refresh Button */}
        {/* <div className="mb-6">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div> */}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-green-600">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Content */}
        {!isLoading && profileData && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Profile Card */}
            <div>
              <ProfileCard 
                userData={profileData.data} 
                onEdit={handleEditClick}
                isUpdating={isUpdating}
              />
            </div>

            {/* Raw API Response */}
            <div>
              <RawResponseCard apiResponse={profileData} />
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && profileData && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-green-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Profile Status</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {profileData.data.profile ? 'Complete' : 'Incomplete'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-green-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profileData.data.profile?.createdAt 
                      ? new Date(profileData.data.profile.createdAt).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-green-200">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Account Role</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {profileData.data.role.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {profileData && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onSave={handleUpdateProfile}
          userData={profileData.data}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default DashboardPage;