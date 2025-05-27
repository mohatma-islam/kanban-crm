import { create } from 'zustand';
import type { CustomerState } from '../types/index';
import * as api from '../services/api';

const useCustomerStore = create<CustomerState & {
  fetchCustomers: () => Promise<void>;
  fetchCustomer: (id: number) => Promise<void>;
  createCustomer: (data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    company?: string;
    notes?: string;
    social_profiles?: string;
  }) => Promise<void>;
  updateCustomer: (id: number, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    company?: string;
    notes?: string;
    social_profiles?: string;
  }) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  clearCurrentCustomer: () => void;
  clearError: () => void;
}>((set) => ({
  customers: [],
  currentCustomer: null,
  isLoading: false,
  error: null,
  
  fetchCustomers: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getCustomers();
      set({ customers: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch customers',
        isLoading: false,
      });
    }
  },
  
  fetchCustomer: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.getCustomer(id);
      set({ currentCustomer: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch customer',
        isLoading: false,
      });
    }
  },
  
  createCustomer: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.createCustomer(data);
      set((state) => ({
        customers: [...state.customers, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create customer',
        isLoading: false,
      });
    }
  },
  
  updateCustomer: async (id, data) => {
    set({ isLoading: true });
    try {
      const response = await api.updateCustomer(id, data);
      set((state) => ({
        customers: state.customers.map((customer) => 
          customer.id === id ? response.data : customer
        ),
        currentCustomer: state.currentCustomer?.id === id ? response.data : state.currentCustomer,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update customer',
        isLoading: false,
      });
    }
  },
  
  deleteCustomer: async (id) => {
    set({ isLoading: true });
    try {
      await api.deleteCustomer(id);
      set((state) => ({
        customers: state.customers.filter((customer) => customer.id !== id),
        currentCustomer: state.currentCustomer?.id === id ? null : state.currentCustomer,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete customer',
        isLoading: false,
      });
    }
  },
  
  clearCurrentCustomer: () => set({ currentCustomer: null }),
  
  clearError: () => set({ error: null }),
}));

export default useCustomerStore; 