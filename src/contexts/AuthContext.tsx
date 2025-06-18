'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserData, AuthContextType } from '@/types/auth';

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on component mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('Loading auth state from localStorage:', { 
          hasToken: !!storedToken, 
          hasUser: !!storedUser 
        });
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          console.log('Auth state restored successfully');
        } else {
          console.log('No stored auth state found');
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear potentially corrupted storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Log authentication state changes for debugging
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, user: user?.name });
  }, [isAuthenticated, user]);

  // Login: save user data and token
  const login = (newToken: string, newUser: UserData) => {
    console.log('Login called with user:', newUser.name);
    
    try {
      // Update state
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      console.log('Auth state updated and saved to localStorage');
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // Logout: clear user data and token
  const logout = () => {
    console.log('Logout called');
    
    try {
      // Update state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('Auth state cleared');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Show loading state while checking localStorage
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}