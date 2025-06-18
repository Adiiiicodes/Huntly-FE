import '../app/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { Suspense } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...pageProps} />
      </Suspense>
    </AuthProvider>
  );
} 