import React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];

const OverviewTab = ({ financialData }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
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
          <TrendingUp className="w-6 h-6 text-blue-600" />
        )}
        {renderFinancialMetric(
          "Occupancy Rate",
          financialData.summary.occupancyRate,
          1.5,
          <PieChart className="w-6 h-6 text-purple-600" />,
          true
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Revenue vs Expenses
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  width={60}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [formatCurrency(value), ""]}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0088FE"
                  name="Revenue"
                  strokeWidth={3}
                  dot={{ fill: "#0088FE", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#FF8042"
                  name="Expenses"
                  strokeWidth={3}
                  dot={{ fill: "#FF8042", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-600" />
            Expense Breakdown
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie
                  data={financialData.expenseBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
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
          <h3 className="text-lg font-bold flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-600" />
            Recent Transactions
          </h3>
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
              {financialData.recentTransactions.map((transaction) => (
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
          {financialData.recentTransactions.map((transaction) => (
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

        {financialData.recentTransactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
