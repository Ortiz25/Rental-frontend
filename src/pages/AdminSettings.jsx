import React, { useEffect, useState } from "react";
import { Users, Shield, Lock, Bell, Settings, ArrowLeft, WalletCards, LogOut, PanelLeftOpen, PanelLeftClose, X, Menu } from "lucide-react";
import { redirect, useNavigate } from "react-router";
import Navbar from "../layout/navbar.jsx";
import UserManagement from "../components/UserManagement.jsx";
import PaymentMethodsManagement from "../components/PaymentMethods.jsx";
import SecuritySettings from "../components/SecuritySettings.jsx";
import NotificationSettings from "../components/NotificationSettings.jsx";
import SystemSettings from "../components/SystemSettings.jsx";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMediumOrLarger: window.innerWidth >= 1024
  });  
  const navigate = useNavigate();

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

  // Handle screen resize
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
  }, []);

  const settingsTabs = [
    {
      id: "users",
      name: "User Management",
      icon: <Users className="w-5 h-5" />,
    },
    // {
    //   id: "security",
    //   name: "Security Settings",
    //   icon: <Lock className="w-5 h-5" />,
    // },
    // {
    //   id: "notifications",
    //   name: "Notification Settings",
    //   icon: <Bell className="w-5 h-5" />,
    // },
    {
      id: "system",
      name: "System Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleBackNavigation = () => {
    navigate('/');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setUser(null);
      navigate('/');
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/');
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Settings Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div
          className={`h-full ${
            isSidebarCollapsed && screenSize.isMediumOrLarger ? "w-16" : "w-64"
          } bg-white border-r border-gray-200 shadow-sm transition-all duration-300 overflow-hidden flex flex-col`}
        >
          {/* Header with Back Button */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className={`flex items-center ${isSidebarCollapsed && screenSize.isMediumOrLarger ? 'justify-center' : 'space-x-3'} mb-4`}>
              {!(isSidebarCollapsed && screenSize.isMediumOrLarger) && (
                <button
                  onClick={handleBackNavigation}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              {!(isSidebarCollapsed && screenSize.isMediumOrLarger) && (
                <h1 className="text-xl font-bold text-gray-900">Admin Settings</h1>
              )}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden ml-auto text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {!(isSidebarCollapsed && screenSize.isMediumOrLarger) && (
              <p className="text-sm text-gray-500">Manage system configuration and user access</p>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (!screenSize.isMediumOrLarger) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed && screenSize.isMediumOrLarger ? 'justify-center' : 'space-x-3'
                  } px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={isSidebarCollapsed && screenSize.isMediumOrLarger ? tab.name : ''}
                >
                  <span className="flex-shrink-0">{tab.icon}</span>
                  {!(isSidebarCollapsed && screenSize.isMediumOrLarger) && (
                    <span className="text-sm font-medium">{tab.name}</span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* User Profile & Logout Section */}
          <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
            {isSidebarCollapsed && screenSize.isMediumOrLarger ? (
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
        className={`flex-1 flex flex-col overflow-hidden ${
          isSidebarCollapsed && screenSize.isMediumOrLarger
            ? "lg:ml-16"
            : "lg:ml-64"
        } transition-all duration-300`}
      >
        {/* Content Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
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
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {settingsTabs.find(tab => tab.id === activeTab)?.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Configure and manage your system settings
                  </p>
                </div>
              </div>
              
              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <button 
                  onClick={handleBackNavigation}
                  className="hover:text-gray-700 transition-colors"
                >
                  Dashboard
                </button>
                <span>/</span>
                <span className="text-gray-900">Admin Settings</span>
                <span>/</span>
                <span className="text-gray-900">
                  {settingsTabs.find(tab => tab.id === activeTab)?.name}
                </span>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-8">
            {activeTab === "users" && <UserManagement />}
            {/* {activeTab === "security" && <SecuritySettings />}
            {activeTab === "notifications" && <NotificationSettings />} */}
            {activeTab === "system" && <SystemSettings />}
          </div>
        </main>
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

export default AdminSettings;
export async function loader() {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/");
  }
  
  try {
    const response = await fetch("/backend/api/auth/verifyToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const userData = await response.json();
     
    if (userData.status !== 200) {
      const keysToRemove = ["token", "user", "name", "userRole", "userId"];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      return redirect("/");
    }

    // Check role permissions
    const allowedRoles = ["Super Admin", "Admin", "Manager", "Staff"];
    const userRole = userData.user?.role || localStorage.getItem("userRole");

    if (!userRole || !allowedRoles.includes(userRole)) {
      return redirect("/");
    }

    return {
      user: userData.user,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Auth check error:", error);
    const keysToRemove = ["token", "user", "name", "userRole", "userId"];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    return redirect("/");
  }
}