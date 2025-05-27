import { create } from 'zustand';
import type { Task, TaskState } from '../types/index';
import * as api from '../services/api';

const useTaskStore = create<TaskState & {
  fetchTasks: (columnId?: number) => Promise<void>;
  fetchTask: (id: number) => Promise<void>;
  createTask: (data: {
    title: string;
    description?: string;
    column_id: number;
    customer_id?: number;
    user_id?: number;
    due_date?: string;
  }) => Promise<Task>;
  updateTask: (id: number, data: {
    title?: string;
    description?: string;
    customer_id?: number | null;
    user_id?: number | null;
    due_date?: string | null;
  }) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  moveTask: (id: number, data: { column_id: number; order: number }) => Promise<void>;
  reorderTasks: (columnId: number, taskIds: number[]) => Promise<void>;
  fetchCalendarTasks: () => Promise<void>;
  addComment: (taskId: number, content: string) => Promise<void>;
  updateComment: (taskId: number, commentId: number, content: string) => Promise<void>;
  deleteComment: (taskId: number, commentId: number) => Promise<void>;
  clearCurrentTask: () => void;
  clearError: () => void;
  updateTaskDueDate: (updatedTask: Task) => Promise<void>;
}>((set) => ({
  tasks: [],
  currentTask: null,
  calendarTasks: [],
  isLoading: false,
  error: null,
  
  fetchTasks: async (columnId) => {
    set({ isLoading: true });
    try {
      const response = await api.getTasks(columnId);
      set({ tasks: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch tasks',
        isLoading: false,
      });
    }
  },
  
  fetchTask: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.getTask(id);
      set({ currentTask: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch task',
        isLoading: false,
      });
    }
  },
  
  createTask: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.createTask(data);
      const newTask = response.data;
      
      set((state) => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }));
      
      return newTask;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create task',
        isLoading: false,
      });
      throw error;
    }
  },
  
  updateTask: async (id, data) => {
    set({ isLoading: true });
    try {
      const response = await api.updateTask(id, data);
      set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === id ? response.data : task
        ),
        currentTask: state.currentTask?.id === id ? response.data : state.currentTask,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update task',
        isLoading: false,
      });
    }
  },
  
  deleteTask: async (id) => {
    set({ isLoading: true });
    try {
      await api.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete task',
        isLoading: false,
      });
    }
  },
  
  moveTask: async (id, data) => {
    set({ isLoading: true });
    try {
      const response = await api.moveTask(id, data);
      set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === id ? response.data : task
        ),
        currentTask: state.currentTask?.id === id ? response.data : state.currentTask,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to move task',
        isLoading: false,
      });
    }
  },
  
  reorderTasks: async (columnId, taskIds) => {
    set({ isLoading: true });
    try {
      await api.reorderTasks(columnId, taskIds);
      
      // Update local state with the new order
      set((state) => {
        // Create a map for O(1) lookups
        const taskMap = new Map(
          state.tasks.map(task => [task.id, task])
        );
        
        // Create updated tasks array based on taskIds
        const updatedTasks = state.tasks.map(task => {
          if (task.column_id === columnId) {
            const index = taskIds.indexOf(task.id);
            if (index !== -1) {
              return { ...task, order: index };
            }
          }
          return task;
        });
        
        return {
          tasks: updatedTasks,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to reorder tasks',
        isLoading: false,
      });
    }
  },
  
  fetchCalendarTasks: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getCalendarTasks();
      set({ calendarTasks: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch calendar tasks',
        isLoading: false,
      });
    }
  },
  
  addComment: async (taskId, content) => {
    set({ isLoading: true });
    try {
      const response = await api.addTaskComment(taskId, content);
      set((state) => {
        if (state.currentTask && state.currentTask.id === taskId) {
          return {
            currentTask: {
              ...state.currentTask,
              comments: [
                ...(state.currentTask.comments || []),
                response.data,
              ],
            },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to add comment',
        isLoading: false,
      });
    }
  },
  
  updateComment: async (taskId, commentId, content) => {
    set({ isLoading: true });
    try {
      const response = await api.updateTaskComment(taskId, commentId, content);
      set((state) => {
        if (state.currentTask && state.currentTask.id === taskId && state.currentTask.comments) {
          return {
            currentTask: {
              ...state.currentTask,
              comments: state.currentTask.comments.map(comment => 
                comment.id === commentId ? response.data : comment
              ),
            },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update comment',
        isLoading: false,
      });
    }
  },
  
  deleteComment: async (taskId, commentId) => {
    set({ isLoading: true });
    try {
      await api.deleteTaskComment(taskId, commentId);
      set((state) => {
        if (state.currentTask && state.currentTask.id === taskId && state.currentTask.comments) {
          return {
            currentTask: {
              ...state.currentTask,
              comments: state.currentTask.comments.filter(comment => 
                comment.id !== commentId
              ),
            },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete comment',
        isLoading: false,
      });
    }
  },
  
  clearCurrentTask: () => set({ currentTask: null }),
  
  clearError: () => set({ error: null }),
  
  updateTaskDueDate: async (updatedTask) => {
    set({ isLoading: true });
    try {
      const response = await api.updateTask(updatedTask.id, { due_date: updatedTask.due_date });
      set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === updatedTask.id ? response.data : task
        ),
        calendarTasks: state.calendarTasks.map((task) => 
          task.id === updatedTask.id ? response.data : task
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update task due date',
        isLoading: false,
      });
    }
  },
}));

export default useTaskStore; 