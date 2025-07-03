// components/ExpenseManagementTab.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  DollarSign,
  Building,
  Loader2,
  AlertCircle,
  Check,
  X,
  PieChart,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  PieChart as RechartPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

// Import modals
import AddExpenseModal from '../components/modals/AddExpensesModal.jsx';

// Import API service
import { apiService } from '../services/financialApiServices.jsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

const ExpenseManagementTab = ({ financialData, onExpenseUpdate }) => {
  const [expenses, setExpenses] = useState([]);
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProperty, setFilterProperty] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  // Reset to first page when search term or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterProperty, entriesPerPage]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [expensesData, propertiesData, categoriesData] = await Promise.all([
        apiService.getPropertyExpenses(),
        apiService.getProperties(),
        apiService.getExpenseCategories().catch(() => ({ categories: [] }))
      ]);

      setExpenses(expensesData.propertyExpenses || []);
      setProperties(propertiesData.properties || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const expensesData = await apiService.getPropertyExpenses();
      setExpenses(expensesData.propertyExpenses || []);
    } catch (err) {
      setError('Failed to load expenses');
      console.error('Error loading expenses:', err);
    }
  };

  const handleExpenseAdded = async () => {
    setSuccess('Expense added successfully!');
    await loadExpenses();
    
    // Trigger update in parent component to refresh charts
    if (onExpenseUpdate) {
      onExpenseUpdate();
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await apiService.deletePropertyExpense(expenseId);
      setSuccess('Expense deleted successfully!');
      await loadExpenses();
      
      // Trigger update in parent component
      if (onExpenseUpdate) {
        onExpenseUpdate();
      }
    } catch (err) {
      setError('Failed to delete expense');
      console.error('Error deleting expense:', err);
    }
  };

  // Filter and search logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = searchTerm === '' || 
        expense.expenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProperty = filterProperty === '' || 
        expense.propertyId.toString() === filterProperty;
      
      return matchesSearch && matchesProperty;
    });
  }, [expenses, searchTerm, filterProperty]);

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getFrequencyBadgeColor = (frequency) => {
    const colors = {
      monthly: 'bg-blue-100 text-blue-800',
      quarterly: 'bg-green-100 text-green-800',
      annual: 'bg-purple-100 text-purple-800',
      'one-time': 'bg-gray-100 text-gray-800'
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annual: 'Annual',
      'one-time': 'One-time'
    };
    return labels[frequency] || frequency;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterProperty('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading expenses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-green-700">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Expense Management Section */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-lg font-semibold mb-4 lg:mb-0">Expense Management</h3>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </button>
        </div>

        {/* Expenses Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700 mb-2">Total Monthly Expenses</h4>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(
                expenses.reduce((sum, exp) => sum + (exp.monthlyEquivalent || 0), 0)
              )}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-700 mb-2">Active Expenses</h4>
            <p className="text-2xl font-bold text-green-900">
              {expenses.filter(exp => exp.isActive).length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-700 mb-2">Properties Covered</h4>
            <p className="text-2xl font-bold text-purple-900">
              {new Set(expenses.map(exp => exp.propertyId)).size}
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Expenses
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by expense type or property name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Property Filter */}
            <div className="lg:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Property
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterProperty}
                  onChange={(e) => setFilterProperty(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Properties</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.propertyName || property.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Entries Per Page */}
            <div className="lg:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show
              </label>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Clear Filters & Results Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing {currentExpenses.length} of {filteredExpenses.length} expenses
              {filteredExpenses.length !== expenses.length && (
                <span className="text-blue-600"> (filtered from {expenses.length} total)</span>
              )}
            </div>
            {(searchTerm || filterProperty) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Current Expenses</h4>
            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              {searchTerm || filterProperty ? (
                <>
                  <p className="text-gray-500 mb-4">No expenses found matching your criteria</p>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 mb-4">No expenses configured</p>
                  <button
                    onClick={() => setShowAddExpenseModal(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Add your first expense
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {currentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-900">{expense.expenseType}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getFrequencyBadgeColor(expense.frequency)}`}>
                        {getFrequencyLabel(expense.frequency)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        expense.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {expense.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {expense.propertyName}
                        </span>
                        <span>{formatCurrency(expense.amount)} ({expense.frequency})</span>
                      </div>
                      {expense.description && (
                        <p className="mt-1 text-gray-500">{expense.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(expense.monthlyEquivalent)}
                      </div>
                      <div className="text-xs text-gray-500">per month</div>
                    </div>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Live Expense Breakdown Chart */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-green-600" />
          Live Expense Breakdown
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
                formatter={(value) => [formatCurrency(value), '']}
              />
              <Legend />
            </RechartPieChart>
          </ResponsiveContainer>
        </div>
        
        {financialData.expenseBreakdown.length === 0 && (
          <div className="flex items-center justify-center h-[350px] text-gray-500">
            <div className="text-center">
              <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No expense data available</p>
              <p className="text-sm">Add expenses to see breakdown</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onExpenseAdded={handleExpenseAdded}
        onError={setError}
        properties={properties}
        categories={categories}
      />
    </div>
  );
};

export default ExpenseManagementTab;