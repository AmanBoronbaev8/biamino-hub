
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import { Outlet, Navigate } from 'react-router-dom';

interface LayoutProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  requireAuth = false, 
  requireAdmin = false,
  children 
}) => {
  const { isAuthenticated, isAdmin } = useAuth();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If admin role is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto py-6 px-4">
        {children || <Outlet />}
      </main>
      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Biamino. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
