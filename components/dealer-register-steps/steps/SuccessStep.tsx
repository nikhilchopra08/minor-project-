import { CheckCircleIcon } from 'lucide-react';

const SuccessStep: React.FC = () => {
  return (
    <div className="text-center py-16 bg-emerald-50 rounded-2xl border border-emerald-100 mx-4">
      <div className="flex justify-center mb-8">
        <CheckCircleIcon className="h-28 w-28 text-emerald-500" />
      </div>
      <h2 className="text-4xl font-bold text-emerald-800 mb-6">
        Registration Successful!
      </h2>
      <p className="text-emerald-700 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
        Thank you for registering as a dealer. Your account is being reviewed and you will receive a confirmation email shortly.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-md mx-auto">
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Go to Login
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full sm:w-auto bg-green-50 text-emerald-500 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-white py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-300 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SuccessStep;