import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  BuildingIcon, 
  UsersIcon, 
  FileTextIcon, 
  DollarSignIcon, 
  WrenchIcon, 
  BarChartIcon, 
  MailIcon, 
  ShieldCheckIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  HousePlus,
  UserCircle,
  IdCard,
  Settings,
  LogOut
} from 'lucide-react';
import { useStore } from '../store/store';

const Navbar = ({module, children}) => {
  const {isSidebarCollapsed, setIsSidebarCollapsed} = useStore();
  const [activeModule, setActiveModule] = useState(module);
  const [user, setUser] = useState(null);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMediumOrLarger: window.innerWidth >= 768
  });
  const navigate = useNavigate();

  console.log(activeModule, screenSize);

  // Get user data from localStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setScreenSize({
        width: newWidth,
        isMediumOrLarger: newWidth >= 768
      });
      
      if (newWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarCollapsed]);

  const handleLogout = () => {
    try {
      // Clear all authentication-related data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear user state
      setUser(null);
      
      // Navigate to home/login page
      navigate('/');
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate even if there's an error clearing storage
      navigate('/');
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.username) {
      return user.username
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    }
    return 'U';
  };

  const allModules = [
    { 
      name: 'Dashboard', 
      icon: <LayoutDashboard size={20} />,
      route: "/",
      roles: ['Admin', 'Manager', 'Owner', "Super Admin"] // Available for all roles except Tenant
    },
    { 
      name: 'Tenant Dashboard', 
      icon: <IdCard size={20} />,
      route: "/tenant_dash",
      roles: ['Tenant'] // Only available for Tenant role
    },
    { 
      name: 'Property Management', 
      icon: <BuildingIcon size={20} />,
      route: "/property",
      roles: ['Admin', 'Manager', 'Owner', "Super Admin"]
    },
    { 
      name: 'Tenant Management', 
      icon: <UsersIcon size={20} />,
      route: "/tenant",
      roles: ['Admin', 'Manager', 'Owner', "Super Admin"]
    },
    { 
      name: 'Lease Management', 
      icon: <FileTextIcon size={20} />,
      route: "/lease",
      roles: ['Admin', 'Manager', 'Owner', "Super Admin"]
    },
    { 
      name: 'Rent Collection', 
      icon: <DollarSignIcon size={20} />,
      route: "/rent",
      roles: ['Admin', 'Manager', 'Owner', "Super Admin"]
    },
    { 
      name: 'Maintenance', 
      icon: <WrenchIcon size={20} />,
      route: "/maintenance",
      roles: ['Admin', 'Manager', 'Owner', "Super Admin"]
    },
    { 
      name: 'Financial Reports', 
      icon: <BarChartIcon size={20} />,
      route: "/finance",
      roles: ['Admin', 'Manager', 'Owner', "Super Admin"]
    },
    { 
      name: 'Document Management', 
      icon: <ShieldCheckIcon size={20} />,
      route: "/documents",
      roles: ['Admin', 'Manager', 'Owner', "Super Admin"]
    },
    { 
      name: 'Communication', 
      icon: <MailIcon size={20} />,
      route: "/communications",
      roles: ['Admin', 'Manager', 'Owner', "Super Admin"]
    },
    { 
      name: 'Admin Settings', 
      icon: <Settings size={20} />,
      route: "/admin_settings",
      roles: ['Admin', "Super Admin"]
    }
  ];

  // Filter modules based on user role
  const modules = allModules.filter(module => {
    const userRole = user?.role || user?.userRole || 'Guest';
    return module.roles.includes(userRole);
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } ${screenSize.isMediumOrLarger ? 'relative' : 'absolute z-20 h-full'}`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg">
              <HousePlus className="text-white" size={24} />
            </div>
            {!isSidebarCollapsed && (
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-800">Rental Manager</h1>
                <p className="text-xs text-gray-500">Property Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {modules.map((item) => (
              <NavLink
                key={item.name}
                to={item.route}
                className={({ isActive }) => `
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${activeModule === item.name 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isSidebarCollapsed ? 'justify-center' : ''}
                `}
                onClick={() => setActiveModule(item.name)}
                title={isSidebarCollapsed ? item.name : ''}
              >
                <span className={`flex-shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`}>
                  {item.icon}
                </span>
                {!isSidebarCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          {isSidebarCollapsed ? (
            /* Collapsed state - Stack user avatar and logout button vertically */
            <div className="flex flex-col items-center space-y-2">
              <div 
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
                title={user ? `${user.username} (${user.role || user.userRole})` : 'User Profile'}
              >
                <span className="text-white text-sm font-medium">
                  {getUserInitials()}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            /* Expanded state - Show full user info with logout button */
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getUserInitials()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || user?.userRole || 'Role'}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!screenSize.isMediumOrLarger && !isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Menu size={20} />
              </button>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">{activeModule}</h1>
                <p className="text-sm text-gray-500">Manage your rental properties efficiently</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* You can add notification bell, search, etc. here */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome back{user?.username ? `, ${user.username}` : ''}!</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Navbar;