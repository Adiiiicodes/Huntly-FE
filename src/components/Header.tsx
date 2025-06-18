'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();

  const handleBrowseClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to browse candidates.",
      });
      router.push('/login');
    }
  };

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
              onClick={handleBrowseClick}
              className={`text-gray-600 hover:text-black transition-colors ${
                pathname === '/browse' ? 'text-black font-medium' : ''
              }`}
            >
              Browse All
            </Link>
            <Link
              href="/search"
              className={`text-gray-600 hover:text-black transition-colors ${
                pathname === '/search' ? 'text-black font-medium' : ''
              }`}
            >
              Search
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`text-gray-600 hover:text-black transition-colors ${
                  pathname === '/dashboard' ? 'text-black font-medium' : ''
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/register">
              <Button variant="secondary" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Register as Candidate</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name}
                </span>
                <Button 
                  variant="outline" 
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="default">Sign In</Button>
                </Link>
                <Link href="/login">
                  <Button variant="default" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
