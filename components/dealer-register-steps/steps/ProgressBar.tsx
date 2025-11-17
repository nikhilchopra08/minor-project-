import React from 'react';

interface ProgressBarProps {
  steps: { number: number; title: string }[];
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      {/* Step Indicators */}
      <div className="flex justify-between mb-3">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex flex-col items-center ${
              step.number <= currentStep ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step.number <= currentStep
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}
            >
              {step.number}
            </div>
            <span className="text-xs mt-2 font-medium hidden sm:block">
              {step.title}
            </span>
          </div>
        ))}
      </div>
      
      {/* Progress Line */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;