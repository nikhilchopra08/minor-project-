import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData } from '@/store/dealerRegistrationSlice';

interface BusinessInfoStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface FormData {
  businessName: string;
  businessEmail: string;
  phone: string;
  gstNumber: string;
}

const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({ onNext, onBack }) => {
  const dispatch = useAppDispatch();
  const { formData } = useAppSelector((state) => state.dealerRegistration);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: formData,
  });

  const onSubmit = (data: FormData) => {
    dispatch(updateFormData(data));
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Business Information</h2>
      
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
          Business Name *
        </label>
        <input
          {...register('businessName', { required: 'Business name is required' })}
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          placeholder="Enter your business name"
        />
        {errors.businessName && (
          <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-2">
          Business Email *
        </label>
        <input
          {...register('businessEmail', {
            required: 'Business email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          type="email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          placeholder="Enter business email"
        />
        {errors.businessEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.businessEmail.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          {...register('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Phone number must be 10 digits',
            },
          })}
          type="tel"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          placeholder="Enter phone number"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-2">
          GST Number *
        </label>
        <input
          {...register('gstNumber', {
            required: 'GST number is required',
            pattern: {
              value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
              message: 'Invalid GST number format',
            },
          })}
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          placeholder="Enter GST number"
        />
        {errors.gstNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.gstNumber.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Continue to Location
        </button>
      </div>
    </form>
  );
};

export default BusinessInfoStep;