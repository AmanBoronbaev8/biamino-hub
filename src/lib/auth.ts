
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { User } from './types';

// Demo accounts for development use
const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin', role: 'admin', id: '8f7b5db8-5a5e-4a1c-9dd3-bc2c3e70827a' },
  { username: 'user', password: 'user', role: 'user', id: '3e7c9d6a-1b4f-4d8e-9c2a-6f5b7e8d9a0b' }
];

export const authenticate = async (username: string, password: string): Promise<User | null> => {
  // В реальном проекте здесь должна быть аутентификация через Supabase Auth
  // Для демо используем прямую проверку
  const account = DEMO_ACCOUNTS.find(a => a.username === username && a.password === password);
  
  if (account) {
    try {
      // Проверяем существует ли пользователь в базе
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('username', account.username)
        .single();
      
      if (existingUser) {
        // Если пользователь существует, возвращаем его данные
        return {
          id: existingUser.id,
          username: existingUser.username,
          role: existingUser.role as 'admin' | 'user'
        };
      } else {
        // Если пользователя нет в базе, создаем его
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            id: account.id,
            username: account.username,
            role: account.role
          })
          .select()
          .single();
        
        if (error || !newUser) {
          console.error("Ошибка при создании пользователя:", error);
          return null;
        }
        
        return {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role as 'admin' | 'user'
        };
      }
    } catch (error) {
      console.error("Ошибка при аутентификации:", error);
      return null;
    }
  }
  
  return null;
};

export const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as User;
    } catch (e) {
      console.error('Ошибка при парсинге данных пользователя из localStorage', e);
      return null;
    }
  }
  return null;
};

export const saveUserToStorage = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUserFromStorage = (): void => {
  localStorage.removeItem('user');
};
