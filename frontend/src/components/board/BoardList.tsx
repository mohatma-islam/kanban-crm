import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useBoardStore from '../../store/boardStore';
import { TableCellsIcon, Squares2X2Icon, MagnifyingGlassIcon, XMarkIcon, ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon, SparklesIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Pagination, ConfirmationDialog } from '../common';
import type { Board } from '../../types/index';

const BOARD_LIST_VIEW_STORAGE_KEY = 'boardListView';

const BoardList = () => {
  const { boards, fetchBoards, createBoard, updateBoard, deleteBoard, isLoading, error, clearError } = useBoardStore();
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [showEditBoardForm, setShowEditBoardForm] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [editBoardName, setEditBoardName] = useState('');
  const [editBoardDescription, setEditBoardDescription] = useState('');
  const [sortField, setSortField] = useState<keyof Board>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const getInitialView = (): 'grid' | 'table' => {
    return (localStorage.getItem(BOARD_LIST_VIEW_STORAGE_KEY) as 'grid' | 'table') || 'grid';
  };
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(getInitialView());

  // Search, sorting and pagination logic
  const filteredBoards = useMemo(() => {
    return boards.filter(board => 
      board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (board.description && board.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [boards, searchTerm]);

  const sortedBoards = useMemo(() => {
    const sorted = [...filteredBoards].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredBoards, sortField, sortDirection]);

  const paginatedBoards = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedBoards.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedBoards, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedBoards.length / itemsPerPage);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleSort = (field: keyof Board) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getSortIcon = (field: keyof Board) => {
    if (field !== sortField) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-slate-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 text-indigo-500" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 text-indigo-500" />
    );
  };

  const handleSetViewMode = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem(BOARD_LIST_VIEW_STORAGE_KEY, mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      await createBoard({
        name: newBoardName.trim(),
        description: newBoardDescription.trim() || undefined,
      });
      setNewBoardName('');
      setNewBoardDescription('');
      setShowNewBoardForm(false);
    }
  };

  const handleEdit = (board: Board) => {
    setEditingBoard(board);
    setEditBoardName(board.name);
    setEditBoardDescription(board.description || '');
    setShowEditBoardForm(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBoard && editBoardName.trim()) {
      await updateBoard(editingBoard.id, {
        name: editBoardName.trim(),
        description: editBoardDescription.trim() || undefined,
      });
      setEditBoardName('');
      setEditBoardDescription('');
      setEditingBoard(null);
      setShowEditBoardForm(false);
    }
  };

  const handleDeleteClick = (board: Board) => {
    setBoardToDelete(board);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (boardToDelete) {
      await deleteBoard(boardToDelete.id);
      setShowDeleteDialog(false);
      setBoardToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setBoardToDelete(null);
  };

  const handleCloseEditForm = () => {
    setShowEditBoardForm(false);
    setEditingBoard(null);
    setEditBoardName('');
    setEditBoardDescription('');
    clearError();
  };

  if (isLoading && boards.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <SparklesIcon className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 mt-4 font-medium">Loading your boards...</p>
        </div>
      </div>
    );
  }

  const renderBoards = () => {
    if (viewMode === 'table') {
      return (
        <>
          <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-slate-200/60">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-2 hover:text-slate-800 transition-colors"
                      >
                        <span>Name</span>
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('description')}
                        className="flex items-center space-x-2 hover:text-slate-800 transition-colors"
                      >
                        <span>Description</span>
                        {getSortIcon('description')}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Stages
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center space-x-2 hover:text-slate-800 transition-colors"
                      >
                        <span>Created</span>
                        {getSortIcon('created_at')}
                      </button>
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginatedBoards.map((board, index) => (
                    <tr key={board.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/boards/${board.id}`} 
                          className="text-slate-900 font-medium hover:text-indigo-600 transition-colors duration-200"
                        >
                          {board.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600 text-sm max-w-xs truncate">
                          {board.description || <span className="text-slate-400 italic">No description</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {board.columns?.length || 0} stages
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(board.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(board)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200"
                            title="Edit board"
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(board)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                            title="Delete board"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                          <Link 
                            to={`/boards/${board.id}`} 
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
                          >
                            View Board
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Modern Pagination for Table View */}
            {(totalPages > 1 || sortedBoards.length > 5) && (
              <div className="p-6 border-t border-slate-200/60">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedBoards.length}
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
        </>
      );
    } else {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedBoards.map((board) => (
              <div
                key={board.id}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-indigo-200 p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <Link
                      to={`/boards/${board.id}`}
                      className="flex-1 mr-2"
                      tabIndex={0}
                    >
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {board.name}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(board)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                        title="Edit board"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(board)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete board"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {board.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {board.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                      <span className="text-slate-500 font-medium">
                        {board.columns?.length || 0} stages
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs">
                      {new Date(board.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 group-hover:border-indigo-100 transition-colors">
                    <Link
                      to={`/boards/${board.id}`}
                      className="text-indigo-600 text-sm font-medium group-hover:text-indigo-700"
                    >
                      Open Board →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Modern Pagination for Grid View */}
          {(totalPages > 1 || sortedBoards.length > 5) && (
            <div className="bg-white/60 backdrop-blur-sm shadow-sm rounded-2xl border border-slate-200/60 p-6 mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedBoards.length}
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
        </>
      );
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            Your Boards
          </h1>
          <p className="text-slate-600 mt-1">Manage and organize your project boards</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm p-1">
            <button 
              onClick={() => handleSetViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-indigo-500 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => handleSetViewMode('table')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                viewMode === 'table' 
                  ? 'bg-indigo-500 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
              aria-label="Table view"
              title="Table view"
            >
              <TableCellsIcon className="h-5 w-5" />
            </button>
          </div>
          
          <button
            onClick={() => setShowNewBoardForm(!showNewBoardForm)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            tabIndex={0}
          >
            {showNewBoardForm ? (
              <>
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Board
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
              {error}
            </div>
            <button
              onClick={clearError}
              className="text-red-800 hover:text-red-900 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modern Search Bar */}
      <div className="bg-white/70 backdrop-blur-sm shadow-sm rounded-2xl border border-slate-200/60 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search boards by name or description..."
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

      {showNewBoardForm && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-slate-200/60 p-6 max-w-2xl">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Board</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Board Name
              </label>
              <input
                id="name"
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
                tabIndex={0}
                aria-label="Board name"
                placeholder="Enter board name..."
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                rows={3}
                tabIndex={0}
                aria-label="Board description"
                placeholder="Describe your board..."
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                tabIndex={0}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Board
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditBoardForm && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-slate-200/60 p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Edit Board</h2>
            <button
              onClick={handleCloseEditForm}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 mb-2">
                Board Name
              </label>
              <input
                id="edit-name"
                type="text"
                value={editBoardName}
                onChange={(e) => setEditBoardName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
                tabIndex={0}
                aria-label="Board name"
                placeholder="Enter board name..."
              />
            </div>
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-slate-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="edit-description"
                value={editBoardDescription}
                onChange={(e) => setEditBoardDescription(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                rows={3}
                tabIndex={0}
                aria-label="Board description"
                placeholder="Describe your board..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCloseEditForm}
                className="inline-flex items-center px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200"
                tabIndex={0}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                tabIndex={0}
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Update Board
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Board"
        message={`Are you sure you want to delete "${boardToDelete?.name}"? This action will permanently remove the board and all its contents. This cannot be undone.`}
        confirmButtonText={isLoading ? 'Deleting...' : 'Delete Board'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isLoading}
      />

      {sortedBoards.length === 0 && !showNewBoardForm ? (
        <div className="text-center py-16 bg-white/60 backdrop-blur-sm shadow-sm rounded-2xl border border-slate-200/60">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Squares2X2Icon className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No boards found' : 'No boards yet'}
            </h3>
            <p className="text-slate-600">
              {searchTerm ? 
                `No boards found matching "${searchTerm}". Try a different search term.` : 
                "Create your first board to start organizing your projects!"
              }
            </p>
          </div>
        </div>
      ) : (
        renderBoards()
      )}
    </div>
  );
};

export default BoardList; 