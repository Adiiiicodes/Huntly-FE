'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock } from 'lucide-react';
import { signup } from '@/services/signup';
import { SignupRequest } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SignIn = () => {
  const router = useRouter();
  const { isAuthenticated, login: authLogin } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SignupRequest>({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setIsLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await signup(formData);
      
      if (response.token && response.user) {
        authLogin(response.token, response.user);
        toast({
          variant: "success",
          title: "Sign Up Successful!",
          description: "Welcome to HuntLy! Your account has been created.",
        });
        router.push('/dashboard');
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In to HuntLy</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="flex items-center border rounded px-3 py-2 gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full outline-none bg-transparent text-sm"
                required
                disabled={isLoading || isAuthenticated}
              />
            </div>

            <div className="flex items-center border rounded px-3 py-2 gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full outline-none bg-transparent text-sm"
                required
                disabled={isLoading || isAuthenticated}
              />
            </div>

            <div className="flex items-center border rounded px-3 py-2 gap-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full outline-none bg-transparent text-sm"
                required
                disabled={isLoading || isAuthenticated}
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
              disabled={isLoading || isAuthenticated}
            >
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;