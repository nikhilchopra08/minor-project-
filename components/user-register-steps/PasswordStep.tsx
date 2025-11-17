import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updatePassword, prevStep, setLoading, setError, resetForm } from '@/store/registerSlice';
import { PasswordSchema } from '@/frontend-lib/schemas';
import type { PasswordStep } from '@/types/register';

const PasswordStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { formData, isLoading } = useAppSelector((state) => state.register);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordStep>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    },
  });

  const onSubmit = async (data: PasswordStep) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      dispatch(updatePassword(data));
      
      // Combine all form data
      const finalData = {
        ...formData,
        ...data,
      };

      const response = await fetch('/api/auth/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      // Registration successful - reset form and redirect to login
      dispatch(resetForm());
      router.push('/login');
      
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Registration failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleBack = () => {
    dispatch(prevStep());
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Create Password</h2>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          {...register('confirmPassword')}
          type="password"
          id="confirmPassword"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </form>
  );
};

export default PasswordStep;