import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  AlertCircle,
  Loader
} from 'lucide-react';
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigate,
  useNavigation,
} from "react-router";
import Navbar from '../layout/navbar.jsx';
import { useStore } from '../store/store.jsx';

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/backend/api/dashboard/summary', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
       console.log(result.data)
      if (result.status === 200) {
        setDashboardData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error.message);

    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Icon mapping
  const getIcon = (iconName) => {
    const icons = {
      BuildingIcon: <BuildingIcon />,
      UsersIcon: <UsersIcon />,
      FileTextIcon: <FileTextIcon />,
      DollarSignIcon: <DollarSignIcon />,
      WrenchIcon: <WrenchIcon />
    };
    return icons[iconName] || <LayoutDashboard />;
  };

  if (loading && !dashboardData) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <Loader className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-lg text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar module={activeModule}>
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold flex items-center">
            <LayoutDashboard className="mr-3 size-6 sm:size-8 md:size-12" /> 
            Rental Management Dashboard
          </h1>
          
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Unable to fetch live data
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error}. Showing cached or default data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid xl:grid-cols-3 gap-4">
          {dashboardData?.moduleSummaries?.map((module) => (
            <div 
              key={module.name} 
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                {getIcon(module.icon)}
                <h2 className="ml-2 text-sm sm:text-base font-semibold">
                  {module.name}
                </h2>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {module.stats.map((stat) => (
                  <div 
                    key={stat.label} 
                    className={`p-2 sm:p-3 rounded text-center flex flex-col justify-center ${stat.color}`}
                  >
                    <div className="text-xs sm:text-sm text-gray-600 w-full">
                      {stat.label}
                    </div>
                    <div className="text-base sm:text-xl font-bold w-full">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Loading Overlay */}
        {loading && dashboardData && (
          <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 z-50">
            <div className="flex items-center justify-center">
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Updating dashboard data...
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
};

export default Dashboard;


export async function loader() {
  const token = localStorage.getItem("token");

  // If no token, redirect to login
  if (!token) {
    console.log('No token found, redirecting to login');
    return redirect("/");
  }

  try {
    const url = "/backend/api/auth/verifyToken";
    const data = { token: token };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const userData = await response.json();
    console.log('Token verification response:', userData);

    // Handle different verification responses
    switch (userData.status) {
      case 200:
        // Token is valid, check if user has dashboard access
        const userRole = userData.user?.role || localStorage.getItem('userRole');
        const allowedRoles = ['Super Admin', 'Admin', 'Manager', 'Staff'];
        
        if (!userRole || !allowedRoles.includes(userRole)) {
          console.log('User role not authorized for dashboard:', userRole);
          // Could redirect to a "no access" page or tenant portal
          return redirect("/");
        }

        console.log('Token valid, allowing dashboard access for role:', userRole);
        
        // Update stored user data if needed
        if (userData.user) {
          localStorage.setItem("user", JSON.stringify(userData.user));
          localStorage.setItem("userRole", userData.user.role);
          localStorage.setItem("name", userData.user.name || `${userData.user.firstName} ${userData.user.lastName}`);
        }

        // Return user data for the dashboard component to use
        return {
          user: userData.user,
          isAuthenticated: true,
          timestamp: new Date().toISOString()
        };

      case 401:
        // Token expired or invalid
        console.log('Token verification failed:', userData.message);
        
        // Clear all stored authentication data
        const keysToRemove = ["token", "user", "name", "userRole", "userId"];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Redirect to login with message
        return redirect("/?message=session_expired");

      case 403:
        // Account deactivated
        console.log('Account deactivated');
        
        // Clear stored data
        const keysToRemove403 = ["token", "user", "name", "userRole", "userId"];
        keysToRemove403.forEach(key => localStorage.removeItem(key));
        
        // Redirect to login with deactivated message
        return redirect("/?message=account_deactivated");

      default:
        // Other errors
        console.log('Unexpected verification response:', userData);
        
        // Clear stored data on unexpected response
        const keysToRemoveDefault = ["token", "user", "name", "userRole", "userId"];
        keysToRemoveDefault.forEach(key => localStorage.removeItem(key));
        
        return redirect("/?message=verification_failed");
    }

  } catch (error) {
    console.error('Token verification error:', error);
    
    // Handle network errors or other issues
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('Network error during token verification');
      // Don't clear token on network errors - might be temporary
      // Just redirect to login with error message
      return redirect("/?message=network_error");
    }
    
    // For other errors, clear stored data
    const keysToRemoveCatch = ["token", "user", "name", "userRole", "userId"];
    keysToRemoveCatch.forEach(key => localStorage.removeItem(key));
    
    return redirect("/?message=verification_error");
  }
}
