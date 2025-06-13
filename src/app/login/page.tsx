'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { login } from '@/services/login';
import { LogIn } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Page = () => {
  const router = useRouter();
  const { isAuthenticated, login: authLogin } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Redirect if already logged in
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setError('');

    try {
      const response = await login({ email, password });
      
      if (response.token && response.user) {
        authLogin(response.token, response.user);
        toast({
          variant: "success",
          title: "Login Successful!",
          description: "Welcome back to HunTly!",
        });
        router.push('/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password.');
    }
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

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
                disabled={isAuthenticated}
              />
            </div>

            <div className="flex items-center border rounded px-3 py-2 gap-2 relative">
              <Lock className="w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full outline-none bg-transparent text-sm"
                disabled={isAuthenticated}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  disabled={isAuthenticated}
                />
                Remember me
              </label>
              <a href="#" className="text-black hover:underline">
                Forgot password?
              </a>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button 
              type="submit" 
              className="w-full h-11 text-bold text-white"
              disabled={isAuthenticated}
            >
              {isAuthenticated ? 'Logged In' : 'Login'}
            </Button>

            <div className="text-center text-xs text-gray-500 mt-4">
              Don&#39;t have an account? <a className="text-black hover:underline" href="/signin">Sign Up</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
