import React from 'react';
import { UserData } from '@/types/dashboard';

interface ProfileCardProps {
  userData: UserData;
  onEdit: () => void;
  isUpdating?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userData, onEdit, isUpdating }) => {
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
    <div className="bg-green-50 shadow-lg rounded-lg border border-green-200 overflow-hidden">
      <div className="bg-green-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">User Profile</h2>
        <button
          onClick={onEdit}
          disabled={isUpdating}
          className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit Profile
        </button>
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
                  {userData.profile.fullName || (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1 text-sm text-gray-900">
                  {userData.profile.phone || (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="mt-1 text-sm text-gray-900">
                  {userData.profile.address || (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">City</label>
                <p className="mt-1 text-sm text-gray-900">
                  {userData.profile.city || (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">State</label>
                <p className="mt-1 text-sm text-gray-900">
                  {userData.profile.state || (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
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

        {/* Empty State */}
        {!userData.profile && (
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-gray-500 mb-4">No profile information available</p>
            <button
              onClick={onEdit}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
            >
              Create Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;