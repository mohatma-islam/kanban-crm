import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import BoardList from './components/board/BoardList';
import BoardDetail from './components/board/BoardDetails';
import CustomerList from './components/customer/CustomerList';
import Calendar from './components/task/Calender';
import CustomerDetail from './components/customer/CustomerDetail';
import Dashboard from './components/dashboard/Dashboard';
import UserList from './components/user/UserList';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { getCurrentUser, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated 
            ? <Navigate to="/dashboard" /> 
            : (
              <Layout>
                <LoginForm />
              </Layout>
            )
        } />
        
        <Route path="/register" element={
          isAuthenticated 
            ? <Navigate to="/dashboard" /> 
            : (
              <Layout>
                <RegisterForm />
              </Layout>
            )
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/boards" element={
          <ProtectedRoute>
            <Layout>
              <BoardList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute>
            <Layout>
              <CustomerList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <Layout>
              <UserList />
            </Layout>
          </ProtectedRoute>
        } />
        {/* <Route path="/customers/:id" element={
          <ProtectedRoute>
            <Layout>
              <CustomerDetail />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/customers/:id/edit" element={
          <ProtectedRoute>
            <Layout>
              <CustomerDetail />
            </Layout>
          </ProtectedRoute>
        } /> */}
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout>
              <Calendar />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/boards/:id" element={
          <ProtectedRoute>
            <Layout>
              <BoardDetail />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        
        <Route path="*" element={
          <Layout>
            <div className="text-center py-16">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-xl">Page not found</p>
            </div>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App; 