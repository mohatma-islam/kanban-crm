import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import useCustomerStore from '../../store/customerStore';

interface Customer {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  company?: string | null;
  notes?: string | null;
  social_profiles?: string | null;
}

interface CustomerFormProps {
  customer?: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onClose, onSuccess }) => {
  const { createCustomer, updateCustomer, isLoading, error, clearError } = useCustomerStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: '',
    social_profiles: '',
  });

  const isEditing = !!customer;

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        company: customer.company || '',
        notes: customer.notes || '',
        social_profiles: customer.social_profiles || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        notes: '',
        social_profiles: '',
      });
    }
  }, [customer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Client-side validation
    if (!formData.name.trim()) {
      return;
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        company: formData.company.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        social_profiles: formData.social_profiles.trim() || undefined,
      };

      if (isEditing && customer) {
        await updateCustomer(customer.id, submitData);
      } else {
        await createCustomer(submitData);
      }
      
      if (!error) {
        onSuccess();
      }
    } catch (err) {
      // Error handling is done in the store
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-600/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/60">
        {/* Modern Header with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <div className="relative flex justify-between items-center p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <BuildingOfficeIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {isEditing ? 'Edit Customer' : 'Add New Customer'}
                </h2>
                <p className="text-emerald-100 text-sm mt-1">
                  {isEditing ? 'Update customer information' : 'Add a new customer to your CRM'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
                Basic Information
              </h3>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-slate-400"
                required
                placeholder="Enter customer's full name"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-semibold text-slate-700 mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-slate-400"
                placeholder="Enter company name"
              />
            </div>

            {/* Contact Information */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
                Contact Information
              </h3>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-slate-400"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-slate-400"
                placeholder="Enter phone number"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-slate-400"
                placeholder="Enter full address"
              />
            </div>

            {/* Additional Information */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
                Additional Information
              </h3>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="social_profiles" className="block text-sm font-semibold text-slate-700 mb-2">
                Social Profiles
              </label>
              <input
                type="text"
                id="social_profiles"
                name="social_profiles"
                value={formData.social_profiles}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-slate-400"
                placeholder="LinkedIn, Twitter, etc. (comma separated)"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 placeholder-slate-400 resize-none"
                placeholder="Additional notes about the customer..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {isLoading && (
                <div className="relative mr-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <SparklesIcon className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                </div>
              )}
              {isEditing ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm; 