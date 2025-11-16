import React from 'react';
import { ProfileApiResponse } from '@/types/dashboard';

interface RawResponseCardProps {
  apiResponse: ProfileApiResponse;
}

const RawResponseCard: React.FC<RawResponseCardProps> = ({ apiResponse }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white shadow-lg rounded-lg border border-green-200 overflow-hidden">
      <div className="bg-green-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">API Response</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-green-100 hover:text-white text-sm font-medium"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Success:</span>
              <span className={`ml-1 font-medium ${apiResponse.success ? 'text-green-600' : 'text-red-600'}`}>
                {apiResponse.success.toString()}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600">Message:</span>
              <span className="ml-1 font-medium text-gray-900">{apiResponse.message}</span>
            </div>
          </div>
        </div>

        {isExpanded ? (
          <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto text-sm">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              Click "Expand" to view the complete API response JSON
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RawResponseCard;