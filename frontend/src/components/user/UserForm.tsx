import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, XMarkIcon, UserPlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import useUserStore from '../../store/userStore';
import type { User } from '../../types/index';

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
  const { createUser, updateUser, isLoading, error, clearError } = useUserStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }

    if (!isEditing && (!formData.password || formData.password !== formData.password_confirmation)) {
      return;
    }

    if (isEditing && formData.password && formData.password !== formData.password_confirmation) {
      return;
    }

    try {
      if (isEditing && user) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
          updateData.password_confirmation = formData.password_confirmation;
        }
        
        await updateUser(user.id, updateData);
      } else {
        await createUser(formData);
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
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200/60">
        {/* Modern Header with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <div className="relative flex justify-between items-center p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <UserPlusIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {isEditing ? 'Edit Team Member' : 'Add Team Member'}
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  {isEditing ? 'Update member information' : 'Add a new member to your team'}
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

          <div className="space-y-6">
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
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
                required
                placeholder="Enter team member's full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
                required
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password {!isEditing && '*'}
                {isEditing && <span className="text-slate-500 text-xs font-normal ml-2">(leave blank to keep current password)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
                  required={!isEditing}
                  placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {(formData.password || !isEditing) && (
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
                  required={!isEditing || !!formData.password}
                  placeholder="Confirm password"
                />
                {formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></div>
                    Passwords do not match
                  </p>
                )}
              </div>
            )}
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
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading && (
                <div className="relative mr-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <SparklesIcon className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                </div>
              )}
              {isEditing ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm; 