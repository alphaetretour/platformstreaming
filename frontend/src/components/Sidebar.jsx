import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Tv, 
  CreditCard, 
  User, 
  Settings,
  LogOut,
  Home
} from 'lucide-react';

function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { 
      name: 'Tableau de bord', 
      path: '/dashboard', 
      icon: LayoutDashboard,
      exact: true
    },
    { 
      name: 'Plateformes', 
      path: '/platforms', 
      icon: Tv 
    },
    { 
      name: 'Abonnements', 
      path: '/subscriptions', 
      icon: CreditCard 
    },
    { 
      name: 'Profil', 
      path: '/profile', 
      icon: User 
    },
  ];

  const NavItem = ({ item }) => {
    const isActive = item.exact 
      ? location.pathname === item.path 
      : location.pathname.startsWith(item.path);

    return (
      <NavLink
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive 
            ? 'bg-primary-100 text-primary-700 font-medium' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <item.icon className="w-5 h-5" />
        <span>{item.name}</span>
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-white border-r border-gray-200 transition-transform duration-300">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">StreamManage</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>DÃ©connexion</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
