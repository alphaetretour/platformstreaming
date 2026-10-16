import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, Search } from 'lucide-react';

function Header() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <header className="fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-200 transition-all duration-300">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-medium text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-sm text-gray-900">{user.name || 'Utilisateur'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)} />
      )}
    </header>
  );
}

export default Header;
