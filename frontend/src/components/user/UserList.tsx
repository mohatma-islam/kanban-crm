import React, { useEffect, useState, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon, TrashIcon, UserPlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import useUserStore from '../../store/userStore';
import type { User } from '../../types/index';
import UserForm from './UserForm';
import { Pagination, ConfirmationDialog } from '../common';

const UserList: React.FC = () => {
  const { 
    users, 
    isLoading, 
    error, 
    fetchUsers, 
    deleteUser, 
    setCurrentUser,
    clearError 
  } = useUserStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  // Search, sorting and pagination logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortField, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getSortIcon = (field: keyof User) => {
    if (field !== sortField) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-slate-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 text-indigo-500" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 text-indigo-500" />
    );
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setCurrentUser(user);
    setShowForm(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setCurrentUser(null);
    clearError();
  };

  const handleCreateNew = () => {
    setEditingUser(null);
    setCurrentUser(null);
    setShowForm(true);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <SparklesIcon className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 mt-4 font-medium">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            Team Members
          </h1>
          <p className="text-slate-600 mt-1">Manage your team and user access</p>
        </div>
        
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Team Member
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
              {error}
            </div>
            <button
              onClick={clearError}
              className="text-red-800 hover:text-red-900 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modern Search Bar */}
      <div className="bg-white/70 backdrop-blur-sm shadow-sm rounded-2xl border border-slate-200/60 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
            >
              <XMarkIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl border border-slate-200/60 overflow-hidden">
        {sortedUsers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlusIcon className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchTerm ? 'No users found' : 'No team members yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm ? 
                  `No users found matching "${searchTerm}". Try a different search term.` : 
                  "Add your first team member to get started with collaboration."
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Add First Team Member
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-2 hover:text-slate-800 transition-colors"
                      >
                        <span>Name</span>
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center space-x-2 hover:text-slate-800 transition-colors"
                      >
                        <span>Email</span>
                        {getSortIcon('email')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center space-x-2 hover:text-slate-800 transition-colors"
                      >
                        <span>Joined</span>
                        {getSortIcon('created_at')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(user)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200"
                            title="Edit user"
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                            title="Delete user"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {(totalPages > 1 || sortedUsers.length > 5) && (
              <div className="p-6 border-t border-slate-200/60">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedUsers.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                  }}
                  showItemsPerPage={true}
                />
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={handleCloseForm}
          onSuccess={handleCloseForm}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Remove Team Member"
        message={`Are you sure you want to remove "${userToDelete?.name}" from your team? This action cannot be undone.`}
        confirmButtonText={isLoading ? 'Removing...' : 'Remove Member'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default UserList; 