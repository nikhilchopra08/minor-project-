import React from 'react';
import { UserData } from '@/types/dashboard';

interface ProfileCardProps {
  userData: UserData;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userData }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg border border-green-200 overflow-hidden">
      <div className="bg-green-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">User Profile</h2>
      </div>
      
      <div className="p-6">
        {/* Basic Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">User ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                {userData.id}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{userData.role.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        {userData.profile && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
              Profile Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">
                  {userData.profile.fullName || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1 text-sm text-gray-900">
                  {userData.profile.phone || 'Not provided'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="mt-1 text-sm text-gray-900">
                  {userData.profile.address || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">City</label>
                <p className="mt-1 text-sm text-gray-900">
                  {userData.profile.city || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">State</label>
                <p className="mt-1 text-sm text-gray-900">
                  {userData.profile.state || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.profile?.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Profile Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(userData.profile.createdAt)}
                </p>
              </div>
            )}
            {userData.profile?.updatedAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(userData.profile.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;