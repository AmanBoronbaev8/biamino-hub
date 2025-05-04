
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../lib/types';
import { authenticate, getUserFromStorage, saveUserToStorage, removeUserFromStorage } from '../lib/auth';
import { toast } from 'sonner';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = getUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (username: string, password: string): boolean => {
    const authenticatedUser = authenticate(username, password);
    
    if (authenticatedUser) {
      setUser(authenticatedUser);
      saveUserToStorage(authenticatedUser);
      toast.success(`Welcome, ${authenticatedUser.username}!`);
      return true;
    } else {
      toast.error('Authentication failed. Please check your credentials.');
      return false;
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    removeUserFromStorage();
    toast.success('You have been logged out');
  };

  // Context value
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
