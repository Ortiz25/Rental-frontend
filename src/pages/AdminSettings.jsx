import React, { useState } from "react";
import { Users, Shield, Lock, Bell, Settings } from "lucide-react";
import Navbar from "../layout/navbar.jsx";
import UserManagement from "../components/UserManagement.jsx";
import RolesManagement from "../components/EditUserRole.jsx";
import SecuritySettings from "../components/SecuritySettings.jsx";
import NotificationSettings from "../components/NotificationSettings.jsx";
import SystemSettings from "../components/SystemSettings.jsx";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [activeModule, setActiveModule] = useState('Admin Settings')

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

  return (
    <Navbar module={activeModule}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Settings Sidebar */}
        <div className="w-64 bg-white border-r">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold">Admin Settings</h1>
          </div>
          <nav className="p-4">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === "users" && <UserManagement />}
            {activeTab === "roles" && <RolesManagement />}
            {activeTab === "security" && <SecuritySettings />}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "system" && <SystemSettings />}
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default AdminSettings;
