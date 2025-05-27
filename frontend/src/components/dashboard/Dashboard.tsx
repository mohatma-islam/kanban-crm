import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon, ClipboardDocumentCheckIcon, SparklesIcon, UsersIcon, RectangleStackIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import useCustomerStore from '../../store/customerStore';
import useUserStore from '../../store/userStore';
import useBoardStore from '../../store/boardStore';
import useTaskStore from '../../store/taskStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Modern color palette for charts
const generateModernColor = (index: number) => {
  const colors = [
    'rgba(99, 102, 241, 0.8)',   // Indigo
    'rgba(168, 85, 247, 0.8)',   // Purple
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(16, 185, 129, 0.8)',   // Emerald
    'rgba(245, 101, 101, 0.8)',  // Red
    'rgba(251, 191, 36, 0.8)',   // Amber
    'rgba(139, 92, 246, 0.8)',   // Violet
    'rgba(34, 197, 94, 0.8)',    // Green
    'rgba(239, 68, 68, 0.8)',    // Red-500
    'rgba(14, 165, 233, 0.8)',   // Sky
  ];
  return colors[index % colors.length];
};

const Dashboard = () => {
  const { customers, fetchCustomers, isLoading: customersLoading } = useCustomerStore();
  const { users, fetchUsers, isLoading: usersLoading } = useUserStore();
  const { boards, fetchBoards, isLoading: boardsLoading } = useBoardStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchCustomers(),
        fetchUsers(),
        fetchBoards(),
        fetchTasks()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchCustomers, fetchUsers, fetchBoards, fetchTasks]);

  // Calculate task counts per user
  const userTaskCounts = useMemo(() => {
    const counts = users.map(user => {
      const taskCount = tasks.filter(task => task.user_id === user.id).length;
      return {
        userId: user.id,
        name: user.name,
        taskCount
      };
    });
    return counts.sort((a, b) => b.taskCount - a.taskCount);
  }, [users, tasks]);

  // Modern chart data for user tasks
  const userTaskChartData = {
    labels: userTaskCounts.map(user => user.name),
    datasets: [
      {
        label: 'Assigned Tasks',
        data: userTaskCounts.map(user => user.taskCount),
        backgroundColor: userTaskCounts.map((_, index) => generateModernColor(index)),
        borderColor: userTaskCounts.map((_, index) => generateModernColor(index).replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Calculate task status distribution (by stage/column)
  const taskStatusCounts = useMemo(() => {
    const statusMap: Record<string, number> = {};
    
    boards.forEach(board => {
      board.columns?.forEach(column => {
        if (column.name) {
          const tasksInColumn = tasks.filter(task => task.column_id === column.id).length;
          if (statusMap[column.name]) {
            statusMap[column.name] += tasksInColumn;
          } else {
            statusMap[column.name] = tasksInColumn;
          }
        }
      });
    });
    
    return statusMap;
  }, [boards, tasks]);

  // Modern chart data for task status
  const taskStatusChartData = {
    labels: Object.keys(taskStatusCounts),
    datasets: [
      {
        label: 'Tasks by Stage',
        data: Object.values(taskStatusCounts),
        backgroundColor: Object.keys(taskStatusCounts).map((_, index) => generateModernColor(index)),
        borderColor: Object.keys(taskStatusCounts).map((_, index) => generateModernColor(index).replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: 'rgba(100, 116, 139, 0.8)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(100, 116, 139, 0.8)',
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          color: 'rgba(100, 116, 139, 0.8)',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <SparklesIcon className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 mt-6 font-medium text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <SparklesIcon className="h-5 w-5" />
          <span>Updated just now</span>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customers Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
                <UsersIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{customers.length}</div>
                <div className="text-sm text-slate-500">Total customers</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Customers</h3>
              <Link 
                to="/customers" 
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View all
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{tasks.length}</div>
                <div className="text-sm text-slate-500">Active tasks</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Tasks</h3>
              <Link 
                to="/boards" 
                className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View boards
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Team Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <RectangleStackIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{users.length}</div>
                <div className="text-sm text-slate-500">Team members</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Team</h3>
              <Link 
                to="/users" 
                className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
              >
                Manage team
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks by User Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Tasks by Team Member</h2>
              <p className="text-sm text-slate-600 mt-1">Current workload distribution</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="h-80">
            <Bar 
              data={userTaskChartData} 
              options={chartOptions}
            />
          </div>
        </div>

        {/* Tasks by Status Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Tasks by Stage</h2>
              <p className="text-sm text-slate-600 mt-1">Project progress overview</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
              <SparklesIcon className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="h-80 flex items-center justify-center">
            <Pie 
              data={taskStatusChartData} 
              options={pieChartOptions}
            />
          </div>
        </div>
      </div>

      {/* Modern Team Members Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Team Workload</h2>
              <p className="text-sm text-slate-600 mt-1">Current task assignments and workload status</p>
            </div>
            <Link 
              to="/users"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200"
            >
              Manage Team
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Assigned Tasks
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Workload Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {userTaskCounts.length > 0 ? (
                userTaskCounts.map((user) => (
                  <tr key={user.userId} className="hover:bg-slate-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-slate-400 mr-2" />
                        <span className="text-sm font-medium text-slate-900">{user.taskCount}</span>
                        <span className="text-sm text-slate-500 ml-1">tasks</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.taskCount > 5 
                          ? 'bg-red-100 text-red-800' 
                          : user.taskCount > 2 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.taskCount > 5 
                          ? 'High Workload' 
                          : user.taskCount > 2 
                            ? 'Medium Workload' 
                            : 'Light Workload'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <UsersIcon className="h-8 w-8 text-indigo-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No team members yet</h3>
                      <p className="text-slate-600">Add team members to start tracking workloads and assigning tasks.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 