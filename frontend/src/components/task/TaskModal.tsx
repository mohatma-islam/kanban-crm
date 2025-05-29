import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon, 
  CheckIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChatBubbleOvalLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import useTaskStore from '../../store/taskStore';
import useCustomerStore from '../../store/customerStore';
import useUserStore from '../../store/userStore';
import useAuthStore from '../../store/authStore';
import { ConfirmationDialog } from '../common';
import Select from 'react-select';

interface TaskModalProps {
  taskId: number;
  onClose: () => void;
  initialEditMode?: boolean;
}

interface TaskUpdateData {
  title: string;
  description: string;
  customer_id: string;
  user_id: string;
  due_date: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const TaskModal = ({ taskId, onClose, initialEditMode = false }: TaskModalProps) => {
  const { currentTask, fetchTask, updateTask, deleteTask, addComment, updateComment, deleteComment, isLoading, error } = useTaskStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { users, fetchUsers } = useUserStore();
  const { user } = useAuthStore();
  
  const [editing, setEditing] = useState(initialEditMode);
  const [newComment, setNewComment] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [confirmDeleteComment, setConfirmDeleteComment] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<TaskUpdateData>();
  
  // Prepare options for react-select
  const userOptions: SelectOption[] = [
    { value: '', label: 'Unassigned' },
    ...users.map(user => ({ value: user.id.toString(), label: user.name }))
  ];
  
  const customerOptions: SelectOption[] = [
    { value: '', label: 'None' },
    ...customers.map(customer => ({ value: customer.id.toString(), label: customer.name }))
  ];
  
  // Custom styles for react-select
  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '48px',
      border: '1px solid rgb(203 213 225)',
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(4px)',
      '&:hover': {
        borderColor: 'rgb(203 213 225)',
      },
      '&:focus-within': {
        borderColor: 'rgb(99 102 241)',
        boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '12px',
      border: '1px solid rgb(226 232 240)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgb(243 244 246)' : 'white',
      color: 'rgb(15 23 42)',
      '&:hover': {
        backgroundColor: 'rgb(243 244 246)',
      },
    }),
  };

  useEffect(() => {
    fetchTask(taskId);
    fetchCustomers();
    fetchUsers();
  }, [taskId, fetchTask, fetchCustomers, fetchUsers]);
  
  useEffect(() => {
    if (currentTask) {
      reset({
        title: currentTask.title,
        description: currentTask.description || '',
        customer_id: currentTask.customer_id?.toString() || '',
        user_id: currentTask.user_id?.toString() || '',
        due_date: currentTask.due_date ? new Date(currentTask.due_date).toISOString().split('T')[0] : '',
      });
    }
  }, [currentTask, reset]);
  
  const handleUpdateTask = async (data: TaskUpdateData) => {
    if (!currentTask) return;
    
    await updateTask(currentTask.id, {
      title: data.title,
      description: data.description || undefined,
      customer_id: data.customer_id ? parseInt(data.customer_id) : null,
      user_id: data.user_id ? parseInt(data.user_id) : null,
      due_date: data.due_date || null,
    });
    
    setEditing(false);
  };
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;
    
    if (newComment.trim()) {
      await addComment(currentTask.id, newComment.trim());
      setNewComment('');
    }
  };
  
  const handleDeleteTask = async () => {
    if (!currentTask) return;
    
    await deleteTask(currentTask.id);
    onClose();
  };
  
  // Handler functions for comment editing and deleting
  const handleEditComment = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditingCommentContent(content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleSaveComment = async (commentId: number) => {
    if (!currentTask || !editingCommentContent.trim()) return;
    
    await updateComment(currentTask.id, commentId, editingCommentContent.trim());
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleDeleteCommentClick = (commentId: number) => {
    setCommentToDelete(commentId);
    setConfirmDeleteComment(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!currentTask || !commentToDelete) return;
    
    await deleteComment(currentTask.id, commentToDelete);
    setConfirmDeleteComment(false);
    setCommentToDelete(null);
  };
  
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  if (isLoading && !currentTask) {
    return (
      <div className="fixed inset-0 bg-slate-600/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-slate-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading task...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentTask) {
    return (
      <div className="fixed inset-0 bg-slate-600/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-slate-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Task Not Found</h3>
            <p className="text-slate-600 mb-6">The task you're looking for doesn't exist or has been deleted.</p>
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-medium rounded-xl hover:from-slate-600 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              tabIndex={0}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-slate-600/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200/60">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              Task Details
            </h2>
            <p className="text-slate-600 mt-1">Manage and track task progress</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setEditing(true)}
              className="p-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all duration-200"
              tabIndex={0}
              aria-label="Edit task"
              title="Edit task"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setConfirmDelete(true)}
              className="p-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
              tabIndex={0}
              aria-label="Delete task"
              title="Delete task"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-200"
              tabIndex={0}
              aria-label="Close"
              title="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6 shadow-sm">
            <div className="flex items-center">
              <XMarkIcon className="h-5 w-5 text-red-500 mr-3" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {editing ? (
          <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl p-6 border border-slate-200/60">
            <form onSubmit={handleSubmit(handleUpdateTask)} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  tabIndex={0}
                  aria-label="Task title"
                  placeholder="Enter task title..."
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    {errors.title.message}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                  rows={4}
                  tabIndex={0}
                  aria-label="Task description"
                  placeholder="Add a detailed description..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="user_id" className="block text-sm font-semibold text-slate-700 mb-2">
                    Assignee
                  </label>
                  <Controller
                    name="user_id"
                    control={control}
                    render={({ field }) => (
                      <Select<SelectOption>
                        value={userOptions.find(option => option.value === field.value) || null}
                        onChange={(selectedOption) => field.onChange(selectedOption?.value || '')}
                        options={userOptions}
                        styles={selectStyles}
                        placeholder="Select assignee..."
                        isClearable
                        tabIndex={0}
                        aria-label="Assignee"
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label htmlFor="customer_id" className="block text-sm font-semibold text-slate-700 mb-2">
                    Customer
                  </label>
                  <Controller
                    name="customer_id"
                    control={control}
                    render={({ field }) => (
                      <Select<SelectOption>
                        value={customerOptions.find(option => option.value === field.value) || null}
                        onChange={(selectedOption) => field.onChange(selectedOption?.value || '')}
                        options={customerOptions}
                        styles={selectStyles}
                        placeholder="Select customer..."
                        isClearable
                        tabIndex={0}
                        aria-label="Customer"
                      />
                    )}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="due_date" className="block text-sm font-semibold text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  id="due_date"
                  type="date"
                  {...register('due_date')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  tabIndex={0}
                  aria-label="Due date"
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  tabIndex={0}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                  tabIndex={0}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Task Header */}
            <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl p-6 border border-slate-200/60">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{currentTask.title}</h3>
              {currentTask.description ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{currentTask.description}</p>
                </div>
              ) : (
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60 border-dashed">
                  <p className="text-slate-400 italic text-center">No description provided</p>
                </div>
              )}
            </div>
            
            {/* Task Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                    <DocumentTextIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Status</p>
                </div>
                <p className="text-lg font-semibold text-slate-900">{currentTask.column?.name || 'Unknown'}</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mr-3">
                    <CalendarDaysIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Due Date</p>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {currentTask.due_date 
                    ? new Date(currentTask.due_date).toLocaleDateString() 
                    : 'No due date'}
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Assigned To</p>
                </div>
                <div className="flex items-center">
                  {currentTask.user ? (
                    <>
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 shadow-sm">
                        {getUserInitials(currentTask.user.name)}
                      </div>
                      <span className="text-lg font-semibold text-slate-900">{currentTask.user.name}</span>
                    </>
                  ) : (
                    <span className="text-lg font-semibold text-slate-500">Unassigned</span>
                  )}
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mr-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Customer</p>
                </div>
                <p className="text-lg font-semibold text-slate-900">{currentTask.customer?.name || 'None'}</p>
              </div>
            </div>
          </div>
        )}
        
        {!editing && (
          <div className="mt-8 pt-8 border-t border-slate-200/60">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Comments</h3>
              {currentTask.comments && currentTask.comments.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                  {currentTask.comments.length}
                </span>
              )}
            </div>
            
            <div className="space-y-4 mb-6">
              {currentTask.comments && currentTask.comments.length > 0 ? (
                currentTask.comments.map((comment) => (
                  <div key={comment.id} className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200/60 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 shadow-sm">
                          {getUserInitials(comment.user?.name || 'U')}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 text-sm">{comment.user?.name || 'Unknown user'}</div>
                          <div className="text-slate-500 text-xs">
                            {new Date(comment.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {user && comment.user_id === user.id && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditComment(comment.id, comment.content)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200"
                            title="Edit comment"
                          >
                            <PencilIcon className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCommentClick(comment.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                            title="Delete comment"
                          >
                            <TrashIcon className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-slate-200/60">
                      {editingCommentId === comment.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none text-sm"
                            rows={3}
                            tabIndex={0}
                            aria-label="Edit comment"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleCancelEditComment()}
                              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveComment(comment.id)}
                              disabled={!editingCommentContent.trim()}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed"
                            >
                              <CheckIcon className="w-3 h-3 mr-1" />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-700 leading-relaxed">{comment.content}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No comments yet</p>
                  <p className="text-slate-400 text-sm mt-1">Be the first to add a comment!</p>
                </div>
              )}
            </div>
            
            <form onSubmit={handleAddComment} className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-xl p-4 border border-slate-200/60">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Add a comment</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts, updates, or questions..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                  rows={3}
                  tabIndex={0}
                  aria-label="Add comment"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                  tabIndex={0}
                >
                  Add Comment
                </button>
              </div>
            </form>
          </div>
        )}
        
        <ConfirmationDialog
          isOpen={confirmDelete}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmButtonText="Delete Task"
          onConfirm={handleDeleteTask}
          onCancel={() => setConfirmDelete(false)}
        />

        <ConfirmationDialog
          isOpen={confirmDeleteComment}
          title="Delete Comment"
          message="Are you sure you want to delete this comment? This action cannot be undone."
          confirmButtonText={isLoading ? 'Deleting...' : 'Delete Comment'}
          onConfirm={handleConfirmDeleteComment}
          onCancel={() => {
            setConfirmDeleteComment(false);
            setCommentToDelete(null);
          }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default TaskModal; 