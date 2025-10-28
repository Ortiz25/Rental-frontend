import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Calendar,
} from "lucide-react";

import OverviewTab from "../components/overviewTab.jsx";
import AnalyticsTab from "../components/analyticsTab.jsx";
import ExpenseManagementTab from "../components/expenseMgtTab.jsx";

import GenerateReportModal from "../components/modals/GenerateReportModal.jsx";

import Navbar from "../layout/navbar.jsx";
import apiService from "../services/financialApiServices.jsx";
import { redirect } from "react-router";

const FinancialReports = () => {
  const [activeModule, setActiveModule] = useState('Financial Reports')
  const [financialData, setFinancialData] = useState({
    summary: {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      occupancyRate: 0,
      pendingPayments: 0,
      maintenanceCosts: 0,
      changes: { revenue: 0, expenses: 0, netIncome: 0 },
    },
    monthlyData: [],
    expenseBreakdown: [],
    recentTransactions: [],
    analytics: null,
    paymentTrends: [],
    propertyPerformance: [],
  });
  
  // Filter states
  const [dateRange, setDateRange] = useState("month"); // month, quarter, year, specific-month
  const [selectedMonth, setSelectedMonth] = useState(null); // 1-12 or null
  const [selectedYear, setSelectedYear] = useState(null); // YYYY or null
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState("all");

  // Load financial data when filters change
  useEffect(() => {
    loadFinancialData();
  }, [dateRange, selectedProperty, selectedMonth, selectedYear]);

  const loadFinancialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const propertyFilter = selectedProperty !== "all" ? selectedProperty : null;
      
      // Build filter options based on current selections
      const filterOptions = {
        propertyId: propertyFilter
      };

      // Add date filters based on selection
      if (dateRange === "specific-month" && selectedMonth) {
        filterOptions.month = selectedMonth;
        filterOptions.year = selectedYear || new Date().getFullYear();
      } else {
        filterOptions.period = dateRange;
      }

      console.log('📅 Loading data with filters:', filterOptions);

      // Load core financial data with dynamic filters
      const [summaryData, monthlyData, expenseData, transactionsData] =
        await Promise.all([
          apiService.getFinancialSummary(filterOptions),
          apiService.getMonthlyData(12, propertyFilter),
          apiService.getExpenseBreakdown(filterOptions),
          apiService.getRecentTransactions(15, propertyFilter),
        ]);

      console.log('📊 Summary data received:', summaryData);

      setFinancialData((prev) => ({
        ...prev,
        summary: summaryData.summary || summaryData,
        monthlyData: monthlyData.monthlyData || monthlyData,
        expenseBreakdown: expenseData.expenseBreakdown || expenseData,
        recentTransactions: transactionsData.recentTransactions || transactionsData,
      }));

      // Load analytics data if analytics tab is active
      if (activeTab === "analytics") {
        await loadAnalyticsData();
      }
    } catch (err) {
      setError("Failed to load financial data. Please try again.");
      console.error("Error loading financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const propertyFilter = selectedProperty !== "all" ? selectedProperty : null;
      
      const filterOptions = {
        propertyId: propertyFilter
      };

      if (dateRange === "specific-month" && selectedMonth) {
        filterOptions.month = selectedMonth;
        filterOptions.year = selectedYear || new Date().getFullYear();
      } else {
        filterOptions.period = dateRange;
      }
      
      const [analyticsData, trendsData, performanceData] = await Promise.all([
        apiService.getAnalytics(filterOptions),
        apiService.getPaymentTrends(6, propertyFilter),
        apiService.getPropertyPerformance(filterOptions),
      ]);

      setFinancialData((prev) => ({
        ...prev,
        analytics: analyticsData.analytics || analyticsData,
        paymentTrends: trendsData.paymentTrends || trendsData,
        propertyPerformance: performanceData.propertyPerformance || performanceData,
      }));
    } catch (err) {
      console.error("Error loading analytics data:", err);
    }
  };

  const handlePropertyChange = (propertyId) => {
    setSelectedProperty(propertyId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFinancialData();
    setRefreshing(false);
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === "analytics" && !financialData.analytics) {
      await loadAnalyticsData();
    }
  };

  const handleDateRangeChange = (newDateRange) => {
    console.log('🔄 Period changed to:', newDateRange);
    setDateRange(newDateRange);
    
    // Reset month/year selection when switching away from specific-month
    if (newDateRange !== "specific-month") {
      setSelectedMonth(null);
      setSelectedYear(null);
      setShowMonthPicker(false);
    } else {
      setShowMonthPicker(true);
    }
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const getDisplayPeriodLabel = () => {
    if (dateRange === "specific-month" && selectedMonth) {
      const monthNames = apiService.getMonthOptions();
      const monthName = monthNames.find(m => m.value === parseInt(selectedMonth))?.label;
      const year = selectedYear || new Date().getFullYear();
      return `${monthName} ${year}`;
    }
    
    switch (dateRange) {
      case "month": return "This Month";
      case "quarter": return "This Quarter";
      case "year": return "This Year";
      default: return "This Month";
    }
  };

  if (loading) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading financial data...</p>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar module={activeModule}>
      <div className="min-h-screen bg-gray-50">
        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <span className="text-red-700 flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-3 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow border border-gray-100">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Financial Reports
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {getDisplayPeriodLabel()}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    />
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </button>
                </div>
              </div>

              {/* Tabs and Controls */}
              <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between border-t border-gray-200 pt-6">
                <div className="flex space-x-1 mb-4 lg:mb-0">
                  <button
                    onClick={() => handleTabChange("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "overview"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => handleTabChange("analytics")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "analytics"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => handleTabChange("expenses")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "expenses"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Manage Expenses
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Period Selection */}
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={dateRange}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                  >
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="specific-month">Specific Month</option>
                  </select>

                  {/* Month/Year Selection (visible when specific-month is selected) */}
                  {showMonthPicker && (
                    <>
                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedMonth || ""}
                        onChange={(e) => handleMonthChange(e.target.value)}
                      >
                        <option value="">Select Month</option>
                        {apiService.getMonthOptions().map(month => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>

                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedYear || new Date().getFullYear()}
                        onChange={(e) => handleYearChange(e.target.value)}
                      >
                        {[...Array(5)].map((_, i) => {
                          const year = new Date().getFullYear() - i;
                          return <option key={year} value={year}>{year}</option>;
                        })}
                      </select>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <OverviewTab 
              financialData={financialData} 
              onPropertyChange={handlePropertyChange}
              selectedPropertyProp={selectedProperty}
              dateRange={dateRange}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsTab 
              financialData={financialData}
              dateRange={dateRange}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}

          {activeTab === "expenses" && (
            <ExpenseManagementTab
              financialData={financialData}
              onExpenseUpdate={loadFinancialData}
              dateRange={dateRange}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}

          {/* Report Generation Modal */}
          <GenerateReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            onError={setError}
            dateRange={dateRange}
            selectedProperty={selectedProperty}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      </div>
    </Navbar>
  );
};

export default FinancialReports;

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
    const allowedRoles = ["Super Admin", "Admin", "Manager"];
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