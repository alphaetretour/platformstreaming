import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  // Don't show layout for auth pages
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(location.pathname);

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        {user && <Sidebar />}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${user ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
          
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default Layout;
