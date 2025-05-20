
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
    const loadUser = async () => {
      try {
        const storedUser = getUserFromStorage();
        
        if (storedUser) {
          // Проверяем сессию в Supabase
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            console.log('Supabase session found, using stored user:', storedUser);
            setUser(storedUser);
          } else {
            console.log('No Supabase session, but stored user found. Using local data for demo.');
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Error loading user session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Функция входа в систему
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await authenticate(username, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        saveUserToStorage(authenticatedUser);
        toast.success(`Добро пожаловать, ${authenticatedUser.username}!`);
        return true;
      } else {
        toast.error('Неверные учетные данные. Пожалуйста, проверьте логин и пароль.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Произошла ошибка при входе в систему.');
      return false;
    }
  };

  // Функция выхода из системы
  const logout = async (): Promise<void> => {
    try {
      await removeUserFromStorage();
      setUser(null);
      toast.success('Вы вышли из системы');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Произошла ошибка при выходе из системы.');
    }
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
