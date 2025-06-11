'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SignIn = () => {
  const handleGoogleSignIn = useCallback(async () => {
    if (!supabase) {
      alert('Supabase is not configured. Please set up your Supabase environment variables.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error.message);
        alert('Error signing in with Google. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
    }
  }, []);

  const handleGithubSignIn = useCallback(async () => {
    if (!supabase) {
      alert('Supabase is not configured. Please set up your Supabase environment variables.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error('Error signing in with GitHub:', error.message);
        alert('Error signing in with GitHub. Please try again.');
      }
    } catch (error: unknown) {
      console.error('GitHub sign-in error:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In to HunTly</CardTitle>
          <CardDescription>Choose your preferred sign-in method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!supabase && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              Supabase is not configured. Please set up your environment variables.
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 h-12 text-white"
            disabled={!supabase}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <Button
            onClick={handleGithubSignIn}
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 h-12 text-white"
            disabled={!supabase}
          >
            <Github className="w-5 h-5" />
            <span>Continue with GitHub</span>
          </Button>

          <div className="text-center text-sm text-gray-600 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
