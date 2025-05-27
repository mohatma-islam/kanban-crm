import { useEffect, useState } from "react";

import useCustomerStore from "../../store/customerStore";
import { EyeIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon, UserIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import CustomerDetail from "./CustomerDetail";
import CustomerForm from "./CustomerForm";
import { Pagination, ConfirmationDialog } from '../common';

interface Customer {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
}

const CustomerList = () => {
  const { customers, fetchCustomers, deleteCustomer } = useCustomerStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSort = (key: keyof Customer) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    // Handle null or undefined values for sorting: treat them as less than actual values
    if (valA == null && valB == null) return 0;
    if (valA == null) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (valB == null) return sortConfig.direction === 'ascending' ? 1 : -1;

    if (valA < valB) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (valA > valB) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastCustomer = currentPage * itemsPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - itemsPerPage;
  const currentCustomers = sortedCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleViewCustomer = (id: number) => {
    setSelectedCustomerId(id);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditCustomer = (id: number) => {
    const customer = customers.find(c => c.id === id);
    if (customer) {
      setEditingCustomer(customer);
      setShowCustomerForm(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomerId(null);
    setModalMode(null);
    fetchCustomers();
  };

  const handleCreateNew = () => {
    setEditingCustomer(null);
    setShowCustomerForm(true);
  };

  const handleCloseCustomerForm = () => {
    setShowCustomerForm(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomerToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCustomer = async () => {
    if (customerToDelete) {
      try {
        await deleteCustomer(customerToDelete);
        setShowDeleteDialog(false);
        setCustomerToDelete(null);
        fetchCustomers();
      } catch (error) {
        console.error('Failed to delete customer:', error);
        setShowDeleteDialog(false);
        setCustomerToDelete(null);
      }
    }
  };

  const cancelDeleteCustomer = () => {
    setShowDeleteDialog(false);
    setCustomerToDelete(null);
  };

  const getSortIndicator = (key: keyof Customer) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            Customers
          </h1>
          <p className="text-slate-600 mt-1">Manage your customer relationships</p>
        </div>
        
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Modern Search Bar */}
      <div className="bg-white/70 backdrop-blur-sm shadow-sm rounded-2xl border border-slate-200/60 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search customers by name, email, phone, or company..."
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

      {/* Modern Table */}
      <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-slate-200/60">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name{getSortIndicator('name')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Email{getSortIndicator('email')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Phone{getSortIndicator('phone')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Company{getSortIndicator('company')}</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium shadow-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{customer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {customer.email || <span className="text-slate-400 italic">No email</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {customer.phone || <span className="text-slate-400 italic">No phone</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {customer.company || <span className="text-slate-400 italic">No company</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleViewCustomer(customer.id)} 
                          className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                          tabIndex={0} 
                          title="View customer"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditCustomer(customer.id)} 
                          className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                          tabIndex={0} 
                          title="Edit customer"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(customer.id)} 
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          tabIndex={0} 
                          title="Delete customer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="h-8 w-8 text-indigo-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {searchTerm ? 'No customers found' : 'No customers yet'}
                      </h3>
                      <p className="text-slate-600 mb-6">
                        {searchTerm ? 
                          `No customers found matching "${searchTerm}". Try a different search term.` : 
                          "Add your first customer to get started!"
                        }
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={handleCreateNew}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <UserPlusIcon className="h-5 w-5 mr-2" />
                          Add First Customer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Modern Pagination */}
        {(totalPages > 1 || filteredCustomers.length > 5) && (
          <div className="p-6 border-t border-slate-200/60">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCustomers.length}
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
      </div>

      {/* Modern Modal */}
      {isModalOpen && selectedCustomerId && modalMode && (
        <div className="fixed inset-0 bg-slate-600/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="relative mx-auto border border-slate-200 w-full max-w-3xl shadow-2xl rounded-2xl bg-white">
            <CustomerDetail 
              customerId={selectedCustomerId} 
              mode={modalMode} 
              onClose={closeModal} 
            />
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={handleCloseCustomerForm}
          onSuccess={handleCloseCustomerForm}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmButtonText="Delete Customer"
        onConfirm={confirmDeleteCustomer}
        onCancel={cancelDeleteCustomer}
      />
    </div>
  );
};

export default CustomerList;