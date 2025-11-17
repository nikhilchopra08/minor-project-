'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentStep, resetForm } from '@/store/dealerRegistrationSlice';
import PersonalInfoStep from './steps/PersonalInfoStep';
import BusinessInfoStep from './steps/BusinessInfoStep';
import LocationInfoStep from './steps/LocationInfoStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';
import ProgressBar from './steps/ProgressBar';
import SuccessStep from './steps/SuccessStep';

const DealerRegistrationForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentStep, isLoading, error } = useAppSelector((state) => state.dealerRegistration);
  const [isSuccess, setIsSuccess] = useState(false);

  const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Business Info' },
    { number: 3, title: 'Location' },
    { number: 4, title: 'Additional Info' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      dispatch(setCurrentStep(currentStep + 1));
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const handleSuccess = () => {
    setIsSuccess(true);
    dispatch(resetForm());
  };

  if (isSuccess) {
    return <SuccessStep />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              Dealer Registration
            </h1>
            <p className="text-green-600">
              Join our network of trusted dealers
            </p>
          </div>

          {/* Progress Bar */}
          <ProgressBar steps={steps} currentStep={currentStep} />

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Form Steps */}
          <div className="mt-8">
            {currentStep === 1 && <PersonalInfoStep onNext={handleNext} />}
            {currentStep === 2 && <BusinessInfoStep onNext={handleNext} onBack={handleBack} />}
            {currentStep === 3 && <LocationInfoStep onNext={handleNext} onBack={handleBack} />}
            {currentStep === 4 && (
              <AdditionalInfoStep 
                onBack={handleBack} 
                onSuccess={handleSuccess}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerRegistrationForm;