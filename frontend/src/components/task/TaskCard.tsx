import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Task, User } from '../../types/index';
import useUserStore from '../../store/userStore';
import useTaskStore from '../../store/taskStore';
import { PencilSquareIcon, CheckIcon, XMarkIcon, UserIcon, ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onEditTitle?: (taskId: number, currentTitle: string) => void;
  editingTaskTitle?: number | null;
  editingTaskTitleValue?: string;
  onSaveTitle?: () => void;
  onCancelTitleEdit?: () => void;
  onTitleChange?: (value: string) => void;
  onAssignUser?: (taskId: number, userId: number | null) => void;
  onDeleteTask?: (taskId: number) => void;
}

const TaskCard = ({ 
  task, 
  onClick, 
  onEditTitle, 
  editingTaskTitle, 
  editingTaskTitleValue, 
  onSaveTitle, 
  onCancelTitleEdit, 
  onTitleChange,
  onAssignUser,
  onDeleteTask
}: TaskCardProps) => {
  const { users, fetchUsers, isLoading: usersLoading } = useUserStore();
  const { updateTask } = useTaskStore();
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setShowAssignDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const isOverdue = date < new Date();
    
    return {
      formatted: date.toLocaleDateString(),
      isOverdue,
    };
  };
  
  const dueDate = task.due_date ? formatDate(task.due_date) : null;
  
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  const handleUserAssign = async (user: User | null) => {
    const userId = user ? user.id : null;
    
    // Use parent's assignment handler if available (for immediate UI update)
    if (onAssignUser) {
      onAssignUser(task.id, userId);
    } else {
      // Fallback to direct update if no parent handler
      await updateTask(task.id, {
        user_id: userId
      });
    }
    
    setShowAssignDropdown(false);
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle onClick if it's passed (for non-sortable contexts)
    if (onClick && typeof onClick === 'function') {
      // Prevent opening the modal when clicking on the assign user dropdown
      if ((e.target as HTMLElement).closest('.assignee-dropdown')) {
        e.stopPropagation();
        return;
      }
      
      // Prevent opening modal when clicking on edit buttons or input field
      if ((e.target as HTMLElement).closest('.edit-controls') || 
          (e.target as HTMLElement).closest('input') ||
          (e.target as HTMLElement).closest('button')) {
        e.stopPropagation();
        return;
      }
      
      onClick();
    }
  };
  
  const updateDropdownPosition = () => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY - 0.5, // 4px gap below avatar
        left: rect.right + window.scrollX - 192 // 192px = w-48 (12rem)
      });
    }
  };
  
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showAssignDropdown) {
      updateDropdownPosition();
    }
    setShowAssignDropdown(!showAssignDropdown);
  };
  
  return (
    <div
      className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow duration-200"
      onClick={handleCardClick}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick(e as any)}
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex justify-between items-start mb-1">
        {editingTaskTitle === task.id ? (
          <div className="flex items-center space-x-1 flex-1 mr-2 edit-controls edit-task-title relative">
            <input
              type="text"
              value={editingTaskTitleValue || ''}
              onChange={(e) => onTitleChange?.(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') onSaveTitle?.();
                if (e.key === 'Escape') onCancelTitleEdit?.();
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              tabIndex={0}
              aria-label="Edit task title"
            />
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveTitle?.();
                }}
                className="p-1 text-green-600 hover:text-green-800 flex-shrink-0"
                tabIndex={0}
                title="Save task title"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelTitleEdit?.();
                }}
                className="p-1 text-gray-600 hover:text-gray-800 flex-shrink-0"
                tabIndex={0}
                title="Cancel editing"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 flex-1 mr-2 group">
            <h4 className="font-medium text-gray-800 min-w-0 flex-1">{task.title}</h4>
            {onEditTitle && (
              <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTitle(task.id, task.title);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                tabIndex={0}
                title="Edit task title"
              >
                <PencilSquareIcon className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask?.(task.id);
                }}
                className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                tabIndex={0}
                title="Delete task"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
              </>
            )}
          </div>
        )}
        <div className="relative" ref={dropdownRef}>
          {task.user ? (
            <div 
              ref={avatarRef}
              className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium cursor-pointer"
              onClick={toggleDropdown}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleDropdown(e as any)}
              aria-label={`Assigned to ${task.user.name}`}
            >
              {getUserInitials(task.user.name)}
            </div>
          ) : (
            <div 
              ref={avatarRef}
              className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center cursor-pointer"
              onClick={toggleDropdown}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleDropdown(e as any)}
              aria-label="Assign user"
            >
              <UserIcon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          {task.customer && (
            <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
              {task.customer.name}
            </div>
          )}
        </div>
        
        {dueDate && (
          <div 
            className={`px-2 py-1 rounded ${
              dueDate.isOverdue 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}
          >
            {dueDate.formatted}
          </div>
        )}
      </div>
      
      {task.comments && task.comments.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
          {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
        </div>
      )}
      
      {/* Portal the dropdown to document body */}
      {showAssignDropdown && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 rounded-md shadow-xl w-48 assignee-dropdown z-[9999]" 
          style={{ 
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            zIndex: 9999 
          }}
        >
          <div className="py-1">
            <div 
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => handleUserAssign(null)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleUserAssign(null)}
            >
              <span>Unassigned</span>
            </div>
            {usersLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
            ) : (
              users.map(user => (
                <div 
                  key={user.id}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleUserAssign(user)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleUserAssign(user)}
                >
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">
                    {getUserInitials(user.name)}
                  </div>
                  <span>{user.name}</span>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TaskCard; 