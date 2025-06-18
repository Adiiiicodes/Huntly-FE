'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const Header: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  
  // Debug authentication state
  useEffect(() => {
    console.log("Header auth state:", { isAuthenticated, user });
  }, [isAuthenticated, user]);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-black">
            HunTly
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
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

          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  <SheetClose asChild>
                    <Link
                      href="/"
                      className={`text-lg px-4 py-2 rounded-lg ${
                        pathname === '/'
                          ? 'bg-gray-100 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      Home
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/browse"
                      className={`text-lg px-4 py-2 rounded-lg ${
                        pathname === '/browse'
                          ? 'bg-gray-100 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      Browse All
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/dashboard"
                      className={`text-lg px-4 py-2 rounded-lg ${
                        pathname === '/dashboard'
                          ? 'bg-gray-100 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      Dashboard
                    </Link>
                  </SheetClose>
                  
                  {/* Show saved candidates link if authenticated */}
                  {isAuthenticated && (
                    <SheetClose asChild>
                      <Link
                        href="/candidates/saved"
                        className={`text-lg px-4 py-2 rounded-lg ${
                          pathname === '/candidates/saved'
                            ? 'bg-gray-100 font-medium'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        Saved Candidates
                      </Link>
                    </SheetClose>
                  )}
                </nav>
                
                {/* Mobile Auth Buttons - Only show if not authenticated */}
                {!isAuthenticated ? (
                  <div className="mt-8 space-y-4">
                    <SheetClose asChild>
                      <Link href="/login" className="block">
                        <Button variant="default" className="w-full">
                          Login
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/register" className="block">
                        <Button
                          variant="secondary"
                          className="w-full flex items-center space-x-2"
                        >
                          <Users className="w-4 h-4" />
                          <span>Register</span>
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                ) : (
                  /* Mobile Profile Section */
                  <div className="mt-8 pt-4 border-t">
                    <SheetClose asChild>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2" 
                        onClick={() => {
                          const { logout } = useAuth();
                          if (logout) logout();
                        }}
                      >
                        Sign Out
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Debug information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400">
                
              </div>
            )}
            
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button variant="default" className="text-sm lg:text-base">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="secondary"
                    className="flex items-center space-x-2 text-sm lg:text-base"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Register as Candidate</span>
                    <span className="sm:hidden">Register</span>
                  </Button>
                </Link>
              </>
            ) : (
              <div className="border-l-2 pl-4 border-gray-200">
                <UserProfile />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;