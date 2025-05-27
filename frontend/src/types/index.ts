export interface Column {
  id: number;
  title: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company: string | null;
  notes: string | null;
  social_profiles: string | null;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  columns?: BoardColumn[];
}

export interface BoardColumn {
  id: number;
  board_id: number;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
  board?: Board;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  column_id: number;
  customer_id: number | null;
  user_id: number | null;
  due_date: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  column?: BoardColumn;
  customer?: Customer;
  user?: User;
  comments?: TaskComment[];
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
  task?: Task;
}

// Authentication related types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Board store types
export interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;
}

// Task store types
export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  calendarTasks: Task[];
  isLoading: boolean;
  error: string | null;
}

// Customer store types
export interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
} 