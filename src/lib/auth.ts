
import { User } from './types';
import { v4 as uuidv4 } from 'uuid';

// Credentials (in real app, these would be stored securely on a server)
const CREDENTIALS = {
  user: { username: 'user', password: 'user123' },
  admin: { username: 'admin', password: 'admin123' }
};

export const authenticate = (username: string, password: string): User | null => {
  // Check for admin credentials
  if (username.toLowerCase() === CREDENTIALS.admin.username && 
      password === CREDENTIALS.admin.password) {
    return { id: 'admin-' + uuidv4(), username: 'Administrator', role: 'admin' };
  }
  
  // Check for user credentials
  if (username.toLowerCase() === CREDENTIALS.user.username && 
      password === CREDENTIALS.user.password) {
    return { id: 'user-' + uuidv4(), username: 'User', role: 'user' };
  }
  
  // Authentication failed
  return null;
};

export const saveUserToStorage = (user: User): void => {
  localStorage.setItem('biamino-user', JSON.stringify(user));
};

export const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('biamino-user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      return null;
    }
  }
  return null;
};

export const removeUserFromStorage = (): void => {
  localStorage.removeItem('biamino-user');
};
