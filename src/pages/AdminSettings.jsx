import React, { useState } from "react";
import { Users, Shield, Lock, Bell, Settings, ArrowLeft } from "lucide-react";
import { redirect, useNavigate } from "react-router";
import Navbar from "../layout/navbar.jsx";
import UserManagement from "../components/UserManagement.jsx";
import RolesManagement from "../components/EditUserRole.jsx";
import SecuritySettings from "../components/SecuritySettings.jsx";
import NotificationSettings from "../components/NotificationSettings.jsx";
import SystemSettings from "../components/SystemSettings.jsx";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [activeModule, setActiveModule] = useState('Admin Settings');
  const navigate = useNavigate();

  const settingsTabs = [
    {
      id: "users",
      name: "User Management",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "roles",
      name: "Roles & Permissions",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      id: "security",
      name: "Security Settings",
      icon: <Lock className="w-5 h-5" />,
    },
    {
      id: "notifications",
      name: "Notification Settings",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "system",
      name: "System Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleBackNavigation = () => {
    // Navigate back to dashboard or previous page
    navigate('/'); // Change this to your desired route
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Settings Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
        {/* Header with Back Button */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={handleBackNavigation}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Admin Settings</h1>
          </div>
          <p className="text-sm text-gray-500">Manage system configuration and user access</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-4">
          <div className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="flex-shrink-0">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Quick Actions (Optional) */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">System Status</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">All systems operational</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {settingsTabs.find(tab => tab.id === activeTab)?.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configure and manage your system settings
                </p>
              </div>
              
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
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
            {activeTab === "roles" && <RolesManagement />}
            {activeTab === "security" && <SecuritySettings />}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "system" && <SystemSettings />}
          </div>
        </main>
      </div>
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
    const response = await fetch("http://localhost:5020/api/auth/verifyToken", {
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