import { create } from 'zustand';
import type { AuthState, LoginCredentials, RegisterData } from '../types/index';
import * as api from '../services/api';

const useAuthStore = create<AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
}>((set) => {
  // Initialize state from localStorage if available
  const token = localStorage.getItem('token');
  
  return {
    user: null,
    token,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
    
    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.login(credentials.email, credentials.password);
        const { user, token } = response.data;
        
        localStorage.setItem('token', token);
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error.response?.data?.message || 'Login failed',
          isAuthenticated: false,
        });
      }
    },
    
    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.register(
          data.name,
          data.email,
          data.password,
          data.password_confirmation
        );
        const { user, token } = response.data;
        
        localStorage.setItem('token', token);
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error.response?.data?.message || 'Registration failed',
          isAuthenticated: false,
        });
      }
    },
    
    logout: async () => {
      set({ isLoading: true });
      try {
        await api.logout();
        localStorage.removeItem('token');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error.response?.data?.message || 'Logout failed',
        });
      }
    },
    
    getCurrentUser: async () => {
      if (!localStorage.getItem('token')) {
        return;
      }
      
      set({ isLoading: true });
      try {
        const response = await api.getCurrentUser();
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.response?.data?.message || 'Failed to fetch user data',
        });
      }
    },
    
    clearError: () => set({ error: null }),
  };
});

export default useAuthStore; 