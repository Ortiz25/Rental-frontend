import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Filter,
  Calendar,
  PieChart,
  BarChart as BarChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Printer,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell
} from 'recharts';
import Navbar from '../layout/navbar.jsx'; 

const initialFinancialData = {
  summary: {
    totalRevenue: 125000,
    totalExpenses: 45000,
    netIncome: 80000,
    occupancyRate: 92,
    pendingPayments: 15000,
    maintenanceCosts: 12000
  },
  monthlyData: [
    { month: 'Jan', revenue: 28000, expenses: 10000, maintenance: 3000, utilities: 2000 },
    { month: 'Feb', revenue: 32000, expenses: 11000, maintenance: 2500, utilities: 2100 },
    { month: 'Mar', revenue: 30000, expenses: 12000, maintenance: 3500, utilities: 1900 },
    { month: 'Apr', revenue: 35000, expenses: 12000, maintenance: 3000, utilities: 2000 }
  ],
  expenseBreakdown: [
    { name: 'Maintenance', value: 12000 },
    { name: 'Utilities', value: 8000 },
    { name: 'Insurance', value: 6000 },
    { name: 'Property Tax', value: 15000 },
    { name: 'Administrative', value: 4000 }
  ],
  recentTransactions: [
    {
      id: 1,
      date: '2024-01-25',
      description: 'Rent Payment - Unit 304',
      type: 'Income',
      amount: 2500,
      category: 'Rent'
    },
    {
      id: 2,
      date: '2024-01-24',
      description: 'HVAC Repair',
      type: 'Expense',
      amount: 450,
      category: 'Maintenance'
    }
  ]
};

 
 
 
 const FinancialReports = () => {


  const [activeModule, setActiveModule] = useState('Financial Reports')
  const [financialData, setFinancialData] = useState(initialFinancialData);
  const [dateRange, setDateRange] = useState('month');
  const [showReportModal, setShowReportModal] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderFinancialMetric = (title, value, change = null, icon = null) => (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-gray-600 text-sm sm:text-base">{title}</p>
          <p className="text-xl sm:text-2xl font-bold">
            {typeof value === 'number' ? 
              value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }) : 
              `${value}%`
            }
          </p>
          {change && (
            <div className={`flex items-center text-xs sm:text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? 
                <TrendingUp className="w-4 h-4 mr-1" /> : 
                <TrendingDown className="w-4 h-4 mr-1" />
              }
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="ml-4">
          {icon}
        </div>
      </div>
    </div>
  );

  const GenerateReportModal = ({ isOpen, onClose }) => {
    const [reportSettings, setReportSettings] = useState({
      startDate: '',
      endDate: '',
      type: 'detailed',
      includeCharts: true
    });

    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-96">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">Generate Financial Report</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="p-2 border rounded"
                  value={reportSettings.startDate}
                  onChange={(e) => setReportSettings({
                    ...reportSettings,
                    startDate: e.target.value
                  })}
                />
                <input
                  type="date"
                  className="p-2 border rounded"
                  value={reportSettings.endDate}
                  onChange={(e) => setReportSettings({
                    ...reportSettings,
                    endDate: e.target.value
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select 
                className="w-full p-2 border rounded"
                value={reportSettings.type}
                onChange={(e) => setReportSettings({
                  ...reportSettings,
                  type: e.target.value
                })}
              >
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="tax">Tax Report</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeCharts"
                checked={reportSettings.includeCharts}
                onChange={(e) => setReportSettings({
                  ...reportSettings,
                  includeCharts: e.target.checked
                })}
                className="mr-2"
              />
              <label htmlFor="includeCharts" className="text-sm">Include Charts & Graphs</label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Generate Report
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };


  return (
    <Navbar module={activeModule} >
       <div className="space-y-6">
      {/* Summary Metrics */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {renderFinancialMetric(
      'Total Revenue',
      financialData.summary.totalRevenue,
      5.2,
      <DollarSign className="w-6 sm:w-8 h-6 sm:h-8 text-green-500" />
    )}
    {renderFinancialMetric(
      'Total Expenses',
      financialData.summary.totalExpenses,
      -2.1,
      <TrendingDown className="w-6 sm:w-8 h-6 sm:h-8 text-red-500" />
    )}
    {renderFinancialMetric(
      'Net Income',
      financialData.summary.netIncome,
      8.4,
      <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-blue-500" />
    )}
    {renderFinancialMetric(
      'Occupancy Rate',
      financialData.summary.occupancyRate,
      1.5,
      <BarChart className="w-6 sm:w-8 h-6 sm:h-8 text-purple-500" />
    )}
  </div>

      {/* Action Bar */}
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
          >
            <FileText className="mr-2" /> Generate Report
          </button>
          <select 
            className="border rounded px-4 py-2"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button className="bg-gray-100 p-2 rounded">
            <Printer className="w-5 h-5" />
          </button>
          <button className="bg-gray-100 p-2 rounded">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

    {/* Charts Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  {/* Revenue vs Expenses Chart */}
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-bold mb-4">Revenue vs Expenses</h3>
    <div className="h-[300px] md:h-[400px] lg:h-[300px]"> {/* Controlled height container */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={financialData.monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip 
            contentStyle={{ fontSize: 12 }}
            itemStyle={{ fontSize: 12 }}
          />
          <Legend 
            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#0088FE" 
            name="Revenue"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="#FF8042" 
            name="Expenses"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Expense Breakdown */}
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-bold mb-4">Expense Breakdown</h3>
    <div className="h-[300px] md:h-[400px] lg:h-[300px]"> {/* Controlled height container */}
      <ResponsiveContainer width="100%" height="100%">
        <RechartPieChart>
          <Pie
            data={financialData.expenseBreakdown}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            contentStyle={{ fontSize: 12 }}
            itemStyle={{ fontSize: 12 }}
          />
          <Legend 
            wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
            layout="horizontal"
            align="center"
          />
        </RechartPieChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
  <div className="p-4 border-b">
    <h3 className="text-lg font-bold">Recent Transactions</h3>
  </div>
  
  {/* Desktop Table - Hidden on mobile */}
  <div className="hidden md:block p-4">
    <table className="w-full">
      <thead>
        <tr className="text-left">
          <th className="pb-3">Date</th>
          <th className="pb-3">Description</th>
          <th className="pb-3">Category</th>
          <th className="pb-3 text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {financialData.recentTransactions.map(transaction => (
          <tr key={transaction.id} className="border-t">
            <td className="py-3">{transaction.date}</td>
            <td className="py-3">{transaction.description}</td>
            <td className="py-3">{transaction.category}</td>
            <td className={`py-3 text-right ${
              transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'Income' ? '+' : '-'}
              ${transaction.amount}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Mobile Card View - Shown only on mobile */}
  <div className="md:hidden">
    {financialData.recentTransactions.map(transaction => (
      <div key={transaction.id} className="p-4 border-b last:border-b-0">
        <div className="flex justify-between items-start mb-2">
          <div className="text-sm text-gray-600">{transaction.date}</div>
          <div className={`font-medium ${
            transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'Income' ? '+' : '-'}
            ${transaction.amount}
          </div>
        </div>
        <div className="mb-1 font-medium">{transaction.description}</div>
        <div className="text-sm text-gray-600">{transaction.category}</div>
      </div>
    ))}
  </div>
</div>

      {/* Report Generation Modal */}
      <GenerateReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
    </Navbar>
 
)
};


  export default FinancialReports