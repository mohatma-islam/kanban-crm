import { create } from 'zustand';
import type { Board, BoardColumn, BoardState } from '../types/index';
import * as api from '../services/api';

const useBoardStore = create<BoardState & {
  fetchBoards: () => Promise<void>;
  fetchBoard: (id: number) => Promise<void>;
  createBoard: (data: { name: string; description?: string }) => Promise<void | Board>;
  updateBoard: (id: number, data: { name?: string; description?: string }) => Promise<void>;
  deleteBoard: (id: number) => Promise<void>;
  addColumn: (boardId: number, data: { name: string }) => Promise<void>;
  updateColumn: (boardId: number, columnId: number, data: { name: string }) => Promise<void>;
  deleteColumn: (boardId: number, columnId: number) => Promise<void>;
  reorderColumns: (boardId: number, columnIds: number[]) => Promise<void>;
  clearCurrentBoard: () => void;
  clearError: () => void;
}>((set, get) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,
  
  fetchBoards: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getBoards();
      set({ boards: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch boards',
        isLoading: false,
      });
    }
  },
  
  fetchBoard: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.getBoard(id);
      set({ currentBoard: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch board',
        isLoading: false,
      });
    }
  },
  
  createBoard: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.createBoard(data);
      set((state) => ({
        boards: [...state.boards, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create board',
        isLoading: false,
      });
    }
  },
  
  updateBoard: async (id, data) => {
    set({ isLoading: true });
    try {
      const response = await api.updateBoard(id, data);
      set((state) => ({
        boards: state.boards.map((board) => 
          board.id === id ? response.data : board
        ),
        currentBoard: state.currentBoard?.id === id ? response.data : state.currentBoard,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update board',
        isLoading: false,
      });
    }
  },
  
  deleteBoard: async (id) => {
    set({ isLoading: true });
    try {
      await api.deleteBoard(id);
      set((state) => ({
        boards: state.boards.filter((board) => board.id !== id),
        currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete board',
        isLoading: false,
      });
    }
  },
  
  addColumn: async (boardId, data) => {
    set({ isLoading: true });
    try {
      const response = await api.addBoardColumn(boardId, data);
      const newColumn = response.data as BoardColumn;
      
      set((state) => {
        const currentBoard = state.currentBoard;
        if (!currentBoard || currentBoard.id !== boardId) return state;
        
        const updatedBoard: Board = {
          ...currentBoard,
          columns: [...(currentBoard.columns || []), newColumn],
        };
        
        return {
          currentBoard: updatedBoard,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to add column',
        isLoading: false,
      });
    }
  },
  
  updateColumn: async (boardId, columnId, data) => {
    set({ isLoading: true });
    try {
      const response = await api.updateBoardColumn(boardId, columnId, data);
      const updatedColumn = response.data as BoardColumn;
      
      set((state) => {
        const currentBoard = state.currentBoard;
        if (!currentBoard || currentBoard.id !== boardId) return state;
        
        const updatedBoard: Board = {
          ...currentBoard,
          columns: currentBoard.columns?.map((column) => 
            column.id === columnId ? updatedColumn : column
          ),
        };
        
        return {
          currentBoard: updatedBoard,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update column',
        isLoading: false,
      });
    }
  },
  
  deleteColumn: async (boardId, columnId) => {
    set({ isLoading: true });
    try {
      await api.deleteBoardColumn(boardId, columnId);
      
      set((state) => {
        const currentBoard = state.currentBoard;
        if (!currentBoard || currentBoard.id !== boardId) return state;
        
        const updatedBoard: Board = {
          ...currentBoard,
          columns: currentBoard.columns?.filter((column) => column.id !== columnId),
        };
        
        return {
          currentBoard: updatedBoard,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete column',
        isLoading: false,
      });
    }
  },
  
  reorderColumns: async (boardId, columnIds) => {
    set({ isLoading: true });
    try {
      await api.reorderBoardColumns(boardId, columnIds);
      
      set((state) => {
        const currentBoard = state.currentBoard;
        if (!currentBoard || currentBoard.id !== boardId || !currentBoard.columns) {
          return state;
        }
        
        // Create a map for O(1) lookups
        const columnMap = new Map(
          currentBoard.columns.map(column => [column.id, column])
        );
        
        // Create reordered columns array based on columnIds
        const reorderedColumns = columnIds
          .map((id, index) => {
            const column = columnMap.get(id);
            return column ? { ...column, order: index } : null;
          })
          .filter((column): column is BoardColumn => column !== null);
        
        const updatedBoard: Board = {
          ...currentBoard,
          columns: reorderedColumns,
        };
        
        return {
          currentBoard: updatedBoard,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to reorder columns',
        isLoading: false,
      });
    }
  },
  
  clearCurrentBoard: () => set({ currentBoard: null }),
  
  clearError: () => set({ error: null }),
}));

export default useBoardStore; 