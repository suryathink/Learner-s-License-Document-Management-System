import React from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from './hooks';
import { useAuth } from './contexts/AuthContext';
import { Input, Button, Card, CardBody } from '@/components/ui';
import { LoginFormData } from './types';
import { Lock, User, Shield } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, isAuthenticated, loading } = useAuth();

  const initialValues: LoginFormData = {
    username: '',
    password: '',
  };

  const validateForm = (values: LoginFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!values.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const { values, errors, touched, isSubmitting, setValue, setFieldTouched, handleSubmit } = useForm(
    initialValues,
    validateForm
  );

  const onSubmit = async (formData: LoginFormData) => {
    await login(formData);
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardBody className="py-8">
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                handleSubmit(onSubmit); 
              }}
              className="space-y-6"
            >
              <Input
                label="Username"
                type="text"
                placeholder="Enter your username"
                value={values.username}
                onChange={(e) => setValue('username', e.target.value)}
                onBlur={() => setFieldTouched('username')}
                error={touched.username ? errors.username : ''}
                required
                leftIcon={<User className="w-4 h-4" />}
                autoComplete="username"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={values.password}
                onChange={(e) => setValue('password', e.target.value)}
                onBlur={() => setFieldTouched('password')}
                error={touched.password ? errors.password : ''}
                required
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                Sign In
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Learner's License Management System
          </p>
        </div>
      </div>
    </div>
  );
};