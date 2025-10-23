import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Search,
  Building2,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "../utils/helperFunctions";
import apiService from "../services/financialApiServices";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];

const OverviewTab = ({ 
  financialData, 
  onPropertyChange, 
  selectedPropertyProp = "all",
  dateRange = "month",
  selectedMonth = null,
  selectedYear = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState(10);
  const [selectedProperty, setSelectedProperty] = useState(selectedPropertyProp);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Sync local state with prop when it changes
  useEffect(() => {
    setSelectedProperty(selectedPropertyProp);
  }, [selectedPropertyProp]);

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await apiService.getProperties();
      console.log('Properties loaded:', response);
      const propertyList = response.properties || response.data?.properties || response.data || response || [];
      setProperties(Array.isArray(propertyList) ? propertyList : []);
    } catch (error) {
      console.error('Failed to load properties:', error);
      setProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  // Get period display label
  const getPeriodLabel = () => {
    if (dateRange === "specific-month" && selectedMonth) {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthName = monthNames[parseInt(selectedMonth) - 1];
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

  // Filter transactions by property and search term
  const filteredTransactions = financialData.recentTransactions.filter(
    (transaction) => {
      const matchesSearch = 
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());

      // If a specific property is selected, filter by property name in description
      if (selectedProperty !== "all") {
        const selectedProp = properties.find(p => p.id === parseInt(selectedProperty));
        const selectedPropertyName = selectedProp?.property_name || selectedProp?.propertyName || "";
        
        if (selectedPropertyName) {
          const matchesProperty = transaction.description.toLowerCase().includes(selectedPropertyName.toLowerCase());
          return matchesSearch && matchesProperty;
        }
      }

      return matchesSearch;
    }
  );

  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + transactionsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePerPageChange = (e) => {
    setTransactionsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handlePropertyChange = (e) => {
    const propertyId = e.target.value;
    setSelectedProperty(propertyId);
    setCurrentPage(1);
    
    // Notify parent component to reload data with the selected property
    console.log('Property changed to:', propertyId);
    if (onPropertyChange) {
      onPropertyChange(propertyId);
    }
  };

  const renderFinancialMetric = (
    title,
    value,
    change = null,
    icon = null,
    isPercentage = false
  ) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isPercentage ? formatPercentage(value) : formatCurrency(value)}
          </p>
          {change !== null && (
            <div
              className={`flex items-center text-sm ${
                change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}% from last period
            </div>
          )}
        </div>
        <div className="ml-4 p-3 rounded-full bg-gray-50">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filter Bar - Property & Period Info */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Property Filter */}
          <div className="flex items-center gap-3 flex-1">
            <Building2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Property:
            </label>
            <select
              value={selectedProperty}
              onChange={handlePropertyChange}
              disabled={loadingProperties}
              className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              <option value="all">All Properties</option>
              {loadingProperties ? (
                <option disabled>Loading properties...</option>
              ) : (
                properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.property_name || property.propertyName || property.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Period Info Display */}
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium text-blue-900">
              {getPeriodLabel()}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderFinancialMetric(
          "Total Revenue",
          financialData.summary.totalRevenue,
          financialData.summary.changes.revenue,
          <DollarSign className="w-6 h-6 text-green-600" />
        )}
        {renderFinancialMetric(
          "Total Expenses",
          financialData.summary.totalExpenses,
          financialData.summary.changes.expenses,
          <TrendingDown className="w-6 h-6 text-red-600" />
        )}
        {renderFinancialMetric(
          "Net Income",
          financialData.summary.netIncome,
          financialData.summary.changes.netIncome,
          <BarChart3 className="w-6 h-6 text-blue-600" />
        )}
        {renderFinancialMetric(
          "Occupancy Rate",
          financialData.summary.occupancyRate,
          null,
          <PieChart className="w-6 h-6 text-purple-600" />,
          true
        )}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {renderFinancialMetric(
          "Pending Payments",
          financialData.summary.pendingPayments,
          null,
          <FileText className="w-6 h-6 text-orange-600" />
        )}
        {renderFinancialMetric(
          "Maintenance Costs",
          financialData.summary.maintenanceCosts,
          null,
          <TrendingDown className="w-6 h-6 text-red-600" />
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
            Revenue & Expenses Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 20 }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Chart */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-gray-600" />
            Expense Breakdown
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie
                  data={financialData.expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="category"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {financialData.expenseBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [formatCurrency(value), ""]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  layout="horizontal"
                  align="center"
                />
              </RechartPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-lg font-bold flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              Recent Transactions
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({getPeriodLabel()})
              </span>
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm w-full sm:w-64"
                />
              </div>
              <select
                value={transactionsPerPage}
                onChange={handlePerPageChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      {transaction.category}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === "Income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "Income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {paginatedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleDateString()}
                </div>
                <div
                  className={`font-medium ${
                    transaction.type === "Income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "Income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
              <div className="mb-1 font-medium text-gray-900">
                {transaction.description}
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {transaction.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {filteredTransactions.length > transactionsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to{" "}
                {Math.min(
                  startIndex + transactionsPerPage,
                  filteredTransactions.length
                )}{" "}
                of {filteredTransactions.length} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === page
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>
              {searchTerm || selectedProperty !== "all"
                ? "No transactions match your filters"
                : "No recent transactions found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;