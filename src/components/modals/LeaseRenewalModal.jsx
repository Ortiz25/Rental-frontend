import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, AlertCircle, Loader2 } from 'lucide-react';

const LeaseRenewalModal = ({ lease, isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [renewalData, setRenewalData] = useState({
    new_end_date: '',
    rent_increase: '0',
    renewal_terms: '',
    notice_period: '30',
    effective_date: ''
  });

  // Calculate new rent
  const currentRent = lease?.monthly_rent || lease?.monthlyRent || 0;
  const rentIncrease = parseFloat(renewalData.rent_increase || 0);
  const newRent = currentRent + rentIncrease;

  // Calculate suggested end date (1 year from current end date)
  useEffect(() => {
    if (lease && isOpen) {
      const endDateString = lease.end_date || lease.endDate;
      
      // Validate and parse the end date
      let currentEndDate;
      if (endDateString && !isNaN(Date.parse(endDateString))) {
        currentEndDate = new Date(endDateString);
      } else {
        // Fallback to today's date if end date is invalid
        currentEndDate = new Date();
      }
      
      // Calculate suggested end date (1 year from current end date)
      const suggestedEndDate = new Date(currentEndDate);
      suggestedEndDate.setFullYear(suggestedEndDate.getFullYear() + 1);
      
      // Only update if we have valid dates
      if (!isNaN(currentEndDate.getTime()) && !isNaN(suggestedEndDate.getTime())) {
        setRenewalData(prev => ({
          ...prev,
          new_end_date: suggestedEndDate.toISOString().split('T')[0],
          effective_date: currentEndDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [lease, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRenewalData({
        new_end_date: '',
        rent_increase: '0',
        renewal_terms: '',
        notice_period: '30',
        effective_date: ''
      });
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setRenewalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!renewalData.new_end_date) {
      errors.push('New end date is required');
    }
    
    if (!renewalData.effective_date) {
      errors.push('Effective date is required');
    }
    
    // Validate that new end date is after effective date
    if (renewalData.new_end_date && renewalData.effective_date) {
      if (new Date(renewalData.new_end_date) <= new Date(renewalData.effective_date)) {
        errors.push('New end date must be after the effective date');
      }
    }
    
    // Validate rent increase is not negative
    if (parseFloat(renewalData.rent_increase) < 0) {
      errors.push('Rent increase cannot be negative');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const submitData = {
        ...renewalData,
        rent_increase: parseFloat(renewalData.rent_increase),
        notice_period: parseInt(renewalData.notice_period)
      };
      
      await onSubmit(submitData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lease) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-green-50">
          <div>
            <h2 className="text-xl font-bold text-green-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Renew Lease
            </h2>
            <p className="text-sm text-green-700 mt-1">
              Lease #{lease.lease_number || lease.id} - {lease.property_name || lease.propertyName}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Lease Info */}
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="font-medium text-gray-900 mb-3">Current Lease Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Current End Date:</span>
              <p>{formatDate(lease.end_date || lease.endDate)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Current Monthly Rent:</span>
              <p>{formatCurrency(currentRent)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tenant:</span>
              <p>{lease.all_tenant_names || lease.primary_tenant_name || lease.tenantName || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Unit:</span>
              <p>{lease.unit_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Renewal Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Renewal Dates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={renewalData.effective_date}
                  onChange={(e) => handleInputChange('effective_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">When the renewal takes effect</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={renewalData.new_end_date}
                  onChange={(e) => handleInputChange('new_end_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">New lease expiration date</p>
              </div>
            </div>
          </div>

          {/* Financial Terms */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Terms
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent Increase ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={renewalData.rent_increase}
                  onChange={(e) => handleInputChange('rent_increase', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Enter 0 for no increase</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Period (days)
                </label>
                <select
                  value={renewalData.notice_period}
                  onChange={(e) => handleInputChange('notice_period', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Notice period for next renewal/termination</p>
              </div>
            </div>

            {/* Rent Summary */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Rent Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">Current Rent:</span>
                  <p className="text-lg font-semibold text-green-900">{formatCurrency(currentRent)}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Increase:</span>
                  <p className="text-lg font-semibold text-green-900">
                    {rentIncrease > 0 ? `+${formatCurrency(rentIncrease)}` : formatCurrency(0)}
                  </p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">New Rent:</span>
                  <p className="text-lg font-semibold text-green-900">{formatCurrency(newRent)}</p>
                </div>
              </div>
              {rentIncrease > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  Percentage increase: {((rentIncrease / currentRent) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>

          {/* Renewal Terms */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Renewal Terms & Conditions
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Terms or Changes
              </label>
              <textarea
                value={renewalData.renewal_terms}
                onChange={(e) => handleInputChange('renewal_terms', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter any changes to lease terms, special conditions, or notes about the renewal..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be added to the lease special conditions
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {loading ? 'Processing...' : 'Renew Lease'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaseRenewalModal;