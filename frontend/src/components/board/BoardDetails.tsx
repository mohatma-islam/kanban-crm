import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, type DragEndEvent, type DragStartEvent, type DragOverEvent, closestCorners, DragOverlay, useSensor, useSensors, PointerSensor, MeasuringStrategy, useDroppable } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Select from 'react-select';
import { EyeIcon, PencilSquareIcon, UserCircleIcon, XMarkIcon, TrashIcon, CheckIcon, MagnifyingGlassIcon, ArrowLeftIcon, Squares2X2Icon, ViewColumnsIcon, PlusIcon, FunnelIcon, SparklesIcon } from '@heroicons/react/24/outline';
import useBoardStore from '../../store/boardStore';
import useTaskStore from '../../store/taskStore';
import useUserStore from '../../store/userStore';
import TaskCard from '../task/TaskCard';
import TaskModal from '../task/TaskModal';
import { Pagination, ConfirmationDialog } from '../common';

import type { Task, BoardColumn } from '../../types/index';

interface SortableTaskProps {
  id: number;
  task: any;
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

const SortableTask = ({ 
  id, 
  task, 
  onClick, 
  onEditTitle, 
  editingTaskTitle, 
  editingTaskTitleValue, 
  onSaveTitle, 
  onCancelTitleEdit, 
  onTitleChange,
  onAssignUser,
  onDeleteTask,
  dragOverInfo,
  activeDragData
}: SortableTaskProps & { 
  dragOverInfo?: { columnId: number; taskId?: number; position?: 'before' | 'after' } | null;
  activeDragData?: any;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
  };
  
  const handleTaskClick = (e: React.MouseEvent) => {
    // Prevent click during drag
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Check if the click target is a button, input, or interactive element
    const target = e.target as HTMLElement;
    if (target.closest('button') || 
        target.closest('input') || 
        target.closest('.edit-controls') || 
        target.closest('.assignee-dropdown')) {
      e.stopPropagation();
      return;
    }
    
    // Call the onClick handler for opening the modal
    onClick();
  };
  
  // Check if this task should show drop indicators
  const showDropIndicator = dragOverInfo && 
    dragOverInfo.taskId === id && 
    activeDragData && 
    activeDragData.id !== id && // Don't show indicator for the dragged task itself
    activeDragData.columnId !== task.columnId; // Only show for cross-column drags
  
  return (
    <div className="relative">
      {/* Drop indicator - before */}
      {showDropIndicator && dragOverInfo.position === 'before' && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full z-10 shadow-lg">
          <div className="absolute -left-1 -top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md"></div>
          <div className="absolute -right-1 -top-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-md"></div>
        </div>
      )}
      
      <div 
        ref={setNodeRef} 
        style={style} 
        className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab hover:cursor-grab'}
         transition-all duration-200
         hover:border-indigo-600 hover:border-dashed
         hover:rounded-lg bg-white/95 backdrop-blur-sm
         border-2 border-transparent
         ${isDragging ? 'shadow-2xl border-indigo-300' : ''}
         ${showDropIndicator ? 'transform scale-105' : ''}
        `}
        {...attributes} 
        {...listeners}
        onClick={handleTaskClick}
      >
        <TaskCard 
          task={task} 
          onClick={() => {}} // Let the wrapper handle clicks
          onEditTitle={onEditTitle}
          editingTaskTitle={editingTaskTitle}
          editingTaskTitleValue={editingTaskTitleValue}
          onSaveTitle={onSaveTitle}
          onCancelTitleEdit={onCancelTitleEdit}
          onTitleChange={onTitleChange}
          onAssignUser={onAssignUser}
          onDeleteTask={onDeleteTask}
        />
      </div>
      
      {/* Drop indicator - after */}
      {showDropIndicator && dragOverInfo.position === 'after' && (
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full z-10 shadow-lg">
          <div className="absolute -left-1 -top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md"></div>
          <div className="absolute -right-1 -top-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-md"></div>
        </div>
      )}
    </div>
  );
};

const DraggableTaskOverlay = ({ task }: { task: any }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-2xl p-4 cursor-grabbing opacity-90 w-72 border-2 border-indigo-300 transform rotate-3 scale-105" 
      style={{ 
        boxShadow: '0px 25px 50px rgba(0, 0, 0, 0.25), 0px 0px 0px 1px rgba(99, 102, 241, 0.1)' 
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-800 truncate pr-2">{task.title}</h4>
        {task.user && (
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm flex-shrink-0">
            {task.user.name.split(' ').map((part: string) => part.charAt(0)).join('').toUpperCase()}
          </div>
        )}
      </div>
      
      {task.description && (
        <p className="text-slate-600 text-sm mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full font-medium">
          Moving...
        </span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

// Droppable zone component for column tasks area
const ColumnDropZone = ({ columnId, children, isEmpty }: { columnId: number; children: React.ReactNode; isEmpty: boolean }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: getColumnDropId(columnId),
  });
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-h-[120px] ${
        isEmpty ? 'border-2 border-dashed' : ''
      } ${isOver 
          ? 'border-2 border-indigo-400 border-opacity-80 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl' 
          : isEmpty 
            ? 'border-slate-300 border-opacity-50 hover:border-indigo-300 hover:border-opacity-70'
            : ''
        } 
        rounded-xl p-1 transition-all duration-200 ${isOver && !isEmpty ? 'shadow-lg' : ''}`}
    >
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

// Droppable zone component for empty columns
const EmptyColumnDropZone = ({ columnId, dragOverInfo, activeDragData }: { 
  columnId: number; 
  dragOverInfo?: { columnId: number; taskId?: number; position?: 'before' | 'after' } | null;
  activeDragData?: any;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: getEmptyColumnDropId(columnId),
  });
  
  // Check if we're dragging a task from another column over this empty column
  const isFromAnotherColumn = activeDragData && 
    activeDragData.columnId !== columnId && 
    (isOver || (dragOverInfo && dragOverInfo.columnId === columnId && !dragOverInfo.taskId));
  
  return (
    <div 
      ref={setNodeRef}
      className={`h-24 border-2 border-dashed rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200
        ${isOver || isFromAnotherColumn
          ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 scale-105 shadow-lg transform' 
          : 'border-slate-300 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 text-slate-400 hover:text-indigo-600'
        }`}
    >
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-200 ${
          isOver || isFromAnotherColumn ? 'bg-indigo-100 scale-110' : 'bg-slate-100'
        }`}>
          <PlusIcon className="h-5 w-5" />
        </div>
        <span>{isOver || isFromAnotherColumn ? 'Release to drop' : 'Drop task here'}</span>
        {isFromAnotherColumn && (
          <div className="flex space-x-1 mt-1">
            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Droppable zone component for the bottom of columns (add to end)
const ColumnBottomDropZone = ({ columnId, dragOverInfo, activeDragData }: { 
  columnId: number;
  dragOverInfo?: { columnId: number; taskId?: number; position?: 'before' | 'after' } | null;
  activeDragData?: any;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: getColumnBottomDropId(columnId),
  });
  
  // Check if we're dragging a task from another column over this bottom zone
  const isFromAnotherColumn = activeDragData && 
    activeDragData.columnId !== columnId && 
    isOver;
  
  return (
    <div 
      ref={setNodeRef}
      className={`w-full rounded-lg transition-all duration-200 flex items-center justify-center border-2 ${
        isOver || isFromAnotherColumn
          ? 'h-16 bg-gradient-to-br from-indigo-100 to-purple-100 border-dashed border-indigo-400 scale-105 shadow-lg transform' 
          : 'h-8 border-transparent hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-dashed hover:border-indigo-300'
      }`}
      style={{
        // Lower z-index than insertion zones
        zIndex: isOver || isFromAnotherColumn ? 5 : 1
      }}
    >
      {isOver || isFromAnotherColumn ? (
        <div className="text-sm text-indigo-600 font-medium flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Release to add to end
          <div className="flex space-x-1 ml-2">
            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Drop here to add to end
        </div>
      )}
    </div>
  );
};

// Type for react-select options
interface SelectOption {
  value: number | string;
  label: string;
}

// Constants for improved drag and drop experience
const BOARD_DETAIL_VIEW_STORAGE_KEY = 'boardViewMode';
const EMPTY_COLUMN_DROP_ID_PREFIX = 'empty-column-';

// Helper function to get column ID from droppable ID
const getColumnIdFromDroppableId = (droppableId: string): number | null => {
  const columnDropMatch = droppableId.match(/^column-drop-(\d+)$/);
  if (columnDropMatch) return parseInt(columnDropMatch[1], 10);
  
  const emptyColumnMatch = droppableId.match(/^empty-column-(\d+)$/);
  if (emptyColumnMatch) return parseInt(emptyColumnMatch[1], 10);
  
  const columnMatch = droppableId.match(/^column-(\d+)$/);
  if (columnMatch) return parseInt(columnMatch[1], 10);
  
  // Add support for bottom drop zone
  const bottomDropMatch = droppableId.match(/^column-bottom-(\d+)$/);
  if (bottomDropMatch) return parseInt(bottomDropMatch[1], 10);
  
  // Add support for insertion zones
  const insertionZoneMatch = droppableId.match(/^insertion-zone-(\d+)-(-?\d+)$/);
  if (insertionZoneMatch) return parseInt(insertionZoneMatch[1], 10);
  
  return null;
};

// Helper to identify type of item being dragged
const getDragType = (id: string | number): 'task' | 'column' | 'unknown' => {
  if (typeof id === 'number' || !isNaN(Number(id))) {
    return 'task';
  } else if (typeof id === 'string' && id.startsWith('column-')) {
    return 'column';
  }
  return 'unknown';
};

// Helper function to create a drop zone ID for a column
const getColumnDropId = (columnId: number) => `column-drop-${columnId}`;

// Helper function to create a drop zone ID for an empty column
const getEmptyColumnDropId = (columnId: number) => `${EMPTY_COLUMN_DROP_ID_PREFIX}${columnId}`;

// Helper function to create a drop zone ID for the bottom of a column (separate from tasks)
const getColumnBottomDropId = (columnId: number) => `column-bottom-${columnId}`;

// Helper function to create insertion zone IDs
const getInsertionZoneId = (columnId: number, afterTaskIndex: number) => `insertion-zone-${columnId}-${afterTaskIndex}`;

// Helper function to parse insertion zone IDs
const getInsertionZoneInfo = (droppableId: string): { columnId: number; insertAfterIndex: number } | null => {
  const match = droppableId.match(/^insertion-zone-(\d+)-(-?\d+)$/);
  if (match) {
    return {
      columnId: parseInt(match[1], 10),
      insertAfterIndex: parseInt(match[2], 10)
    };
  }
  return null;
};

// Droppable zone component for insertion between tasks
const InsertionDropZone = ({ columnId, insertAfterIndex, dragOverInfo, activeDragData }: { 
  columnId: number; 
  insertAfterIndex: number;
  dragOverInfo?: { columnId: number; taskId?: number; position?: 'before' | 'after' } | null;
  activeDragData?: any;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: getInsertionZoneId(columnId, insertAfterIndex),
  });
  
  // Check if we're dragging a task from another column over this insertion zone
  const isFromAnotherColumn = activeDragData && 
    activeDragData.columnId !== columnId && 
    isOver;
  
  return (
    <div 
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isFromAnotherColumn ? 'h-16 z-10' : 'h-2'
      }`}
      style={{
        // Ensure insertion zones have higher z-index when active
        zIndex: isFromAnotherColumn ? 10 : 1,
        // Add pointer events to ensure proper drop detection
        pointerEvents: 'auto'
      }}
    >
      {isFromAnotherColumn && (
        <div className="h-12 bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-dashed border-indigo-300 rounded-xl flex items-center justify-center mx-2 my-2 animate-pulse shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
            <span className="text-sm text-indigo-600 font-medium">
              {activeDragData.title} will be inserted here (position {insertAfterIndex + 2})
            </span>
            <div className="flex space-x-1 ml-auto">
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BoardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const boardId = parseInt(id || '0');
  
  const { currentBoard, fetchBoard, updateBoard, addColumn, updateColumn, deleteColumn, reorderColumns, isLoading: boardLoading, error: boardError } = useBoardStore();
  const { createTask, moveTask, updateTask, reorderTasks, deleteTask } = useTaskStore();
  const { users, fetchUsers } = useUserStore();
  
  const [editingBoardName, setEditingBoardName] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [showNewColumnForm, setShowNewColumnForm] = useState(false);
  const [currentTask, setCurrentTask] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [activeDragData, setActiveDragData] = useState<any>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  
  // New state for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  
  // New state for column editing and deletion
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [showDeleteColumnDialog, setShowDeleteColumnDialog] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<number | null>(null);
  
  // New state for task title editing and deletion
  const [editingTaskTitle, setEditingTaskTitle] = useState<number | null>(null);
  const [editingTaskTitleValue, setEditingTaskTitleValue] = useState('');
  const [showDeleteTaskDialog, setShowDeleteTaskDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  
  // Add state for tracking drag over positions
  const [dragOverInfo, setDragOverInfo] = useState<{
    columnId: number;
    taskId?: number;
    position?: 'before' | 'after';
  } | null>(null);
  
  // Configure sensors for better drag control
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Improve activation constraint to distinguish between clicks and drags
      activationConstraint: {
        distance: 8, // Increased distance - user needs to drag 8px before it starts dragging
        tolerance: 5, // Tolerance for direction changes
        delay: 100 // Small delay to distinguish from quick clicks
      },
    })
  );

  // Handle click outside and ESC for inline editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Cancel column name editing if clicking outside
      if (editingColumnId && !target.closest('.edit-column-input')) {
        handleCancelColumnEdit();
      }
      
