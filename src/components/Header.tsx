'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-black">
            HunTly
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`text-gray-600 hover:text-black transition-colors ${
                pathname === '/' ? 'text-black font-medium' : ''
              }`}
            >
              Home
            </Link>
            <Link
              href="/browse"
              className={`text-gray-600 hover:text-black transition-colors ${
                pathname === '/browse' ? 'text-black font-medium' : ''
              }`}
            >
              Browse All
            </Link>
            <Link
              href="/dashboard"
              className={`text-gray-600 hover:text-black transition-colors ${
                pathname === '/dashboard' ? 'text-black font-medium' : ''
              }`}
            >
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/register">
              <Button variant="secondary" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Register as Candidate</span>
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant='default'>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
