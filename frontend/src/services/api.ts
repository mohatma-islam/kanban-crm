import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication
export const login = (email: string, password: string) => 
  api.post('/login', { email, password });

export const register = (name: string, email: string, password: string, password_confirmation: string) => 
  api.post('/register', { name, email, password, password_confirmation });

export const logout = () => api.post('/logout');

export const getCurrentUser = () => api.get('/user');

// Users
export const getUsers = () => api.get('/users');
export const getUser = (id: number) => api.get(`/users/${id}`);
export const createUser = (data: {
  name: string,
  email: string,
  password: string,
  password_confirmation: string
}) => api.post('/users', data);
export const updateUser = (id: number, data: {
  name?: string,
  email?: string,
  password?: string,
  password_confirmation?: string
}) => api.put(`/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);

// Boards
export const getBoards = () => api.get('/boards');
export const getBoard = (id: number) => api.get(`/boards/${id}`);
export const createBoard = (data: { name: string, description?: string }) => 
  api.post('/boards', data);
export const updateBoard = (id: number, data: { name?: string, description?: string }) => 
  api.put(`/boards/${id}`, data);
export const deleteBoard = (id: number) => api.delete(`/boards/${id}`);

// Board Columns
export const getBoardColumns = (boardId: number) => 
  api.get(`/boards/${boardId}/columns`);
export const addBoardColumn = (boardId: number, data: { name: string }) => 
  api.post(`/boards/${boardId}/columns`, data);
export const updateBoardColumn = (boardId: number, columnId: number, data: { name: string }) => 
  api.put(`/boards/${boardId}/columns/${columnId}`, data);
export const deleteBoardColumn = (boardId: number, columnId: number) => 
  api.delete(`/boards/${boardId}/columns/${columnId}`);
export const reorderBoardColumns = (boardId: number, columnIds: number[]) => 
  api.put(`/boards/${boardId}/columns/reorder`, { columns: columnIds });

// Tasks
export const getTasks = (columnId?: number) => 
  api.get('/tasks', { params: columnId ? { column_id: columnId } : {} });
export const getTask = (id: number) => api.get(`/tasks/${id}`);
export const createTask = (data: { 
  title: string, 
  description?: string,
  column_id: number,
  customer_id?: number,
  user_id?: number,
  due_date?: string 
}) => api.post('/tasks', data);
export const updateTask = (id: number, data: {
  title?: string,
  description?: string,
  customer_id?: number | null,
  user_id?: number | null,
  due_date?: string | null
}) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);
export const moveTask = (id: number, data: { column_id: number, order: number }) => 
  api.put(`/tasks/${id}/move`, data);
export const reorderTasks = (columnId: number, taskIds: number[]) => 
  api.put('/reorder', { column_id: columnId, tasks: taskIds });
export const getCalendarTasks = () => api.get('/calendar');

// Task Comments
export const getTaskComments = (taskId: number) => 
  api.get(`/tasks/${taskId}/comments`);
export const addTaskComment = (taskId: number, content: string) => 
  api.post(`/tasks/${taskId}/comments`, { content });
export const updateTaskComment = (taskId: number, commentId: number, content: string) => 
  api.put(`/tasks/${taskId}/comments/${commentId}`, { content });
export const deleteTaskComment = (taskId: number, commentId: number) => 
  api.delete(`/tasks/${taskId}/comments/${commentId}`);

// Customers
export const getCustomers = () => api.get('/customers');
export const getCustomer = (id: number) => api.get(`/customers/${id}`);
export const createCustomer = (data: {
  name: string,
  email?: string,
  phone?: string,
  address?: string,
  company?: string,
  notes?: string,
  social_profiles?: string
}) => api.post('/customers', data);
export const updateCustomer = (id: number, data: {
  name?: string,
  email?: string,
  phone?: string,
  address?: string,
  company?: string,
  notes?: string,
  social_profiles?: string
}) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id: number) => api.delete(`/customers/${id}`);

export default api; 