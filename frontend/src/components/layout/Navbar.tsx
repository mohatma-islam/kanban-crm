import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  ViewColumnsIcon,
  CalendarIcon,
  UserGroupIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';
import useBoardStore from '../../store/boardStore';

const BOARDS_DROPDOWN_STORAGE_KEY = 'boardsDropdownOpen';
const MOBILE_BOARDS_DROPDOWN_STORAGE_KEY = 'mobileBoardsDropdownOpen';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBoardsDropdownOpen, setIsBoardsDropdownOpen] = useState(false);
  const [isMobileBoardsDropdownOpen, setIsMobileBoardsDropdownOpen] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const { user, logout, isAuthenticated } = useAuthStore();
  const { boards, fetchBoards, createBoard, isLoading: boardsLoading, error, clearError } = useBoardStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Load dropdown state from localStorage on mount
  useEffect(() => {
    const savedDesktopState = localStorage.getItem(BOARDS_DROPDOWN_STORAGE_KEY);
    const savedMobileState = localStorage.getItem(MOBILE_BOARDS_DROPDOWN_STORAGE_KEY);
    
    if (savedDesktopState !== null) {
      setIsBoardsDropdownOpen(JSON.parse(savedDesktopState));
    }
    
    if (savedMobileState !== null) {
      setIsMobileBoardsDropdownOpen(JSON.parse(savedMobileState));
    }
  }, []);

  // Fetch boards when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBoards();
    }
  }, [isAuthenticated, fetchBoards]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleBoardsDropdown = () => {
    const newState = !isBoardsDropdownOpen;
    setIsBoardsDropdownOpen(newState);
    localStorage.setItem(BOARDS_DROPDOWN_STORAGE_KEY, JSON.stringify(newState));
  };

  const toggleMobileBoardsDropdown = () => {
    const newState = !isMobileBoardsDropdownOpen;
    setIsMobileBoardsDropdownOpen(newState);
    localStorage.setItem(MOBILE_BOARDS_DROPDOWN_STORAGE_KEY, JSON.stringify(newState));
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  const isBoardPath = (boardId: number) => {
    return location.pathname === `/boards/${boardId}`;
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { path: '/customers', label: 'Customers', icon: UserGroupIcon },
    { path: '/users', label: 'Users', icon: UsersIcon },
  ];

  const handleBoardNavigation = (boardId: number) => {
    navigate(`/boards/${boardId}`);
    // Keep dropdowns open - don't close them
  };

  const handleCreateBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      try {
        // Store the board name for potential navigation
        const boardName = newBoardName.trim();
        
        const response = await createBoard({
          name: boardName,
          description: newBoardDescription.trim() || undefined,
        });
        
        // Reset form and close modal
        setNewBoardName('');
        setNewBoardDescription('');
        setShowCreateBoardModal(false);
        
        // Refresh boards list to include the new board
        await fetchBoards();
        
        if(response) {
          navigate(`/boards/${response.id}`);
        } else {
          navigate('/boards');
        }

        return response;
      } catch (error) {
        console.error('Failed to create board:', error);
      }
    }
  };

  const handleCreateBoardClick = () => {
    setShowCreateBoardModal(true);
    clearError(); // Clear any existing errors
  };

  const handleCloseCreateModal = () => {
    setShowCreateBoardModal(false);
    setNewBoardName('');
    setNewBoardDescription('');
    clearError();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      {isAuthenticated && (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-gray-900">
            <div className="flex h-16 flex-shrink-0 items-center px-4">
              <Link 
                to="/" 
                className="text-xl font-bold text-white flex items-center"
                tabIndex={0}
              >
                <HomeIcon className="h-8 w-8 mr-3 text-blue-400" />
                Kanban CRM
              </Link>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
              <nav className="flex-1 space-y-2 px-4 py-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                      tabIndex={0}
                    >
                      <Icon
                        className={`mr-4 h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                        }`}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Boards with Dropdown */}
                <div className="relative">
                  <div className="flex items-center">
                    <Link
                      to="/boards"
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex-1 ${
                        isActivePath('/boards')
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                      tabIndex={0}
                    >
                      <ViewColumnsIcon
                        className={`mr-4 h-6 w-6 flex-shrink-0 ${
                          isActivePath('/boards') ? 'text-white' : 'text-gray-400 group-hover:text-white'
                        }`}
                        aria-hidden="true"
                      />
                      Boards
                    </Link>
                    <button
                      onClick={toggleBoardsDropdown}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isActivePath('/boards')
                          ? 'text-white hover:bg-blue-700'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                      tabIndex={0}
                      aria-expanded={isBoardsDropdownOpen}
                    >
                      {isBoardsDropdownOpen ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Desktop Boards Dropdown */}
                  {isBoardsDropdownOpen && (
                    <div className="ml-6 mt-2 space-y-1">
                      {boardsLoading ? (
                        <div className="px-4 py-2 text-xs text-gray-400 flex items-center">
                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Loading boards...
                        </div>
                      ) : boards.length > 0 ? (
                        <>
                          {boards.map((board) => (
                            <button
                              key={board.id}
                              onClick={() => handleBoardNavigation(board.id)}
                              className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                                isBoardPath(board.id)
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }`}
                              tabIndex={0}
                            >
                              <span className="truncate block">{board.name}</span>
                            </button>
                          ))}
                          <button
                            onClick={handleCreateBoardClick}
                            className="w-full text-left px-4 py-2 text-sm text-green-400 hover:text-green-300 hover:bg-gray-800 transition-all duration-200 flex items-center"
                            tabIndex={0}
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Board
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-2 text-xs text-gray-400">No boards available</div>
                          <button
                            onClick={handleCreateBoardClick}
                            className="w-full text-left px-4 py-2 text-sm text-green-400 hover:text-green-300 hover:bg-gray-800 transition-all duration-200 flex items-center"
                            tabIndex={0}
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Board
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </nav>
              <div className="flex-shrink-0 px-4 py-6">
                <div className="flex items-center px-4 py-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200"
                  tabIndex={0}
                >
                  <ArrowRightOnRectangleIcon
                    className="mr-4 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-white"
                    aria-hidden="true"
                  />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Top Navigation */}
      <nav className="lg:hidden bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link 
                  to="/" 
                  className="text-xl font-bold"
                  tabIndex={0}
                >
                  Kanban CRM
                </Link>
              </div>
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center">
                <span className="text-sm mr-3">{user?.name}</span>
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  aria-expanded={isMenuOpen}
                  tabIndex={0}
                >
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon
                    className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    aria-hidden="true"
                  />
                  <XMarkIcon
                    className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                  tabIndex={0}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700"
                  tabIndex={0}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-700'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                      tabIndex={0}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Mobile Boards with Dropdown */}
                <div>
                  <div className="flex items-center">
                    <Link
                      to="/boards"
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium flex-1 ${
                        isActivePath('/boards')
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-700'
                      }`}
                      onClick={() => !isMobileBoardsDropdownOpen && setIsMenuOpen(false)}
                      tabIndex={0}
                    >
                      <ViewColumnsIcon className="mr-3 h-5 w-5" />
                      Boards
                    </Link>
                    <button
                      onClick={toggleMobileBoardsDropdown}
                      className="p-2 rounded-md hover:bg-gray-700"
                      tabIndex={0}
                      aria-expanded={isMobileBoardsDropdownOpen}
                    >
                      {isMobileBoardsDropdownOpen ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Mobile Boards Dropdown */}
                  {isMobileBoardsDropdownOpen && (
                    <div className="ml-6 mt-2 space-y-1">
                      {boardsLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-400 flex items-center">
                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Loading boards...
                        </div>
                      ) : boards.length > 0 ? (
                        <>
                          {boards.map((board) => (
                            <button
                              key={board.id}
                              onClick={() => handleBoardNavigation(board.id)}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                isBoardPath(board.id)
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              }`}
                              tabIndex={0}
                            >
                              <span className="truncate block">{board.name}</span>
                            </button>
                          ))}
                          <button
                            onClick={handleCreateBoardClick}
                            className="w-full text-left px-3 py-2 text-sm text-green-400 hover:text-green-300 hover:bg-gray-700 flex items-center"
                            tabIndex={0}
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Board
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="px-3 py-2 text-sm text-gray-400">No boards available</div>
                          <button
                            onClick={handleCreateBoardClick}
                            className="w-full text-left px-3 py-2 text-sm text-green-400 hover:text-green-300 hover:bg-gray-700 flex items-center"
                            tabIndex={0}
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Board
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none">{user?.name}</div>
                      <div className="text-sm font-medium leading-none text-gray-400 mt-1">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 px-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700"
                      tabIndex={0}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                  tabIndex={0}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                  tabIndex={0}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Create Board Modal - Modern Design */}
      {showCreateBoardModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 py-6 text-center sm:block sm:p-0">
            {/* Background overlay with modern gradient */}
            <div 
              className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-gray-900/70 to-slate-900/80 backdrop-blur-sm transition-opacity"
              onClick={handleCloseCreateModal}
            ></div>

            {/* Modal panel with modern glassmorphism design */}
            <div className="relative inline-block transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle border border-white/20">
              {/* Gradient background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/80 to-purple-50/50 rounded-3xl"></div>
              
              <div className="relative p-8">
                {/* Header with modern styling */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                      <ViewColumnsIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                        Create New Board
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Organize your projects with a new board</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseCreateModal}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/70 rounded-xl transition-all duration-200 backdrop-blur-sm"
                    tabIndex={0}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Error display with modern styling */}
                {error && (
                  <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 text-red-700 px-4 py-4 rounded-2xl shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                        <span className="font-medium">{error}</span>
                      </div>
                      <button
                        onClick={clearError}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        tabIndex={0}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Form with modern styling */}
                <form onSubmit={handleCreateBoardSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="modal-board-name" className="block text-sm font-semibold text-slate-700 mb-3">
                      Board Name
                    </label>
                    <input
                      id="modal-board-name"
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="w-full px-4 py-4 border border-slate-200/60 rounded-2xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400 font-medium"
                      required
                      placeholder="Enter an inspiring board name..."
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="modal-board-description" className="block text-sm font-semibold text-slate-700 mb-3">
                      Description (Optional)
                    </label>
                    <textarea
                      id="modal-board-description"
                      value={newBoardDescription}
                      onChange={(e) => setNewBoardDescription(e.target.value)}
                      className="w-full px-4 py-4 border border-slate-200/60 rounded-2xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none placeholder-slate-400"
                      rows={4}
                      placeholder="Describe what this board will help you accomplish..."
                    />
                  </div>

                  {/* Action buttons with modern styling */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={handleCloseCreateModal}
                      className="px-6 py-3 bg-white/70 hover:bg-white border border-slate-200/60 text-slate-700 font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm hover:shadow-md"
                      tabIndex={0}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={boardsLoading}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                      tabIndex={0}
                    >
                      {boardsLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-5 w-5 mr-2" />
                          <span>Create Board</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 