      // Cancel task title editing if clicking outside
      if (editingTaskTitle && !target.closest('.edit-task-title')) {
        handleCancelTaskTitleEdit();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editingColumnId) {
          handleCancelColumnEdit();
        }
        if (editingTaskTitle) {
          handleCancelTaskTitleEdit();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [editingColumnId, editingTaskTitle]);
  
  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }
  }, [boardId, fetchBoard]);
  
  useEffect(() => {
    if (currentBoard) {
      setBoardName(currentBoard.name);
    }
  }, [currentBoard]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleBoardNameChange = async () => {
    if (currentBoard && boardName.trim() !== currentBoard.name) {
      await updateBoard(currentBoard.id, { name: boardName.trim() });
    }
    setEditingBoardName(false);
  };
  
  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentBoard && newColumnName.trim()) {
      await addColumn(currentBoard.id, { name: newColumnName.trim() });
      setNewColumnName('');
      setShowNewColumnForm(false);
    }
  };
  
  const handleAddTask = async (columnId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() && currentBoard) {
      try {
        const newTask = await createTask({
          title: newTaskTitle.trim(),
          column_id: columnId,
        });
        
        // Update the current board's columns with the new task
        const updatedBoard = { ...currentBoard } as any;
        if (updatedBoard.columns) {
          updatedBoard.columns = updatedBoard.columns.map((column: any) => {
            if (column.id === columnId) {
              return {
                ...column,
                tasks: [...(column.tasks || []), newTask]
              };
            }
            return column;
          });
          
          // This is a workaround to force a re-render
          // We need to create a new object reference for the board
          useBoardStore.setState({ currentBoard: updatedBoard });
        }
        
        setNewTaskTitle('');
        setShowNewTaskForm(null);
      } catch (error) {
        console.error('Failed to add task:', error);
      }
    }
  };
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeIdRaw = active.id;
    
    // Clear any previous drag over info
    setDragOverInfo(null);
    
    // Determine the type of drag operation
    const dragType = getDragType(activeIdRaw);
    
    if (dragType === 'task') {
      const activeId = Number(activeIdRaw);
      
      // Find the task data to display in the overlay
      if (currentBoard?.columns) {
        for (const column of currentBoard.columns) {
          if (column.tasks) {
            const task = column.tasks.find(t => t.id === activeId);
            if (task) {
              setActiveDragData({...task, columnId: column.id});
              console.log(`[BoardDetail] Started dragging task with ID: ${activeId}`, task);
              break;
            }
          }
        }
      }
    } else if (dragType === 'column') {
      // Handle column dragging - no overlay needed for columns
      setActiveDragData(null);
      console.log(`[BoardDetail] Started dragging column with ID: ${activeIdRaw}`);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    
    if (!over || !active) {
      setDragOverInfo(null);
      return;
    }
    
    const overId = String(over.id);
    const activeId = active.id;
    const dragType = getDragType(activeId);
    
    // Only handle task drag overs
    if (dragType !== 'task') {
      setDragOverInfo(null);
      return;
    }
    
    console.log(`[BoardDetail] Dragging over element with ID: ${overId}`);
    
    // Check if dragging over another task (for insertion positioning)
    if (typeof over.id === 'number' || !isNaN(Number(over.id))) {
      const overTaskId = Number(over.id);
      
      // Find which column this task belongs to
      if (currentBoard?.columns) {
        for (const column of currentBoard.columns) {
          if (column.tasks?.some(task => task.id === overTaskId)) {
            // Check if we're dragging from a different column
            const activeTaskId = Number(activeId);
            let sourceColumnId = null;
            
            // Find source column
            for (const sourceCol of currentBoard.columns) {
              if (sourceCol.tasks?.some(task => task.id === activeTaskId)) {
                sourceColumnId = sourceCol.id;
                break;
              }
            }
            
            // Only show detailed positioning for cross-column drags
            // For same-column drags, let the sortable context handle it naturally
            if (sourceColumnId !== column.id) {
              // For cross-column drags, we'll default to 'after' to ensure consistent behavior
              // This will place the task after the hovered task
              setDragOverInfo({
                columnId: column.id,
                taskId: overTaskId,
                position: 'after'
              });
            } else {
              // Same column drag - clear drag over info to let sortable handle it
              setDragOverInfo(null);
            }
            break;
          }
        }
      }
    } else {
      // Check if dragging over a column drop zone
      const columnId = getColumnIdFromDroppableId(overId);
      
      if (columnId !== null) {
        // Check if we're dragging from a different column
        const activeTaskId = Number(activeId);
        let sourceColumnId = null;
        
        if (currentBoard?.columns) {
          for (const sourceCol of currentBoard.columns) {
            if (sourceCol.tasks?.some(task => task.id === activeTaskId)) {
              sourceColumnId = sourceCol.id;
              break;
            }
          }
        }
        
        // Only show feedback for cross-column drags
        if (sourceColumnId !== columnId) {
          setDragOverInfo({
            columnId: columnId
          });
          console.log(`[BoardDetail] Dragging over column: ${columnId}`);
        } else {
          setDragOverInfo(null);
        }
      } else {
        setDragOverInfo(null);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log('[BoardDetail] Drag ended', event);
    const { active, over } = event;
    
    // Store dragOverInfo before clearing it to use for precise positioning
    const dropInfo = dragOverInfo;
    
    setActiveDragData(null);
    setDragOverInfo(null);
    
    if (!over) {
      console.log('[BoardDetail] No valid drop target');
      return;
    }
    
    // Extract IDs for better readability
    const activeIdRaw = active.id;
    const overIdRaw = over.id;
    const overString = String(overIdRaw);
    
    console.log(`[BoardDetail] Dropping element with ID ${activeIdRaw} onto element with ID ${overIdRaw}`);
    console.log(`[BoardDetail] Drop target type check - overString: "${overString}"`);
    
    // Determine if this is a task or column being dragged
    const dragType = getDragType(activeIdRaw);
    
    if (dragType === 'task') {
      const taskId = Number(activeIdRaw);
      
      // PRIORITY 1: Check for insertion zone drops first (highest priority)
      const insertionInfo = getInsertionZoneInfo(overString);
      if (insertionInfo) {
        console.log(`[BoardDetail] ✅ INSERTION ZONE DETECTED: task ${taskId} to column ${insertionInfo.columnId} at position ${insertionInfo.insertAfterIndex + 1}`);
        await handleTaskDropOnColumn(taskId, insertionInfo.columnId, insertionInfo.insertAfterIndex + 1);
        return;
      }
      
      // Debug: Check if it matches insertion zone pattern but failed parsing
      if (overString.includes('insertion-zone-')) {
        console.log(`[BoardDetail] ⚠️ WARNING: Insertion zone pattern detected but parsing failed: "${overString}"`);
      }
      
      // PRIORITY 2: Use dragOverInfo if available for precise positioning (from visual feedback)
      if (dropInfo && dropInfo.columnId && dropInfo.taskId && dropInfo.position) {
        console.log(`[BoardDetail] ✅ DRAG OVER INFO: task ${taskId} to column ${dropInfo.columnId}, ${dropInfo.position} task ${dropInfo.taskId}`);
        
        // Find the target task index in the target column
        let targetIndex = 0;
        if (currentBoard?.columns) {
          const targetColumn = currentBoard.columns.find(col => col.id === dropInfo.columnId);
          if (targetColumn?.tasks) {
            const targetTaskIndex = targetColumn.tasks.findIndex(task => task.id === dropInfo.taskId);
            if (targetTaskIndex !== -1) {
              targetIndex = dropInfo.position === 'before' ? targetTaskIndex : targetTaskIndex + 1;
            }
          }
        }
        
        await handleTaskDropOnColumn(taskId, dropInfo.columnId, targetIndex);
        return;
      }
      
      // PRIORITY 3: Use dragOverInfo for column-only drops (no specific task target)
      if (dropInfo && dropInfo.columnId && !dropInfo.taskId) {
        console.log(`[BoardDetail] ✅ COLUMN DROP INFO: task ${taskId} to column ${dropInfo.columnId} at end`);
        await handleTaskDropOnColumn(taskId, dropInfo.columnId, undefined);
        return;
      }
      
      // PRIORITY 4: Dropping on another task (reordering within column or moving to a different column)
      if (typeof overIdRaw === 'number' || !isNaN(Number(overIdRaw))) {
        const overTaskId = Number(overIdRaw);
        console.log(`[BoardDetail] ✅ TASK-ON-TASK DROP: Task ${taskId} dropped on task ${overTaskId}`);
        
        // Find source and target column information
        let sourceColumnId = null;
        let targetColumnId = null;
        let sourceTaskIndex = -1;
        let targetTaskIndex = -1;
        let sourceColumnTasks: Task[] = [];
        
        if (currentBoard?.columns) {
          // Find the columns and positions
          for (const column of currentBoard.columns) {
            if (column.tasks) {
              // Check if this column contains the target task
              const targetIdx = column.tasks.findIndex((t: Task) => t.id === overTaskId);
              if (targetIdx !== -1) {
                targetColumnId = column.id;
                targetTaskIndex = targetIdx;
              }
              
              // Check if this column contains the source task
              const sourceIdx = column.tasks.findIndex((t: Task) => t.id === taskId);
              if (sourceIdx !== -1) {
                sourceColumnId = column.id;
                sourceTaskIndex = sourceIdx;
                sourceColumnTasks = [...column.tasks];
              }
              
              // Exit early if we found both
              if (targetColumnId !== null && sourceColumnId !== null) {
                break;
              }
            }
          }
        }
        
        // Case 4A: Moving between columns
        if (sourceColumnId !== null && targetColumnId !== null && sourceColumnId !== targetColumnId) {
          console.log(`[BoardDetail] Cross-column move: task ${taskId} from column ${sourceColumnId} to column ${targetColumnId} at position ${targetTaskIndex}`);
          
          // Use the improved handleTaskDropOnColumn function with proper positioning
          await handleTaskDropOnColumn(taskId, targetColumnId, targetTaskIndex);
        }
        // Case 4B: Reordering within the same column
        else if (sourceColumnId !== null && sourceColumnId === targetColumnId && 
                sourceTaskIndex !== -1 && targetTaskIndex !== -1) {
          console.log(`[BoardDetail] Same-column reorder: tasks within column ${sourceColumnId}`);
          
          try {
            // Create the reordered array of tasks
            const reorderedTasks = arrayMove(sourceColumnTasks, sourceTaskIndex, targetTaskIndex);
            const taskIds = reorderedTasks.map(task => task.id);
            
            // Create an updated version of the board for immediate UI update
            const updatedBoard = { ...currentBoard } as any;
            
            // Update the tasks order in the column
            if (updatedBoard?.columns) {
              updatedBoard.columns = updatedBoard.columns.map((column: BoardColumn) => {
                if (column.id === sourceColumnId) {
                  return {
                    ...column,
                    tasks: reorderedTasks
                  };
                }
                return column;
              });
              
              // Update the local state for immediate feedback
              useBoardStore.setState({ currentBoard: updatedBoard });
            }
            
            // Send the update to the server
            await reorderTasks(sourceColumnId, taskIds);
            
            // Refresh board data to ensure consistency
            setTimeout(() => {
              if (boardId) fetchBoard(boardId);
            }, 500);
          } catch (error) {
            console.error('[BoardDetail] Error reordering tasks:', error);
            // Revert to server state on error
            if (boardId) fetchBoard(boardId);
          }
        }
      }
      // PRIORITY 5: Other column drop zones (lowest priority)
      else {
        const targetColumnId = getColumnIdFromDroppableId(overString);
        
        if (targetColumnId !== null) {
          console.log(`[BoardDetail] ⚠️ FALLBACK DROP: task ${taskId} on column ${targetColumnId}`);
          
          // Check if this is a bottom drop zone (should add to end)
          if (overString.startsWith('column-bottom-')) {
            console.log(`[BoardDetail] Bottom drop zone: task ${taskId} to end of column ${targetColumnId}`);
            await handleTaskDropOnColumn(taskId, targetColumnId, undefined);
          } else {
            // For other column drops, add to the end of the column
            console.log(`[BoardDetail] Generic column drop: task ${taskId} to end of column ${targetColumnId}`);
            await handleTaskDropOnColumn(taskId, targetColumnId, undefined);
          }
          return;
        } else {
          console.log(`[BoardDetail] ❌ UNHANDLED DROP: No valid drop target found for "${overString}"`);
        }
      }
    }
    // Handle column reordering
    else if (dragType === 'column') {
      // Extract column IDs for reordering
      const sourceColMatch = String(activeIdRaw).match(/^column-(\d+)$/);
      const targetColMatch = String(overIdRaw).match(/^column-(\d+)$/);
      
      if (sourceColMatch && targetColMatch && currentBoard && currentBoard.columns) {
        const sourceColId = parseInt(sourceColMatch[1], 10);
        const targetColId = parseInt(targetColMatch[1], 10);
        
        if (sourceColId !== targetColId) {
          console.log(`[BoardDetail] Reordering column ${sourceColId} to position of ${targetColId}`);
          
          const oldIndex = currentBoard.columns.findIndex(col => col.id === sourceColId);
          const newIndex = currentBoard.columns.findIndex(col => col.id === targetColId);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            try {
              // Create a new columns array with the reordered columns
              const newColumns = arrayMove(currentBoard.columns, oldIndex, newIndex);
              
              // Update local state for immediate feedback
              const updatedBoard = { ...currentBoard, columns: newColumns } as any;
              useBoardStore.setState({ currentBoard: updatedBoard });
              
              // Send the update to the server
              await reorderColumns(currentBoard.id, newColumns.map(col => col.id));
              
              // Refresh board data to ensure consistency
              setTimeout(() => {
                if (boardId) fetchBoard(boardId);
              }, 500);
            } catch (error) {
              console.error('[BoardDetail] Error reordering columns:', error);
              // Revert to server state on error
              if (boardId) fetchBoard(boardId);
            }
          }
        }
      }
    }
  };
  
  // Improved helper function to handle dropping a task on a column with proper positioning
  const handleTaskDropOnColumn = async (taskId: number, targetColumnId: number, insertIndex?: number) => {
    console.log(`[BoardDetail] Task ${taskId} dropped into column ${targetColumnId} at index ${insertIndex ?? 'end'}`);
    
    // Find the source column
    let sourceColumnId = null;
    if (currentBoard?.columns) {
      for (const column of currentBoard.columns) {
        if (column.tasks?.some((t: Task) => t.id === taskId)) {
          sourceColumnId = column.id;
          break;
        }
      }
    }
    
    // Verify the target column exists in the board
    const targetColumnExists = currentBoard?.columns?.some(col => col.id === targetColumnId);
    if (!targetColumnExists) {
      console.error(`[BoardDetail] Target column ${targetColumnId} does not exist in the board`);
      return;
    }
    
    // Only move if it's a different column or if we're reordering within the same column
    if (sourceColumnId !== null && (sourceColumnId !== targetColumnId || insertIndex !== undefined)) {
      try {
        // Create an updated version of the board for immediate UI update
        const updatedBoard = { ...currentBoard } as any;
        let taskToMove: Task | null = null;
        
        // Find and remove the task from its source column
        if (updatedBoard?.columns) {
          for (const column of updatedBoard.columns) {
            if (column.id === sourceColumnId && column.tasks) {
              const taskIndex = column.tasks.findIndex((t: Task) => t.id === taskId);
              if (taskIndex !== -1) {
                // Create a modifiable copy for the move
                taskToMove = { ...column.tasks[taskIndex] };
                // Remove the task from this column
                column.tasks.splice(taskIndex, 1);
                break;
              }
            }
          }
          
          // Add the task to the target column at the specified position
          if (taskToMove) {
            let targetColumnFound = false;
            
            for (const column of updatedBoard.columns) {
              if (column.id === targetColumnId) {
                targetColumnFound = true;
                taskToMove.column_id = targetColumnId;
                
                // Ensure the tasks array exists
                if (!column.tasks) {
                  column.tasks = [];
                  console.log(`[BoardDetail] Initializing empty tasks array for column ${targetColumnId}`);
                }
                
                // Insert the task at the specified position or at the end
                if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= column.tasks.length) {
                  column.tasks.splice(insertIndex, 0, taskToMove);
                  console.log(`[BoardDetail] Inserted task at position ${insertIndex}`);
                } else {
                  column.tasks.push(taskToMove);
                  console.log(`[BoardDetail] Added task to end of column`);
                }
                break;
              }
            }
            
            if (!targetColumnFound) {
              console.error(`[BoardDetail] Failed to find target column ${targetColumnId} in the board`);
              return;
            }
          } else {
            console.error(`[BoardDetail] Failed to find task ${taskId} to move`);
            return;
          }
        }
        
        // Update the local state for immediate feedback
        if (updatedBoard) {
          console.log('[BoardDetail] Updating board state after task move');
          useBoardStore.setState({ currentBoard: updatedBoard });
        }
        
        // Calculate the order for the server based on the final position
        let order = 0;
        if (updatedBoard?.columns) {
          const targetColumn = updatedBoard.columns.find((col: any) => col.id === targetColumnId);
          if (targetColumn?.tasks) {
            const taskIndex = targetColumn.tasks.findIndex((t: Task) => t.id === taskId);
            order = taskIndex;
          }
        }
        
        // Send the update to the server with proper order
        console.log(`[BoardDetail] Sending task move to server: ${taskId} to column ${targetColumnId} with order ${order}`);
        await moveTask(taskId, { column_id: targetColumnId, order });
        
        // Refresh board data to ensure consistency
        console.log('[BoardDetail] Refreshing board data after task move');
        setTimeout(() => {
          if (boardId) fetchBoard(boardId);
        }, 500);
      } catch (error) {
        console.error('[BoardDetail] Error moving task:', error);
        // Revert to server state on error
        if (boardId) fetchBoard(boardId);
      }
    } else {
      console.log(`[BoardDetail] Skip moving task - source column (${sourceColumnId}) is the same as target column (${targetColumnId}) and no position change or source not found`);
    }
  };
  
  const handleAssignUser = async (taskId: number, userId: number | null) => {
    try {
      // Find the user object first
      const assignedUser = userId ? users.find(u => u.id === userId) : undefined;
      
      // Update the local board data immediately for instant UI feedback
      if (currentBoard && currentBoard.columns) {
        const updatedBoard = { ...currentBoard };
        
        // Create new columns array with updated task
        const updatedColumns = updatedBoard.columns!.map((column: BoardColumn) => {
          if (!column.tasks) return column;
          
          const updatedTasks = column.tasks.map((task: Task) => {
            if (task.id === taskId) {
              return {
                ...task,
                user_id: userId,
                user: assignedUser
              } as Task;
            }
            return task;
          });
          
          return {
            ...column,
            tasks: updatedTasks
          } as BoardColumn;
        });
        
        // Update the board state immediately
        useBoardStore.setState({ 
          currentBoard: { 
            ...updatedBoard, 
            columns: updatedColumns 
          } 
        });
      }
      
      // Then send the update to the server
      await updateTask(taskId, { user_id: userId });
      
    } catch (error) {
      console.error('Failed to assign user:', error);
      // Revert to server state on error
      if (boardId) fetchBoard(boardId);
    }
  };
  
  const toggleViewMode = () => {
    const newViewMode = viewMode === 'kanban' ? 'table' : 'kanban';
    setViewMode(newViewMode);
    localStorage.setItem(BOARD_DETAIL_VIEW_STORAGE_KEY, newViewMode);
    setCurrentPage(1); // Reset to first page when switching views
    console.log(`[BoardDetail] View mode set to ${newViewMode} and saved to localStorage`);
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  

  
  const toggleUnassignedFilter = () => {
    setShowUnassignedOnly(!showUnassignedOnly);
    setSelectedUserIds([]);
    setCurrentPage(1);
  };
  
  const handleSelectAllUsers = () => {
    setSelectedUserIds(users.map(user => user.id));
    setCurrentPage(1);
  };
  
  const handleClearAllUsers = () => {
    setSelectedUserIds([]);
    setShowUnassignedOnly(false);
    setCurrentPage(1);
  };
  
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // console.log(currentBoard?.columns);
  
  
  // Filtered tasks based on user selection and search query
  const filteredTasks = useMemo(() => {
    let tasks: any[] = [];
    
    if (currentBoard?.columns) {
      currentBoard.columns.forEach(column => {
        if (column.tasks) {
          column.tasks.forEach(task => {
            // Apply user filter - more flexible logic to combine filters
            const matchesUserFilter = 
              (selectedUserIds.length === 0 && !showUnassignedOnly) || // No filter
              (showUnassignedOnly && !task.user_id) || // Unassigned filter
              (selectedUserIds.length > 0 && selectedUserIds.some(id => task.user_id === id)); // User filter
            
            // Apply search filter
            const matchesSearchFilter = 
              searchQuery === '' || 
              task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
              
            if (matchesUserFilter && matchesSearchFilter) {
              tasks.push({
                ...task,
                column_name: column.name,
                column_id: column.id
              });
            }
          });
        }
      });
    }
    
    return tasks;
  }, [currentBoard, selectedUserIds, showUnassignedOnly, searchQuery]);
  
  // Filtered board columns with filtered tasks
  const filteredColumns = useMemo(() => {
    if (!currentBoard?.columns) return [];
    
    return currentBoard.columns.map(column => {
      const filteredColumnTasks = column.tasks?.filter(task => {
        // Apply user filter - more flexible logic to combine filters
        const matchesUserFilter = 
          (selectedUserIds.length === 0 && !showUnassignedOnly) || // No filter
          (showUnassignedOnly && !task.user_id) || // Unassigned filter
          (selectedUserIds.length > 0 && selectedUserIds.some(id => task.user_id === id)); // User filter
        
        // Apply search filter
        const matchesSearchFilter = 
          searchQuery === '' || 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesUserFilter && matchesSearchFilter;
      });
      
      return {
        ...column,
        tasks: filteredColumnTasks || []
      };
    });
  }, [currentBoard, selectedUserIds, showUnassignedOnly, searchQuery]);
  
  // Flatten and sort tasks for table view with pagination
  const paginatedTasks = useMemo(() => {
    let tasks = [...filteredTasks];
    
    // Sort tasks if a sort field is specified
    if (sortField) {
      tasks.sort((a, b) => {
        let valueA: any;
        let valueB: any;
        
        switch (sortField) {
          case 'title':
            valueA = a.title;
            valueB = b.title;
            break;
          case 'status':
            valueA = a.column_name;
            valueB = b.column_name;
            break;
          case 'assignee':
            valueA = a.user?.name || '';
            valueB = b.user?.name || '';
            break;
          case 'due_date':
            valueA = a.due_date ? new Date(a.due_date) : new Date(0);
            valueB = b.due_date ? new Date(b.due_date) : new Date(0);
            break;
          default:
            return 0;
        }
        
        const comparison = typeof valueA === 'string' 
          ? valueA.localeCompare(valueB) 
          : valueA > valueB ? 1 : -1;
          
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      tasks: tasks.slice(startIndex, endIndex),
      totalTasks: tasks.length,
      totalPages: Math.ceil(tasks.length / itemsPerPage)
    };
  }, [filteredTasks, sortField, sortDirection, currentPage, itemsPerPage]);

  const userOptions = useMemo(() => {
    return users.map(user => ({
      value: user.id,
      label: user.name
    }));
  }, [users]);
  
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  const handleViewTask = (taskId: number) => {
    setCurrentTask(taskId);
  };
  
  const handleEditTask = (taskId: number) => {
    setEditingTask(taskId);
    setCurrentTask(taskId);
  };

  const handleDeleteTask = (taskId: number) => {
    setTaskToDelete(taskId);
    setShowDeleteTaskDialog(true);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
        setShowDeleteTaskDialog(false);
        setTaskToDelete(null);
        // Refresh board data
        if (boardId) fetchBoard(boardId);
      } catch (error) {
        console.error('Failed to delete task:', error);
        setShowDeleteTaskDialog(false);
        setTaskToDelete(null);
      }
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteTaskDialog(false);
    setTaskToDelete(null);
  };
  
  // Handler for column editing
  const handleEditColumn = (columnId: number, currentName: string) => {
    setEditingColumnId(columnId);
    setEditingColumnName(currentName);
  };
  
  const handleSaveColumnName = async () => {
    if (editingColumnId && editingColumnName.trim() !== '' && currentBoard) {
      try {
        await updateColumn(currentBoard.id, editingColumnId, { name: editingColumnName.trim() });
        setEditingColumnId(null);
        setEditingColumnName('');
        // Refresh board data
        if (boardId) fetchBoard(boardId);
      } catch (error) {
        console.error('Failed to update column name:', error);
      }
    }
  };
  
  const handleCancelColumnEdit = () => {
    setEditingColumnId(null);
    setEditingColumnName('');
  };
  
  // Handler for column deletion
  const handleDeleteColumn = (columnId: number) => {
    setColumnToDelete(columnId);
    setShowDeleteColumnDialog(true);
  };
  
  const confirmDeleteColumn = async () => {
    if (columnToDelete && currentBoard) {
      try {
        await deleteColumn(currentBoard.id, columnToDelete);
        setShowDeleteColumnDialog(false);
        setColumnToDelete(null);
        // Refresh board data
        if (boardId) fetchBoard(boardId);
      } catch (error) {
        console.error('Failed to delete column:', error);
        setShowDeleteColumnDialog(false);
        setColumnToDelete(null);
      }
    }
  };
  
  const cancelDeleteColumn = () => {
    setShowDeleteColumnDialog(false);
    setColumnToDelete(null);
  };
  
  // Handler for task title editing
  const handleEditTaskTitle = (taskId: number, currentTitle: string) => {
    setEditingTaskTitle(taskId);
    setEditingTaskTitleValue(currentTitle);
  };
  
  const handleSaveTaskTitle = async () => {
    if (editingTaskTitle && editingTaskTitleValue.trim() !== '') {
      try {
        await updateTask(editingTaskTitle, { title: editingTaskTitleValue.trim() });
        setEditingTaskTitle(null);
        setEditingTaskTitleValue('');
        // Refresh board data
        if (boardId) fetchBoard(boardId);
      } catch (error) {
        console.error('Failed to update task title:', error);
      }
    }
  };
  
  const handleCancelTaskTitleEdit = () => {
    setEditingTaskTitle(null);
    setEditingTaskTitleValue('');
  };
  
  // Restore the original useEffect for board loading while keeping the view mode persistence
  // Replace the combined useEffect with separate ones for view mode and board loading
  useEffect(() => {
    // Load view preference from localStorage
    const savedViewMode = localStorage.getItem(BOARD_DETAIL_VIEW_STORAGE_KEY) as 'kanban' | 'table' | null;
    if (savedViewMode) {
      // console.log(`[BoardDetail] Loading saved view mode: ${savedViewMode}`);
      setViewMode(savedViewMode);
    }
  }, []);

  // Restore the original board loading effect
  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }
  }, [boardId, fetchBoard]);
  
  if (boardLoading && !currentBoard) {
    return <div className="text-center py-8">Loading board...</div>;
  }
  
  if (boardError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {boardError}
        <div className="mt-2">
          <button 
            onClick={() => navigate('/boards')}
            className="text-blue-600 hover:underline"
            tabIndex={0}
          >
            Back to Boards
          </button>
        </div>
      </div>
    );
  }
  
  if (!currentBoard) {
    return (
      <div className="text-center py-8">
        <p>Board not found</p>
        <button 
          onClick={() => navigate('/boards')}
          className="mt-4 text-blue-600 hover:underline"
          tabIndex={0}
        >
          Back to Boards
        </button>
      </div>
    );
  }
  
  // Render pagination controls
  const renderPagination = () => {
    const { totalPages, totalTasks } = paginatedTasks;
    
    if (totalPages <= 1 && totalTasks <= 5) return null;
    
    return (
      <div className="p-6 border-t border-slate-200/60">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalTasks}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
          showItemsPerPage={true}
        />
      </div>
    );
  };

  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        {editingBoardName ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onBlur={handleBoardNameChange}
              onKeyDown={(e) => e.key === 'Enter' && handleBoardNameChange()}
              autoFocus
              tabIndex={0}
              aria-label="Board name"
            />
            <button
              onClick={handleBoardNameChange}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              tabIndex={0}
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
              onClick={() => setEditingBoardName(true)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setEditingBoardName(true)}
            >
              {currentBoard.name}
            </h1>
            
            {/* User filter avatars */}
            <div className="flex items-center ml-6 space-x-1">
              {/* Unassigned filter */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  showUnassignedOnly 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
                onClick={toggleUnassignedFilter}
                title="Show unassigned tasks"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleUnassignedFilter()}
              >
                <UserCircleIcon className="h-5 w-5" />
              </div>
              
              {/* User avatars */}
              {users.map(user => (
                <div 
                  key={user.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                    selectedUserIds.some(id => id === user.id) 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectedUserIds(selectedUserIds.some(id => id === user.id) ? selectedUserIds.filter(id => id !== user.id) : [...selectedUserIds, user.id])}
                  title={`Show tasks assigned to ${user.name}`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedUserIds(selectedUserIds.some(id => id === user.id) ? selectedUserIds.filter(id => id !== user.id) : [...selectedUserIds, user.id])}
                >
                  {getUserInitials(user.name)}
                </div>
              ))}
              
              {/* Quick action buttons */}
              {users.length > 1 && (
                <>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button
                    onClick={handleSelectAllUsers}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                    title="Select all users"
                    tabIndex={0}
                  >
                    All
                  </button>
                  <button
                    onClick={handleClearAllUsers}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                    title="Clear all filters"
                    tabIndex={0}
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/boards')}
            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
            tabIndex={0}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Boards
          </button>
          
          <button
            onClick={toggleViewMode}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            tabIndex={0}
            aria-label={viewMode === 'kanban' ? 'Switch to table view' : 'Switch to kanban view'}
            title={viewMode === 'kanban' ? 'Switch to table view' : 'Switch to kanban view'}
          >
            {viewMode === 'kanban' ? (
              <>
                <Squares2X2Icon className="h-5 w-5 mr-1" />
                Table View
              </>
            ) : (
              <>
                <ViewColumnsIcon className="h-5 w-5 mr-1" />
                Kanban View
              </>
            )}
          </button>
          
          {viewMode === 'kanban' && (
            <button
              onClick={() => setShowNewColumnForm(!showNewColumnForm)}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              tabIndex={0}
              title={showNewColumnForm ? 'Cancel adding column' : 'Add new column'}
            >
              {showNewColumnForm ? (
                <>
                  <XMarkIcon className="h-5 w-5 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add Column
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {showNewColumnForm && (
        <div className="bg-white shadow rounded-lg p-4 max-w-md">
          <h2 className="text-lg font-medium mb-2">Add New Column</h2>
          <form onSubmit={handleAddColumn} className="flex items-center space-x-2">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              tabIndex={0}
              aria-label="New column name"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              tabIndex={0}
            >
              Add
            </button>
          </form>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            tabIndex={0}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={0}
              aria-label="Clear search"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>
      
      {/* Filter indicator */}
      {(selectedUserIds.length > 0 || showUnassignedOnly || searchQuery) && (
        <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2 text-sm text-blue-700 flex items-center">
          <FunnelIcon className="h-5 w-5 mr-2" />
          <span>
            {searchQuery && `Searching for "${searchQuery}"`}
            {(searchQuery && (showUnassignedOnly || selectedUserIds.length > 0)) && ' • '}
            {showUnassignedOnly && selectedUserIds.length > 0 && `Unassigned tasks and tasks assigned to ${
              selectedUserIds.length === 1 
                ? users.find(u => u.id === selectedUserIds[0])?.name || 'Unknown user'
                : selectedUserIds.length === users.length 
                  ? 'all users'
                  : `${selectedUserIds.length} users`
            }`}
            {showUnassignedOnly && selectedUserIds.length === 0 && 'Unassigned tasks only'}
            {!showUnassignedOnly && selectedUserIds.length > 0 && `Tasks assigned to ${
              selectedUserIds.length === 1 
                ? users.find(u => u.id === selectedUserIds[0])?.name || 'Unknown user'
                : selectedUserIds.length === users.length 
                  ? 'all users'
                  : `${selectedUserIds.length} users`
            }`}
          </span>
          <button 
            className="ml-auto text-blue-500 hover:text-blue-700"
            onClick={() => { 
              setSelectedUserIds([]);
              setShowUnassignedOnly(false);
              setSearchQuery('');
            }}
            tabIndex={0}
            aria-label="Clear all filters"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-6">
          <DndContext 
            collisionDetection={closestCorners} 
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always
              },
            }}
          >
            <div className="flex space-x-6 min-w-max">
              {filteredColumns.length > 0 ? (
                filteredColumns.map((column) => (
                  <div
                    key={column.id}
                    id={`column-${column.id}`}
                    className={`w-80 rounded-2xl p-5 flex flex-col bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 group relative`}
                    data-column-id={column.id}
                    data-column-name={column.name}
                    data-droppable="true"
                    data-empty={column.tasks?.length === 0 ? 'true' : 'false'}
                  >
                    <div className="flex justify-between items-center mb-4">
                      {editingColumnId === column.id ? (
                        <div className="flex items-center space-x-3 flex-1 edit-column-input">
                          <input
                            type="text"
                            value={editingColumnName}
                            onChange={(e) => setEditingColumnName(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveColumnName();
                              if (e.key === 'Escape') handleCancelColumnEdit();
                            }}
                            autoFocus
                            tabIndex={0}
                            aria-label="Edit column name"
                          />
                          <button
                            onClick={handleSaveColumnName}
                            className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                            tabIndex={0}
                            title="Save column name"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleCancelColumnEdit}
                            className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all duration-200"
                            tabIndex={0}
                            title="Cancel editing"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-3 flex-1">
                            <h3 className="text-lg font-semibold text-slate-800">{column.name}</h3>
                            <button
                              onClick={() => handleEditColumn(column.id, column.name)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                              tabIndex={0}
                              title="Edit column name"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteColumn(column.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                              tabIndex={0}
                              title="Delete column"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-sm font-medium text-slate-500 bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1.5 rounded-lg">
                            {column.tasks?.length || 0}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <ColumnDropZone columnId={column.id} isEmpty={column.tasks?.length === 0}>
                      <SortableContext 
                        items={column.tasks?.map(task => task.id) || []} 
                        strategy={verticalListSortingStrategy}
                      >
                        {/* Insertion zone at the beginning of the column */}
                        {column.tasks && column.tasks.length > 0 && (
                          <InsertionDropZone 
                            columnId={column.id} 
                            insertAfterIndex={-1} 
                            dragOverInfo={dragOverInfo} 
                            activeDragData={activeDragData} 
                          />
                        )}
                        
                        {column.tasks && column.tasks.map((task, index) => (
                          <div key={`task-container-${task.id}`}>
                            <SortableTask
                              key={task.id}
                              id={task.id}
                              task={{...task, columnId: column.id}}
                              onClick={() => handleViewTask(task.id)}
                              onEditTitle={handleEditTaskTitle}
                              editingTaskTitle={editingTaskTitle}
                              editingTaskTitleValue={editingTaskTitleValue}
                              onSaveTitle={handleSaveTaskTitle}
                              onCancelTitleEdit={handleCancelTaskTitleEdit}
                              onTitleChange={setEditingTaskTitleValue}
                              onAssignUser={handleAssignUser}
                              onDeleteTask={handleDeleteTask}
                              dragOverInfo={dragOverInfo}
                              activeDragData={activeDragData}
                            />
                            
                            {/* Insertion zone after each task (except the last one, as that's handled by bottom drop zone) */}
                            {index < column.tasks.length - 1 && (
                              <InsertionDropZone 
                                columnId={column.id} 
                                insertAfterIndex={index} 
                                dragOverInfo={dragOverInfo} 
                                activeDragData={activeDragData} 
                              />
                            )}
                          </div>
                        ))}
                        
                        {/* Remove the old placeholder logic since we now have insertion zones */}
                      </SortableContext>
                      
                      {/* Empty column drop area indicator - visible when column is empty */}
                      {column.tasks?.length === 0 && (
                        <EmptyColumnDropZone columnId={column.id} dragOverInfo={dragOverInfo} activeDragData={activeDragData} />
                      )}
                    </ColumnDropZone>
                    
                    {/* Bottom drop zone for adding tasks to end - only show when column has tasks */}
                    {column.tasks && column.tasks.length > 0 && (
                      <ColumnBottomDropZone columnId={column.id} dragOverInfo={dragOverInfo} activeDragData={activeDragData} />
                    )}
                    
                    {showNewTaskForm === column.id ? (
                      <form onSubmit={(e) => handleAddTask(column.id, e)} className="mt-3">
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Task title"
                          className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3 transition-all duration-200"
                          required
                          autoFocus
                          tabIndex={0}
                          aria-label="New task title"
                        />
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowNewTaskForm(null)}
                            className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-lg hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-200 font-medium"
                            tabIndex={0}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 font-medium"
                            tabIndex={0}
                          >
                            Add Task
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowNewTaskForm(column.id)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200 rounded-xl hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-3 flex items-center justify-center transition-all duration-200 font-medium"
                        tabIndex={0}
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Task
                      </button>
                    )}
                  </div>
                ))
              ) : currentBoard.columns && currentBoard.columns.length > 0 ? (
                <div className="text-center py-12 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-slate-200/60 p-8 w-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FunnelIcon className="h-8 w-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks match your filters</h3>
                  <p className="text-slate-600">Try adjusting your search or filter criteria to see more tasks.</p>
                </div>
              ) : (
                <div className="text-center py-12 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-slate-200/60 p-8 w-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ViewColumnsIcon className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to organize your work?</h3>
                  <p className="text-slate-600 mb-6">This board has no columns. Add a column to start building your workflow!</p>
                  <button
                    onClick={() => setShowNewColumnForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Column
                  </button>
                </div>
              )}
            </div>
            
            {/* Drag Overlay */}
            <DragOverlay>
              {activeDragData && (
                <DraggableTaskOverlay task={activeDragData} />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors duration-200"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Task {renderSortIndicator('title')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors duration-200"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status {renderSortIndicator('status')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors duration-200"
                    onClick={() => handleSort('assignee')}
                  >
                    <div className="flex items-center">
                      Assignee {renderSortIndicator('assignee')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors duration-200"
                    onClick={() => handleSort('due_date')}
                  >
                    <div className="flex items-center">
                      Due Date {renderSortIndicator('due_date')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {paginatedTasks.tasks.length > 0 ? (
                  paginatedTasks.tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-slate-500 truncate max-w-xs">{task.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800">
                          {task.column_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-52">
                          <Select
                            value={
                              task.user_id
                                ? { value: task.user_id, label: task.user?.name || '' }
                                : null
                            }
                            onChange={(option: SelectOption | null) =>
                              handleAssignUser(task.id, option ? Number(option.value) : null)
                            }
                            options={[
                              { value: '', label: 'Unassigned' },
                              ...userOptions
                            ]}
                            placeholder="Assign user..."
                            isClearable
                            isSearchable
                            classNamePrefix="react-select"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            menuPlacement="auto"
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderColor: '#e2e8f0',
                                '&:hover': { borderColor: '#6366f1' },
                                boxShadow: 'none',
                                '&:focus-within': {
                                  borderColor: '#6366f1',
                                  boxShadow: '0 0 0 1px #6366f1'
                                }
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999
                              })
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.due_date ? (
                          <div className="text-sm font-medium text-slate-900">
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">No due date</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleViewTask(task.id)}
                            className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                            tabIndex={0}
                            title="View task"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditTask(task.id)}
                            className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                            tabIndex={0}
                            title="Edit task"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            tabIndex={0}
                            title="Delete task"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <CheckIcon className="h-8 w-8 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks found</h3>
                        <p className="text-slate-600">Try adjusting your search or filter criteria to see more tasks.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination for table view */}
          {renderPagination()}
        </div>
      )}
      
      {currentTask && (
        <TaskModal
          taskId={currentTask}
          initialEditMode={editingTask === currentTask}
          onClose={() => {
            setCurrentTask(null);
            setEditingTask(null);
            // Refresh board data when modal is closed to ensure updated task data is displayed
            fetchBoard(boardId);
          }}
        />
      )}
      
      <ConfirmationDialog
        isOpen={showDeleteColumnDialog}
        title="Delete Column"
        message="Are you sure you want to delete this column? This action will also delete all tasks in this column and cannot be undone."
        confirmButtonText="Delete Column"
        onConfirm={confirmDeleteColumn}
        onCancel={cancelDeleteColumn}
      />

      <ConfirmationDialog
        isOpen={showDeleteTaskDialog}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmButtonText="Delete Task"
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
      />
    </div>
  );
};

export default BoardDetail; 