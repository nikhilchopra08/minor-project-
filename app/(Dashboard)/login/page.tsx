'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import LoginForm from '@/components/LoginForm';
import Navbar from '@/components/Navbar';

const LoginPage: React.FC = () => {
  return (
    <Provider store={store}>
            <Navbar/>
      
      <LoginForm />
    </Provider>
  );
};

export default LoginPage;