
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';

// Демо-аккаунты для разработки
const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'admin', id: '8f7b5db8-5a5e-4a1c-9dd3-bc2c3e70827a', email: 'admin@example.com' },
  { username: 'user', password: 'user', role: 'user', id: '3e7c9d6a-1b4f-4d8e-9c2a-6f5b7e8d9a0b', email: 'user@example.com' }
];

// Аутентификация с использованием локального хранилища (без Supabase Auth)
export const authenticate = async (username: string, password: string): Promise<User | null> => {
  console.log(`Attempting to authenticate user: ${username}`);
  
  // Проверяем логин и пароль среди демо-аккаунтов
  const account = DEMO_ACCOUNTS.find(a => a.username === username && a.password === password);
  
  if (account) {
    console.log(`Authentication successful for user: ${username} with role: ${account.role}`);
    
    try {
      // Проверяем запись в таблице users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', account.id)
        .maybeSingle();
        
      if (userError || !userData) {
        // Добавляем пользователя в таблицу users
        const { error: insertError } = await supabase
          .from('users')
          .upsert({ 
            id: account.id,
            username: account.username,
            role: account.role 
          });
          
        if (insertError) {
          console.error('Failed to insert user data:', insertError.message);
          // Продолжаем работу даже при ошибке
        }
      }

      // Возвращаем данные пользователя
      return {
        id: account.id,
        username: account.username,
        role: account.role as 'admin' | 'user'
      };
    } catch (error) {
      console.error('Error during authentication:', error);
      // Возвращаем данные демо-аккаунта для продолжения работы
      return {
        id: account.id,
        username: account.username,
        role: account.role as 'admin' | 'user'
      };
    }
  }
  
  console.log(`Authentication failed for user: ${username}`);
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

export const removeUserFromStorage = async (): Promise<void> => {
  localStorage.removeItem('user');
};
