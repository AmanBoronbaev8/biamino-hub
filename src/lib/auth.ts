
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';

// Демо-аккаунты для разработки
const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'admin', id: '8f7b5db8-5a5e-4a1c-9dd3-bc2c3e70827a', email: 'admin@example.com' },
  { username: 'user', password: 'user', role: 'user', id: '3e7c9d6a-1b4f-4d8e-9c2a-6f5b7e8d9a0b', email: 'user@example.com' }
];

// Аутентификация с проверкой по демо-аккаунтам
export const authenticate = async (username: string, password: string): Promise<User | null> => {
  console.log(`Attempting to authenticate user: ${username}`);
  
  // Проверяем логин и пароль среди демо-аккаунтов
  const account = DEMO_ACCOUNTS.find(a => a.username === username && a.password === password);
  
  if (account) {
    console.log(`Authentication successful for user: ${username} with role: ${account.role}`);
    
    try {
      // Пытаемся войти в Supabase с помощью email/password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (signInError) {
        console.log('Sign-in failed, trying to create user');
        
        // Если пользователь не существует в Supabase, создаем его
        const { error: signUpError } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            data: {
              username: account.username,
              role: account.role
            }
          }
        });

        if (signUpError) {
          console.error('Error creating user:', signUpError.message);
          return null;
        }

        // Пытаемся войти снова после создания
        await supabase.auth.signInWithPassword({
          email: account.email,
          password: account.password
        });
      }

      // Проверяем, существует ли пользователь в нашей таблице users
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select()
        .eq('username', account.username)
        .single();
      
      if (userError || !existingUser) {
        console.log('Creating user in users table');
        // Создаем запись в таблице users с ID из демо-аккаунта
        const { error: insertError } = await supabase.from('users').insert({
          id: account.id,
          username: account.username,
          role: account.role
        });

        if (insertError) {
          console.error('Error inserting user data:', insertError.message);
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
      return null;
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
