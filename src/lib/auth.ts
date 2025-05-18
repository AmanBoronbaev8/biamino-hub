
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { User } from './types';

// Демо-аккаунты для разработки
const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'admin', id: '8f7b5db8-5a5e-4a1c-9dd3-bc2c3e70827a' },
  { username: 'user', password: 'user', role: 'user', id: '3e7c9d6a-1b4f-4d8e-9c2a-6f5b7e8d9a0b' }
];

// Функция для обеспечения наличия всех демо-аккаунтов в базе данных
const ensureDemoAccountsExist = async (): Promise<void> => {
  console.log('Checking and creating demo accounts if needed...');
  
  for (const account of DEMO_ACCOUNTS) {
    // Проверяем существует ли пользователь в базе
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('username', account.username)
      .maybeSingle();
    
    if (!existingUser) {
      console.log(`Creating demo account: ${account.username}`);
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
      
      if (error) {
        console.error(`Ошибка при создании демо-аккаунта ${account.username}:`, error);
      } else {
        console.log(`Демо-аккаунт ${account.username} создан успешно`);
      }
    } else {
      console.log(`Demo account ${account.username} already exists`);
    }
  }
};

// Вызываем функцию при загрузке модуля
ensureDemoAccountsExist().catch(e => console.error('Ошибка при инициализации демо-аккаунтов:', e));

export const authenticate = async (username: string, password: string): Promise<User | null> => {
  // В реальном проекте здесь должна быть аутентификация через Supabase Auth
  // Для демо используем прямую проверку
  const account = DEMO_ACCOUNTS.find(a => a.username === username && a.password === password);
  
  if (account) {
    try {
      // Проверяем существует ли пользователь в базе
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('username', account.username)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Ошибка при поиске пользователя:", fetchError);
        return null;
      }
      
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
