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
  LogOut,
  X,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';
import { useStore } from '../store/store';

const Navbar = ({module, children}) => {
  const {isSidebarCollapsed, setIsSidebarCollapsed} = useStore();
  const [activeModule, setActiveModule] = useState(module);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMediumOrLarger: window.innerWidth >= 1024
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
        isMediumOrLarger: newWidth >= 1024
      });
      
      // Reset collapse state on mobile screens
      if (newWidth < 1024) {
        setIsSidebarCollapsed(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div
          className={`h-full ${
            isSidebarCollapsed && screenSize.isMediumOrLarger ? "w-16" : "w-64"
          } bg-white shadow-xl px-3 py-4 transition-all duration-300 overflow-y-auto border-r border-gray-200`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div
              className={`flex items-center space-x-3 ${
                isSidebarCollapsed && screenSize.isMediumOrLarger
                  ? "justify-center"
                  : ""
              }`}
            >
              <div className="bg-blue-600 p-2 rounded-lg">
                <HousePlus className="text-white" size={24} />
              </div>
              {!(isSidebarCollapsed && screenSize.isMediumOrLarger) && (
                <div>
                  <h1 className="text-lg font-bold text-gray-800">Rental Manager</h1>
                  <p className="text-xs text-gray-500">Property Management</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-1">
              {modules.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.route}
                  className={({ isActive }) => `
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${activeModule === item.name || isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${isSidebarCollapsed && screenSize.isMediumOrLarger ? 'justify-center' : ''}
                  `}
                  onClick={() => {
                    setActiveModule(item.name);
                    // Close sidebar on mobile after navigation
                    if (!screenSize.isMediumOrLarger) {
                      setSidebarOpen(false);
                    }
                  }}
                  title={isSidebarCollapsed && screenSize.isMediumOrLarger ? item.name : ''}
                >
                  <span className={`flex-shrink-0 ${isSidebarCollapsed && screenSize.isMediumOrLarger ? '' : 'mr-3'}`}>
                    {item.icon}
                  </span>
                  {!(isSidebarCollapsed && screenSize.isMediumOrLarger) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
            {isSidebarCollapsed && screenSize.isMediumOrLarger ? (
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
      </div>

      {/* Main Content Area */}
      <div
        className={`${
          isSidebarCollapsed && screenSize.isMediumOrLarger
            ? "lg:pl-16"
            : "lg:pl-64"
        } transition-all duration-300`}
      >
        <div className="min-h-screen">
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-30">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 mr-4"
                >
                  <Menu size={20} />
                </button>
                
                {/* Desktop collapse toggle */}
                {isSidebarCollapsed ? (
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 mr-4"
                  >
                    <PanelLeftOpen className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 mr-4"
                  >
                    <PanelLeftClose className="h-5 w-5" />
                  </button>
                )}
                
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{activeModule}</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">Manage your rental properties efficiently</p>
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
          <main className="bg-gray-50 min-h-[calc(100vh-80px)]">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Navbar;