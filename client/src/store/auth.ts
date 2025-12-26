import { create } from 'zustand';
import axios from 'axios';
import api from '../api/axios';

interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  setAuth: (user: User, token: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: false,
  error: null,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, error: null });
  },
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, loading: false });
      return true;
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || 'Authentication failed'
        : 'Authentication failed';
      set({ 
        error: errorMessage, 
        loading: false 
      });
      return false;
    }
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, error: null });
  },
}));