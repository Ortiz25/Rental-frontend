import React from "react";
import { Loader2, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../utils/helperFunctions";

const AnalyticsTab = ({ 
  financialData,
  dateRange = "month",
  selectedMonth = null,
  selectedYear = null,
}) => {
  const { analytics, paymentTrends, propertyPerformance } = financialData;

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

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Analytics for {getPeriodLabel()}
          </span>
        </div>
      </div>

      {/* Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h4 className="text-sm font-medium text-gray-600 mb-4">
            Payment Performance
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">On-time Rate</span>
              <span className="font-medium text-green-600">
                {formatPercentage(analytics.revenueMetrics.onTimePaymentRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Late Payments</span>
              <span className="font-medium">
                {analytics.revenueMetrics.latePayments}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Overdue</span>
              <span className="font-medium text-red-600">
                {analytics.revenueMetrics.overduePayments}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h4 className="text-sm font-medium text-gray-600 mb-4">
            Maintenance Metrics
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Completion Rate</span>
              <span className="font-medium text-blue-600">
                {formatPercentage(analytics.expenseMetrics.completionRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Avg Cost</span>
              <span className="font-medium">
                {formatCurrency(
                  analytics.expenseMetrics.averageMaintenanceCost
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Emergency Costs</span>
              <span className="font-medium text-orange-600">
                {formatCurrency(analytics.expenseMetrics.emergencyCosts)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h4 className="text-sm font-medium text-gray-600 mb-4">
            Property Overview
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Properties</span>
              <span className="font-medium">
                {analytics.propertyMetrics.totalProperties}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Overall Occupancy</span>
              <span className="font-medium text-green-600">
                {formatPercentage(
                  analytics.propertyMetrics.overallOccupancyRate
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Avg Units/Property</span>
              <span className="font-medium">
                {analytics.propertyMetrics.averageUnitsPerProperty.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Payment Trends</h3>
          <span className="text-sm text-gray-500">Last 6 Months</span>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={paymentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  name === "onTimePercentage"
                    ? formatPercentage(value)
                    : formatCurrency(value),
                  name,
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalRevenue"
                stackId="1"
                stroke="#0088FE"
                fill="#0088FE"
                fillOpacity={0.6}
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="onTimePercentage"
                stackId="2"
                stroke="#00C49F"
                fill="#00C49F"
                fillOpacity={0.6}
                name="On-time %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Property Performance Table */}
      <div className="bg-white rounded-lg shadow border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Property Performance</h3>
            <span className="text-sm text-gray-500">
              For {getPeriodLabel()}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Net Income
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Profit Margin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {propertyPerformance.map((property, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {property.propertyName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.occupiedUnits}/{property.totalUnits} units
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.propertyType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        property.occupancyRate >= 90
                          ? "bg-green-100 text-green-800"
                          : property.occupancyRate >= 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {formatPercentage(property.occupancyRate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    {formatCurrency(property.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    <span
                      className={
                        property.netIncome >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {formatCurrency(property.netIncome)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`font-medium ${
                        property.profitMargin >= 20
                          ? "text-green-600"
                          : property.profitMargin >= 10
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPercentage(property.profitMargin)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {propertyPerformance.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No property performance data available for {getPeriodLabel()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;