'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import RegisterForm from '@/components/RegisterForm';
import Navbar from '@/components/Navbar';

const RegisterPage: React.FC = () => {
  return (
    <Provider store={store}>
            <Navbar/>
      <RegisterForm />
    </Provider>
  );
};

export default RegisterPage;