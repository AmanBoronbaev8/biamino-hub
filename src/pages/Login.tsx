
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    const success = login(username, password);
    
    if (!success) {
      setError('Invalid credentials');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Login to Biamino</h1>
          <p className="text-muted-foreground mt-2">
            Enter your credentials to access the Project Hub
          </p>
        </div>

        <div className="biamino-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="biamino-input"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="biamino-input"
                placeholder="Enter your password"
              />
            </div>
            
            <button type="submit" className="biamino-btn-primary w-full">
              Login
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p className="mb-1"><strong>Demo credentials:</strong></p>
          <p>User: username <strong>user</strong>, password <strong>user123</strong></p>
          <p>Admin: username <strong>admin</strong>, password <strong>admin123</strong></p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
