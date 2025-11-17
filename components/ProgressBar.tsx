import React from 'react';
import { useAppSelector } from '@/store/hooks';

const ProgressBar: React.FC = () => {
  const { currentStep } = useAppSelector((state) => state.register);
  
  const steps = [
    { number: 1, label: 'Personal Info' },
    { number: 2, label: 'Address' },
    { number: 3, label: 'Password' },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.number
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-green-50 border-gray-300 text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <span className="text-sm mt-2 text-gray-600">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;