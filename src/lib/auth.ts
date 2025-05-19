
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { User } from './types';

// Демо-аккаунты для разработки
const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'admin', id: '8f7b5db8-5a5e-4a1c-9dd3-bc2c3e70827a' },
  { username: 'user', password: 'user', role: 'user', id: '3e7c9d6a-1b4f-4d8e-9c2a-6f5b7e8d9a0b' }
];

// Простая функция аутентификации для тестирования
export const authenticate = async (username: string, password: string): Promise<User | null> => {
  console.log(`Attempting to authenticate user: ${username}`);
  
  // Проверяем логин и пароль среди демо-аккаунтов
  const account = DEMO_ACCOUNTS.find(a => a.username === username && a.password === password);
  
  if (account) {
    console.log(`Authentication successful for user: ${username} with role: ${account.role}`);
    
    try {
      // Пытаемся войти в Supabase с помощью UUID как идентификатора сессии
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${account.username}@example.com`,
        password: account.password
      });
      
      if (error) {
        console.log('Trying to create user in Supabase');
        // Если пользователь не существует в Supabase, создаем его
        await supabase.auth.admin.createUser({
          email: `${account.username}@example.com`,
          password: account.password,
          email_confirm: true,
          user_metadata: { role: account.role }
        });
        
        // Пытаемся войти снова
        await supabase.auth.signInWithPassword({
          email: `${account.username}@example.com`,
          password: account.password
        });
        
        // Проверяем, существует ли пользователь в нашей таблице users
        const { data: existingUser } = await supabase
          .from('users')
          .select()
          .eq('username', account.username)
          .single();
        
        if (!existingUser) {
          // Создаем запись в таблице users
          await supabase.from('users').insert({
            id: account.id,
            username: account.username,
            role: account.role
          });
        }
      }

      // Возвращаем данные пользователя
      return {
        id: account.id,
        username: account.username,
        role: account.role as 'admin' | 'user'
      };
    } catch (err) {
      console.error('Ошибка при работе с Supabase:', err);
      
      // Возвращаем данные пользователя даже при ошибке Supabase
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
  // Также выходим из Supabase
  await supabase.auth.signOut();
};
