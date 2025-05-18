
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../lib/types';
import { authenticate, getUserFromStorage, saveUserToStorage, removeUserFromStorage } from '../lib/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Компонент-провайдер
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка пользователя из localStorage при начальной загрузке
  useEffect(() => {
    const storedUser = getUserFromStorage();
    if (storedUser) {
      // Проверяем существование пользователя в Supabase
      supabase
        .from('users')
        .select('*')
        .eq('id', storedUser.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            console.error('Ошибка при проверке пользователя в БД:', error);
            removeUserFromStorage();
            setUser(null);
          } else {
            setUser(storedUser);
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Функция входа в систему
  const login = async (username: string, password: string): Promise<boolean> => {
    const authenticatedUser = await authenticate(username, password);
    
    if (authenticatedUser) {
      setUser(authenticatedUser);
      saveUserToStorage(authenticatedUser);
      toast.success(`Добро пожаловать, ${authenticatedUser.username}!`);
      return true;
    } else {
      toast.error('Аутентификация не удалась. Пожалуйста, проверьте ваши учетные данные.');
      return false;
    }
  };

  // Функция выхода из системы
  const logout = (): void => {
    setUser(null);
    removeUserFromStorage();
    toast.success('Вы вышли из системы');
  };

  // Значение контекста
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста аутентификации
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};
