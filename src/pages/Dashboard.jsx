import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  DollarSign,
  Wrench,
  RefreshCw,
  AlertCircle,
  Loader,
  TrendingUp,
  Activity,
} from "lucide-react";
import Navbar from "../layout/navbar.jsx";
import {
  formatFinancialValue,
  formatDashboardValue,
} from "../utils/helperFunctions.jsx";
import { redirect } from "react-router";


const Dashboard = () => {
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
   console.log(dashboardData)
  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "/backend/api/dashboard/summary",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 200) {
        const formattedData = {
          ...result.data,
          moduleSummaries: result.data.moduleSummaries.map((module) => ({
            ...module,
            stats: module.stats.map((stat) => ({
              ...stat,
              value: formatFinancialValue(stat.value),
              originalValue: stat.value, // Keep original for tooltips
            })),
          })),
        };
        setDashboardData(formattedData);
      } else {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Icon mapping with modern styling
  const getIcon = (iconName) => {
   
    const iconProps = "w-6 h-6 text-slate-600";
    const icons = {
      BuildingIcon: <Building className={iconProps} />,
      UsersIcon: <Users className={iconProps} />,
      FileTextIcon: <FileText className={iconProps} />,
      DollarSignIcon: <DollarSign className={iconProps} />,
      WrenchIcon: <Wrench className={iconProps} />,
      TrendingUpIcon: <TrendingUp className={iconProps} />,
    };
    return icons[iconName] || <LayoutDashboard className={iconProps} />;
  };

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      fetchDashboardData();
      setLastUpdated(new Date());
      setLoading(false);
    }, 500);
  }, []);

  console.log(dashboardData);

  if (loading && !dashboardData) {
    return (
      <Navbar module={activeModule}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-lg text-gray-600">Loading Dashboard Data...</p>
        </div>
      </div>
    </Navbar>
    );
  }

  return (
    <Navbar module={activeModule}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          {/* Modern Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12">
            <div className="space-y-2 mb-4 sm:mb-0">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25">
                  <LayoutDashboard className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-slate-500 text-sm sm:text-base">
                    Welcome back to your rental management center
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50">
                  <Activity className="w-4 h-4" />
                  <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="group flex items-center space-x-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200/50 hover:border-slate-300/50 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
              >
                <RefreshCw
                  className={`w-5 h-5 ${
                    loading ? "animate-spin" : "group-hover:rotate-180"
                  } transition-transform duration-500`}
                />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
          </div>

          {/* Modern Error Alert */}
          {error && (
            <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-6 shadow-lg shadow-red-100/50">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5"></div>
              <div className="relative flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-red-800">
                    Connection Issue
                  </h3>
                  <p className="text-red-700 leading-relaxed">
                    {error}. Don't worry, we're showing you the latest cached
                    data to keep you informed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modern Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-6">
            {dashboardData?.moduleSummaries?.map((module, index) => (
              <div
                key={module.name}
                className="group relative bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-4 lg:p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/30 transition-all duration-500 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative">
                  {/* Module Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl border border-slate-200/50 group-hover:shadow-md transition-all duration-300">
                        {getIcon(module.icon)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                          {module.name}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-2 lg:gap-3">
                    {module.stats.map((stat, statIndex) => (
                      <div
                        key={stat.label}
                        className={`relative p-2 sm:p-3 lg:p-4 rounded-2xl ${stat.color} hover:scale-105 transition-all duration-300 cursor-pointer group/stat`}
                        style={{
                          animationDelay: `${index * 100 + statIndex * 50}ms`,
                        }}
                      >
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative text-center space-y-1 sm:space-y-2">
                          <div className="text-xs sm:text-xs lg:text-sm font-medium text-slate-600 uppercase tracking-wider break-words hyphens-auto leading-tight">
                            {stat.label}
                          </div>
                          <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-800 break-words leading-tight">
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modern Loading Overlay */}
          {loading && dashboardData && (
            <div className="fixed top-0 left-0 right-0 z-50">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-2xl">
                <div className="flex items-center justify-center py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="font-medium">
                      Refreshing dashboard data...
                    </span>
                  </div>
                </div>
                {/* Animated progress bar */}
                <div className="h-1 bg-white/20">
                  <div className="h-full bg-white/40 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Navbar>
  );
};

export default Dashboard;

export async function loader() {
  const token = localStorage.getItem("token");

  // If no token, redirect to login
  if (!token) {
    console.log("No token found, redirecting to login");
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

    switch (userData.status) {
      case 200:
        const userRole =
          userData.user?.role || localStorage.getItem("userRole");
        const allowedRoles = ["Super Admin", "Admin", "Manager"];

        if (!userRole || !allowedRoles.includes(userRole)) {
          console.log("User role not authorized for dashboard:", userRole);
          return redirect("/");
        }

        console.log(
          "Token valid, allowing dashboard access for role:",
          userRole
        );

        if (userData.user) {
          localStorage.setItem("user", JSON.stringify(userData.user));
          localStorage.setItem("userRole", userData.user.role);
          localStorage.setItem(
            "name",
            userData.user.name ||
              `${userData.user.firstName} ${userData.user.lastName}`
          );
        }

        return {
          user: userData.user,
          isAuthenticated: true,
          timestamp: new Date().toISOString(),
        };

      case 401:
        console.log("Token verification failed:", userData.message);
        ["token", "user", "name", "userRole", "userId"].forEach((key) =>
          localStorage.removeItem(key)
        );
        return redirect("/?message=session_expired");

      case 403:
        console.log("Account deactivated");
        ["token", "user", "name", "userRole", "userId"].forEach((key) =>
          localStorage.removeItem(key)
        );
        return redirect("/?message=account_deactivated");

      default:
        console.log("Unexpected verification response:", userData);
        ["token", "user", "name", "userRole", "userId"].forEach((key) =>
          localStorage.removeItem(key)
        );
        return redirect("/?message=verification_failed");
    } 
  } catch (error) {
    console.error("Token verification error:", error);
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return redirect("/?message=network_error");
    }
    ["token", "user", "name", "userRole", "userId"].forEach((key) =>
      localStorage.removeItem(key)
    );
    return redirect("/?message=verification_error");
  }
}
