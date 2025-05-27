import { create } from 'zustand';
import type { User } from '../types/index';
import * as api from '../services/api';

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const useUserStore = create<UserState & {
  fetchUsers: () => Promise<void>;
  getUser: (id: number) => Promise<void>;
  createUser: (data: { name: string; email: string; password: string; password_confirmation: string }) => Promise<void>;
  updateUser: (id: number, data: { name?: string; email?: string; password?: string; password_confirmation?: string }) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  clearError: () => void;
}>((set, get) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getUsers();
      set({ users: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch users',
        isLoading: false,
      });
    }
  },

  getUser: async (id: number) => {
    set({ isLoading: true });
    try {
      const response = await api.getUser(id);
      set({ currentUser: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch user',
        isLoading: false,
      });
    }
  },

  createUser: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.createUser(data);
      const currentUsers = get().users;
      set({ 
        users: [...currentUsers, response.data],
        isLoading: false 
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create user',
        isLoading: false,
      });
    }
  },

  updateUser: async (id: number, data) => {
    set({ isLoading: true });
    try {
      const response = await api.updateUser(id, data);
      const currentUsers = get().users;
      const updatedUsers = currentUsers.map(user => 
        user.id === id ? response.data : user
      );
      set({ 
        users: updatedUsers,
        currentUser: response.data,
        isLoading: false 
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update user',
        isLoading: false,
      });
    }
  },

  deleteUser: async (id: number) => {
    set({ isLoading: true });
    try {
      await api.deleteUser(id);
      const currentUsers = get().users;
      const filteredUsers = currentUsers.filter(user => user.id !== id);
      set({ 
        users: filteredUsers,
        currentUser: null,
        isLoading: false 
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete user',
        isLoading: false,
      });
    }
  },

  setCurrentUser: (user: User | null) => set({ currentUser: user }),
  clearError: () => set({ error: null }),
}));

export default useUserStore; 