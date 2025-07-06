import React from 'react';
import { Search, CheckCircle, X } from 'lucide-react';

const VerificationFilters = ({ 
  filters, 
  onFilterChange, 
  onSearch, 
  selectedCount, 
  onBulkAction, 
  onClearSelection 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center space-x-4">
          <div>
            <select 
              className="border rounded px-3 py-2"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Status</option>
            </select>
          </div>
          
          <div>
            <select 
              className="border rounded px-3 py-2"
              value={filters.payment_method}
              onChange={(e) => onFilterChange('payment_method', e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="mpesa">M-Pesa</option>
              <option value="airtel_money">Airtel Money</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={filters.date_from}
              onChange={(e) => onFilterChange('date_from', e.target.value)}
              placeholder="From Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={filters.date_to}
              onChange={(e) => onFilterChange('date_to', e.target.value)}
              placeholder="To Date"
            />
          </div>
        </div>

        {/* Search */}
        <form onSubmit={onSearch} className="flex items-center space-x-2">
          <input 
            placeholder="Search submissions..."
            className="border rounded px-4 py-2 w-64"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
          <button
            type="submit"
            className="bg-gray-100 p-2 rounded hover:bg-gray-200"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-800">
                {selectedCount} payment{selectedCount > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={onClearSelection}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Clear selection
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => onBulkAction('verify')}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Verify All
              </button>
              <button
                onClick={() => onBulkAction('reject')}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Reject All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationFilters;