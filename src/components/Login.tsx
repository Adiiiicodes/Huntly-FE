'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock } from 'lucide-react';
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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to callback URL if provided, otherwise to dashboard
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  const handleLogin = async (e: React.FormEvent) => {
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
      
      // Use the login service with name instead of email
      const response = await login({ name, password });

      console.log('Login response:', response);

      if (response.token && response.user) {
        console.log('Login successful, saving auth state...');
        
        // Call authLogin with token and user
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

  // For easier testing in development environment
  const handleTestLogin = () => {
    // Create a mock successful response
    const mockUser = {
      id: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com'
    };
    
    const mockToken = 'test-jwt-token-123';
    
    console.log('Setting test user with mock data:', { user: mockUser });
    
    // Call the auth context login function directly
    authLogin(mockToken, mockUser);
    
    toast({
      variant: "default",
      title: "Test Login Successful!",
      description: "You are now logged in as a test user.",
    });
    
    router.push(callbackUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login to HuntLy</CardTitle>
          <CardDescription>
            {callbackUrl !== '/dashboard' 
              ? 'Authentication required to access this page' 
              : 'Access your personalized dashboard'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center border rounded px-3 py-2 gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full outline-none bg-transparent text-sm"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center border rounded px-3 py-2 gap-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none bg-transparent text-sm"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 text-bold text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            {process.env.NODE_ENV !== 'production' && (
              <Button 
                type="button"
                variant="outline"
                onClick={handleTestLogin}
                className="w-full mt-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                Test Login (Dev Mode)
              </Button>
            )}

            <div className="text-center text-sm text-gray-600 mt-4">
              Don&apos;t have an account?{' '}
              <Link
                href="/signin"
                className="text-black font-medium hover:underline"
              >
                Sign up now
              </Link>
            </div>

            {/* Optional: Add forgot password link */}
            <div className="text-center text-xs text-gray-500">
              <button
                onClick={() => router.push('/forgot-password')}
                className="text-gray-600 hover:underline"
                type="button"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Main component with Suspense
const Login = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginWithParams />
    </Suspense>
  );
};

export default Login;