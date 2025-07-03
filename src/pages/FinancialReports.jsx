import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  Printer,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  PieChart,
} from "lucide-react";

import OverviewTab from "../components/overviewTab.jsx";
import AnalyticsTab from "../components/AnalyticsTab.jsx";
import ExpenseManagementTab from "../components/expenseMgtTab.jsx";

import GenerateReportModal from "../components/modals/GenerateReportModal.jsx";

import Navbar from "../layout/navbar.jsx";
import { apiService } from "../services/financialApiServices.jsx";

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
  
  const [dateRange, setDateRange] = useState("month");
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Load financial data on component mount and when dateRange changes
  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const loadFinancialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load core financial data
      const [summaryData, monthlyData, expenseData, transactionsData] =
        await Promise.all([
          apiService.getFinancialSummary(dateRange),
          apiService.getMonthlyData(12),
          apiService.getExpenseBreakdown(dateRange),
          apiService.getRecentTransactions(15),
        ]);

      setFinancialData((prev) => ({
        ...prev,
        summary: summaryData.summary,
        monthlyData: monthlyData.monthlyData,
        expenseBreakdown: expenseData.expenseBreakdown,
        recentTransactions: transactionsData.recentTransactions,
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
      const [analyticsData, trendsData, performanceData] = await Promise.all([
        apiService.getAnalytics(dateRange),
        apiService.getPaymentTrends(6),
        apiService.getPropertyPerformance(dateRange),
      ]);

      setFinancialData((prev) => ({
        ...prev,
        analytics: analyticsData.analytics,
        paymentTrends: trendsData.paymentTrends,
        propertyPerformance: performanceData.propertyPerformance,
      }));
    } catch (err) {
      console.error("Error loading analytics data:", err);
    }
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

  const handleExportData = async (format = "csv") => {
    try {
      await apiService.exportFinancialData(format);
    } catch (error) {
      console.error("Export failed:", error);
      setError("Failed to export data. Please try again.");
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
                  <p className="text-gray-600">
                    Comprehensive financial overview and analytics
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
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Print Report"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleExportData("csv")}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Export to CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <OverviewTab financialData={financialData} />
          )}

          {activeTab === "analytics" && (
            <AnalyticsTab financialData={financialData} />
          )}

          {activeTab === "expenses" && (
            <ExpenseManagementTab
              financialData={financialData}
              onExpenseUpdate={loadFinancialData}
            />
          )}

          {/* Report Generation Modal */}
          <GenerateReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            onError={setError}
          />
        </div>
      </div>
    </Navbar>
  );
};

export default FinancialReports;
