
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Пожалуйста, введите логин и пароль');
      return;
    }

    const success = await login(username, password);
    
    if (!success) {
      setError('Неверные учетные данные');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Вход в Biamino</h1>
          <p className="text-muted-foreground mt-2">
            Введите ваши учетные данные для доступа к Центру Проектов
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
                Логин
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="biamino-input"
                placeholder="Введите ваш логин"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="biamino-input"
                placeholder="Введите ваш пароль"
              />
            </div>
            
            <button type="submit" className="biamino-btn-primary w-full">
              Войти
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
