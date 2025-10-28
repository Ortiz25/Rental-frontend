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

  // Complete color mapping with inline styles
  const colorStyles = {
    'bg-blue-100': { backgroundColor: '#dbeafe', borderColor: '#93c5fd' },
    'bg-green-100': { backgroundColor: '#dcfce7', borderColor: '#86efac' },
    'bg-red-100': { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
    'bg-red-200': { backgroundColor: '#fecaca', borderColor: '#f87171' },
    'bg-yellow-100': { backgroundColor: '#fef3c7', borderColor: '#fde047' },
    'bg-purple-100': { backgroundColor: '#f3e8ff', borderColor: '#d8b4fe' },
    'bg-indigo-100': { backgroundColor: '#e0e7ff', borderColor: '#a5b4fc' },
    'bg-orange-100': { backgroundColor: '#ffedd5', borderColor: '#fdba74' },
    'bg-pink-100': { backgroundColor: '#fce7f3', borderColor: '#f9a8d4' },
    'bg-cyan-100': { backgroundColor: '#cffafe', borderColor: '#67e8f9' },
    'bg-emerald-100': { backgroundColor: '#d1fae5', borderColor: '#6ee7b7' },
    'bg-teal-100': { backgroundColor: '#ccfbf1', borderColor: '#5eead4' },
    'bg-gray-100': { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' },
  };

  const getColorStyle = (colorClass) => {
    return colorStyles[colorClass] || colorStyles['bg-gray-100'];
  };

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
        "http://localhost:5020/api/dashboard/summary",
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
              originalValue: stat.value,
            })),
          })),
        };
        setDashboardData(formattedData);
        setLastUpdated(new Date());
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
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Icon mapping
  const getIcon = (iconName) => {
    const iconProps = "w-5 h-5 sm:w-6 sm:h-6 text-slate-700";
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

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !dashboardData) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <Loader className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
            <p className="mt-4 text-lg text-gray-600 font-medium">
              Loading Dashboard Data...
            </p>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar module={activeModule}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
          {/* Modern Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
                  Dashboard
                </h1>
                <p className="text-slate-600 text-sm sm:text-base mt-0.5">
                  Rental management overview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                  <Activity className="w-4 h-4" />
                  <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 font-medium"
              >
                <RefreshCw
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">
                  Connection Issue
                </h3>
                <p className="text-red-700 text-sm leading-relaxed">
                  {error}. Showing cached data to keep you informed.
                </p>
              </div>
            </div>
          )}

          {/* Dashboard Grid */}
          <div className="space-y-5 sm:space-y-6">
            {dashboardData?.moduleSummaries?.map((module, index) => {
              const isFinancialSummary = module.name === "Financial Summary";

              return (
                <div
                  key={module.name}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Module Header */}
                  <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className="p-2.5 rounded-xl border border-slate-200/50"
                        style={
                          isFinancialSummary
                            ? { background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }
                            : { background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }
                        }
                      >
                        {getIcon(module.icon)}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                          {module.name}
                        </h2>
                        {isFinancialSummary && (
                          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Complete financial overview for the current period
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid - Enhanced for Financial Summary */}
                  <div
                    className={`p-4 sm:p-5 lg:p-6 grid gap-3 sm:gap-4 ${
                      isFinancialSummary
                        ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5"
                        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    }`}
                  >
                    {module.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className={`rounded-xl p-3.5 sm:p-4 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer border border-slate-200/40 ${
                          isFinancialSummary ? "min-h-[115px]" : "min-h-[105px]"
                        } flex flex-col justify-between`}
                        style={getColorStyle(stat.color)}
                      >
                        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 leading-tight">
                          {stat.label}
                        </div>
                        <div>
                          <div
                            className={`font-bold text-slate-900 mb-1 leading-tight ${
                              isFinancialSummary
                                ? "text-base sm:text-lg lg:text-xl"
                                : "text-xl sm:text-2xl lg:text-3xl"
                            }`}
                          >
                            {stat.value}
                          </div>
                          {stat.sublabel && (
                            <div className="text-xs text-slate-600 font-medium leading-tight mt-1">
                              {stat.sublabel}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loading Overlay */}
          {loading && dashboardData && (
            <div className="fixed top-0 left-0 right-0 z-50">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg">
                <div className="flex items-center justify-center py-3 px-4 sm:py-3.5 sm:px-6">
                  <Loader className="w-5 h-5 animate-spin mr-3" />
                  <span className="font-medium text-sm sm:text-base">
                    Refreshing dashboard data...
                  </span>
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

  if (!token) {
    console.log("No token found, redirecting to login");
    return redirect("/");
  }

  try {
    const url = "http://localhost:5020/api/auth/verifyToken";
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