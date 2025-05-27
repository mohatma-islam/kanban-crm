export interface Task {
  id: string;
  content: string;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface KanbanData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
} 