'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import LoginForm from '@/components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <Provider store={store}>
      <LoginForm />
    </Provider>
  );
};

export default LoginPage;