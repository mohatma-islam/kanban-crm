import type { ReactNode } from 'react';
import Navbar from './Navbar';
import useAuthStore from '../../store/authStore';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Desktop Layout with Sidebar */}
      <div className={`${isAuthenticated ? 'lg:pl-64' : ''}`}>
        {/* //min heigh */}
        <main className="py-8 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white py-4 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} Kanban CRM. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;  