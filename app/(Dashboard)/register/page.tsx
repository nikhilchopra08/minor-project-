'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import RegisterForm from '@/components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <Provider store={store}>
      <RegisterForm />
    </Provider>
  );
};

export default RegisterPage;