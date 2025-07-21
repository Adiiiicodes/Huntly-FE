'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, Mail, Eye, EyeOff, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/services/login';
import Link from 'next/link';

// Separate component that uses useSearchParams
const LoginWithParams = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const { login: authLogin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { name, password: '*****' });
      
      const response = await login({ name, password });
      console.log('Login response:', response);

      if (response.token && response.user) {
        console.log('Login successful, saving auth state...');
        
        authLogin(response.token, response.user);
        
        toast({
          variant: "default",
          title: "Login Successful!",
          description: "Welcome back to HuntLy!",
        });
        
        console.log(`Redirecting to ${callbackUrl}...`);
        router.push(callbackUrl);
      } else if (response.message) {
        console.log('Login failed with message:', response.message);
        setError(response.message);
      } else {
        console.log('Login failed with unknown response format');
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = () => {
    const mockUser = {
      id: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com'
    };
    
    const mockToken = 'test-jwt-token-123';
    
    console.log('Setting test user with mock data:', { user: mockUser });
    
    authLogin(mockToken, mockUser);
    
    toast({
      variant: "default",
      title: "Test Login Successful!",
      description: "You are now logged in as a test user.",
    });
    
    router.push(callbackUrl);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 lg:py-12">
        <div className="w-full max-w-md">
          {/* Logo placeholder */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Login to your account
            </h1>
            <p className="text-gray-600 text-sm">
              Welcome back, please enter your details
            </p>
          </div>

          {/* Form */}
          <div onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="name@website.com"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Keep me logged in</span>
              </label>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>

            {/* Test Login Button (Dev Mode) */}
            {process.env.NODE_ENV !== 'production' && (
              <button
                type="button"
                onClick={handleTestLogin}
                className="w-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors duration-200 mt-4"
              >
                Test Login (Dev Mode)
              </button>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button className="flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button className="flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button className="flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </button>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Not registered yet?{' '}
              <Link
                href="/signin"
                className="text-gray-900 font-medium hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              © SquareUI design system All Rights Reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image Placeholder */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-indigo-200/30"></div>
        
        {/* Image Placeholder - Replace this div with your actual image */}
        <div className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div className="w-full h-full max-w-lg max-h-96 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Image Placeholder</p>
              <p className="text-sm opacity-75">Replace with your AI hiring image</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

// Main component with Suspense
const Login = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginWithParams />
    </Suspense>
  );
};

export default Login;