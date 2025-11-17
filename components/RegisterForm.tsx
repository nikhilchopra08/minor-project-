import React from 'react';
import { useAppSelector } from '@/store/hooks';
import ProgressBar from './ProgressBar';
import PersonalInfoStep from './user-register-steps/PersonalInfoStep';
import AddressStep from './user-register-steps/AddressStep';
import PasswordStep from './user-register-steps/PasswordStep';

const RegisterForm: React.FC = () => {
  const { currentStep, error } = useAppSelector((state) => state.register);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <AddressStep />;
      case 3:
        return <PasswordStep />;
      default:
        return <PersonalInfoStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Create Your Account
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ProgressBar />
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;