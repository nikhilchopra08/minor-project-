import { CheckCircleIcon } from 'lucide-react';

const SuccessStep: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-6">
        <CheckCircleIcon className="h-24 w-24 text-green-500" />
      </div>
      <h2 className="text-3xl font-bold text-green-800 mb-4">
        Registration Successful!
      </h2>
      <p className="text-green-600 text-lg mb-8 max-w-md mx-auto">
        Thank you for registering as a dealer. Your account is being reviewed and you will receive a confirmation email shortly.
      </p>
      <div className="space-y-4">
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full max-w-xs bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Go to Login
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full max-w-xs bg-white text-green-600 border border-green-600 py-3 px-6 rounded-lg hover:bg-green-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SuccessStep;