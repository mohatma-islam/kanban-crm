import { useEffect, useState } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom'; // No longer needed for modal
import { useNavigate } from 'react-router-dom'; // Still used for fallback navigation if needed, or can be removed if entirely modal
import { SparklesIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useCustomerStore from '../../store/customerStore';
import type { Customer } from '../../types';
import ConfirmationDialog from '../common/ConfirmationDialog';


interface CustomerDetailModalProps {
  customerId: number;
  mode: 'view' | 'edit';
  onClose: () => void;
}

const CustomerDetail = ({ customerId, mode, onClose }: CustomerDetailModalProps) => {
  // const { id } = useParams<{ id: string }>(); // Replaced by customerId prop
  const navigate = useNavigate(); // Keep for now, might be useful for fallback or removed later
  // const location = useLocation(); // Replaced by mode prop

  const { currentCustomer, fetchCustomer, updateCustomer, deleteCustomer, isLoading, error } = useCustomerStore();

  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchCustomer(Number(customerId));
    }
  }, [customerId, fetchCustomer]);

  // useEffect(() => { // No longer needed, mode comes from prop
  //   setIsEditing(location.pathname.endsWith('/edit'));
  // }, [location.pathname]);

  useEffect(() => {
    setIsEditing(mode === 'edit'); // Set editing based on prop
  }, [mode]);


  useEffect(() => {
    if (currentCustomer && currentCustomer.id === customerId) { // Ensure formData is for the correct customer
      setFormData({
        name: currentCustomer.name,
        email: currentCustomer.email,
        phone: currentCustomer.phone,
        address: currentCustomer.address,
        company: currentCustomer.company,
        notes: currentCustomer.notes,
        social_profiles: currentCustomer.social_profiles,
      });
    } else {
      // If currentCustomer is not the one we want (e.g., from a previous modal view),
      // clear formData or set to default. Or rely on fetchCustomer to update currentCustomer
      // which will trigger this effect again.
      setFormData({}); 
    }
  }, [currentCustomer, customerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToUpdate: { [key: string]: any } = {};
    for (const key in formData) {
      if (formData[key as keyof Partial<Customer>] !== null) {
        dataToUpdate[key] = formData[key as keyof Partial<Customer>];
      }
    }
    await updateCustomer(Number(customerId), dataToUpdate as any); // `as any` for now, ensure store types align
    // navigate(`/customers/${customerId}`); // Old navigation
    onClose(); // Close modal and trigger refresh in parent
  };

  const handleDelete = async () => {
    await deleteCustomer(Number(customerId));
    // navigate('/customers'); // Old navigation
    onClose(); // Close modal and trigger refresh in parent
  };
  
  const handleCancel = () => {
    if (mode === 'edit') {
        // If editing, and want to switch to view mode within the modal without closing:
        // setIsEditing(false); 
        // fetchCustomer(Number(customerId)); // to revert changes if any
        // For now, cancel just closes the modal or reverts to non-edit view if it was an edit mode modal
        onClose(); // Simplest: cancel closes modal
    } else {
        onClose();
    }
  }

  if (isLoading && (!currentCustomer || currentCustomer.id !== customerId) ) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <SparklesIcon className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 mt-4 font-medium">Loading customer details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error loading customer</h3>
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }
  
  // Ensure we have the *correct* customer before rendering details, especially if currentCustomer might be stale
  if (!currentCustomer || currentCustomer.id !== customerId) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="h-8 w-8 text-slate-500" />
          </div>
          <p className="text-slate-600 font-medium">Fetching customer...</p>
        </div>
      </div>
    );
  }

  return (
    // Removed max-w-2xl mx-auto as modal handles sizing
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-[500px]">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              Edit Customer: {currentCustomer.name}
            </h1>
            <p className="text-slate-600 mt-2">Update customer information and contact details</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
              <input 
                type="text" 
                name="name" 
                id="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium" 
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                value={formData.email || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium" 
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
              <input 
                type="text" 
                name="phone" 
                id="phone" 
                value={formData.phone || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium" 
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
              <input 
                type="text" 
                name="company" 
                id="company" 
                value={formData.company || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium" 
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
            <textarea 
              name="address" 
              id="address" 
              value={formData.address || ''} 
              onChange={handleChange} 
              rows={3} 
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium resize-none"
            />
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
            <textarea 
              name="notes" 
              id="notes" 
              value={formData.notes || ''} 
              onChange={handleChange} 
              rows={4} 
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium resize-none"
            />
          </div>
          
          <div>
            <label htmlFor="social_profiles" className="block text-sm font-semibold text-slate-700 mb-2">Social Profiles (JSON)</label>
            <textarea 
              name="social_profiles" 
              id="social_profiles" 
              value={formData.social_profiles || ''} 
              onChange={handleChange} 
              rows={3} 
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium font-mono text-sm resize-none"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <button 
              type="button" 
              onClick={handleCancel} 
              className="px-6 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              Save Customer
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {currentCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                  {currentCustomer.name}
                </h1>
                {currentCustomer.company && (
                  <p className="text-lg text-slate-600 font-medium">{currentCustomer.company}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Edit
              </button>
              <button 
                onClick={() => setConfirmDelete(true)} 
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentCustomer.email && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Email</div>
                <a 
                  href={`mailto:${currentCustomer.email}`} 
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                >
                  {currentCustomer.email}
                </a>
              </div>
            )}
            
            {currentCustomer.phone && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Phone</div>
                <div className="text-slate-900 font-medium">{currentCustomer.phone}</div>
              </div>
            )}
          </div>

          {currentCustomer.address && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Address</div>
              <div className="text-slate-900 font-medium">{currentCustomer.address}</div>
            </div>
          )}

          {currentCustomer.notes && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Notes</div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 whitespace-pre-wrap text-sm text-slate-700 font-medium leading-relaxed">
                {currentCustomer.notes}
              </div>
            </div>
          )}

          {currentCustomer.social_profiles && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Social Profiles</div>
              <pre className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 text-sm text-slate-700 font-mono overflow-x-auto">
                {currentCustomer.social_profiles}
              </pre>
            </div>
          )}

          <div className="pt-6 border-t border-slate-200">
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={confirmDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmButtonText="Delete Customer"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        type="danger"
      />
    </div>
  );
};

export default CustomerDetail;