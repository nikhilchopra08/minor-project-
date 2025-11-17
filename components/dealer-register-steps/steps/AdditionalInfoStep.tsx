import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData, setLoading, setError } from '@/store/dealerRegistrationSlice';

interface AdditionalInfoStepProps {
  onBack: () => void;
  onSuccess: () => void;
  isLoading: boolean;
}

interface FormData {
  description: string;
}

const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({ 
  onBack, 
  onSuccess, 
  isLoading 
}) => {
  const dispatch = useAppDispatch();
  const { formData } = useAppSelector((state) => state.dealerRegistration);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: formData,
  });

  const onSubmit = async (data: FormData) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Combine all form data
      const finalData = { ...formData, ...data };

      const response = await fetch('/api/auth/register-dealer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        dispatch(setError(result.message || 'Registration failed'));
      }
    } catch (error) {
      dispatch(setError('An error occurred during registration'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Additional Information</h2>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Business Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
          placeholder="Tell us about your business (optional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
              Registering...
            </div>
          ) : (
            'Complete Registration'
          )}
        </button>
      </div>
    </form>
  );
};

export default AdditionalInfoStep;