
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
      const storedUser = getUserFromStorage();
      
      if (storedUser) {
        // Проверяем сессию в Supabase
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Сессия активна, используем сохраненные данные пользователя
          setUser(storedUser);
        } else {
          // Сессия истекла, нужно повторно войти
          removeUserFromStorage();
          setUser(null);
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
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
      toast.error('Неверные учетные данные. Пожалуйста, проверьте логин и пароль.');
      return false;
    }
  };

  // Функция выхода из системы
  const logout = async (): Promise<void> => {
    setUser(null);
    await removeUserFromStorage();
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
