
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ui/ThemeToggle';
import { Menu, X, LogOut, Download, Upload } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();
  const { exportData } = useProjects();
  const [isOpen, setIsOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const { importData } = useProjects();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          setIsImportModalOpen(false);
          setImportFile(null);
        }
      }
    };
    reader.readAsText(importFile);
  };

  return (
    <>
      <header className="border-b sticky top-0 z-30 w-full bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-xl font-heading font-bold flex items-center space-x-2 text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-2xl">🚀</span>
              <span>Biamino</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated && (
                <>
                  <Link to="/" className="text-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                  <Link to="/projects/present" className="text-foreground hover:text-primary transition-colors">
                    Present
                  </Link>
                  <Link to="/projects/future" className="text-foreground hover:text-primary transition-colors">
                    Future
                  </Link>
                </>
              )}
            </div>

            {/* Right side menu */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Data Import/Export */}
                  <button 
                    onClick={exportData}
                    title="Export Data" 
                    className="p-2 rounded-md hover:bg-muted transition-colors text-foreground"
                  >
                    <Download size={18} />
                  </button>
                  
                  <button 
                    onClick={() => setIsImportModalOpen(true)}
                    title="Import Data" 
                    className="p-2 rounded-md hover:bg-muted transition-colors text-foreground"
                  >
                    <Upload size={18} />
                  </button>
                  
                  {/* User info */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {user?.username} {user?.role === 'admin' && '(Admin)'}
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="biamino-btn-outline"
                    >
                      <LogOut size={18} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="biamino-btn-primary">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md text-foreground"
              onClick={toggleMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t p-4">
            <div className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/" 
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/projects/present" 
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Present
                  </Link>
                  <Link 
                    to="/projects/future" 
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Future
                  </Link>
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThemeToggle />
                      <span className="text-sm">
                        {user?.username} {user?.role === 'admin' && '(Admin)'}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={exportData}
                        title="Export Data" 
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <Download size={18} />
                      </button>
                      
                      <button 
                        onClick={() => setIsImportModalOpen(true)}
                        title="Import Data" 
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <Upload size={18} />
                      </button>
                      
                      <button 
                        onClick={handleLogout}
                        className="biamino-btn-outline"
                      >
                        <LogOut size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="biamino-btn-primary block w-full text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-heading mb-4">Import Data</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Warning: This will replace all current data. Make sure to export your current data before importing.
            </p>
            <div className="mb-4">
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileChange}
                className="block w-full text-sm text-foreground file:biamino-btn-outline file:mr-4 file:py-2 file:px-4"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                className="biamino-btn-outline" 
                onClick={() => setIsImportModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="biamino-btn-primary" 
                onClick={handleImport}
                disabled={!importFile}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
