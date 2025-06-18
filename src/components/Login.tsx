'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        authLogin(data.token, data.user);
        toast({
          variant: "default",
          title: "Login Successful!",
          description: "Welcome back to HunTly!",
        });
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login to HunTly</CardTitle>
          <CardDescription>Access your personalized dashboard</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center border rounded px-3 py-2 gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                onChange={e => setPassword(e.target.value)}
                className="w-full outline-none bg-transparent text-sm"
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button 
              type="submit" 
              className="w-full h-11 text-bold text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/signin')}
                className="text-black hover:underline"
                type="button"
              >
                Sign Up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 