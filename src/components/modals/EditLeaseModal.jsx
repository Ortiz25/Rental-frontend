import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Loader2, AlertCircle, Save } from 'lucide-react';

// API service for fetching supporting data
const supportAPI = {
  baseURL:'http://localhost:5020/api/support-lease',
  
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },
  
  async getUnits() {
    const response = await fetch(`${this.baseURL}/units`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch units');
    return response.json();
  },
  
  async getTenants() {
    const response = await fetch(`${this.baseURL}/tenants`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch tenants');
    return response.json();
  }
};

const EditLeaseModal = ({ lease, isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data state - Initialize with lease data
  const [leaseData, setLeaseData] = useState({
    lease_type: 'Fixed Term',
    lease_status: 'draft',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    security_deposit: '',
    pet_deposit: '0',
    late_fee: '0',
    grace_period_days: '5',
    rent_due_day: '1',
    lease_terms: '',
    special_conditions: '',
    signed_date: '',
    move_in_date: '',
    move_out_date: ''
  });

  // Supporting data
  const [availableUnits, setAvailableUnits] = useState([]);
  const [availableTenants, setAvailableTenants] = useState([]);

  // Initialize form with lease data when modal opens
  useEffect(() => {
    if (isOpen && lease) {
      setLeaseData({
        lease_type: lease.lease_type || 'Fixed Term',
        lease_status: lease.lease_status || lease.status?.toLowerCase() || 'draft',
        start_date: lease.start_date || '',
        end_date: lease.end_date || '',
        monthly_rent: lease.monthly_rent?.toString() || '',
        security_deposit: lease.security_deposit?.toString() || '',
        pet_deposit: lease.pet_deposit?.toString() || '0',
        late_fee: lease.late_fee?.toString() || '0',
        grace_period_days: lease.grace_period_days?.toString() || '5',
        rent_due_day: lease.rent_due_day?.toString() || '1',
        lease_terms: lease.lease_terms || '',
        special_conditions: lease.special_conditions || '',
        signed_date: lease.signed_date || '',
        move_in_date: lease.move_in_date || '',
        move_out_date: lease.move_out_date || ''
      });
      fetchSupportingData();
    }
  }, [isOpen, lease]);

  const fetchSupportingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [unitsResponse, tenantsResponse] = await Promise.all([
        supportAPI.getUnits(),
        supportAPI.getTenants()
      ]);
      
      if (unitsResponse.success) setAvailableUnits(unitsResponse.data);
      if (tenantsResponse.success) setAvailableTenants(tenantsResponse.data);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching supporting data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setLeaseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors = [];
    
    if (!leaseData.start_date) errors.push('Start date is required');
    if (!leaseData.monthly_rent || parseFloat(leaseData.monthly_rent) <= 0) {
      errors.push('Monthly rent must be greater than 0');
    }
    if (!leaseData.security_deposit || parseFloat(leaseData.security_deposit) < 0) {
      errors.push('Security deposit must be 0 or greater');
    }
    
    // Validate end date if provided
    if (leaseData.end_date && leaseData.start_date) {
      if (new Date(leaseData.end_date) <= new Date(leaseData.start_date)) {
        errors.push('End date must be after start date');
      }
    }
    
    // Validate move-in date if provided
    if (leaseData.move_in_date && leaseData.start_date) {
      if (new Date(leaseData.move_in_date) < new Date(leaseData.start_date)) {
        errors.push('Move-in date cannot be before start date');
      }
    }

    // Validate move-out date if provided
    if (leaseData.move_out_date && leaseData.move_in_date) {
      if (new Date(leaseData.move_out_date) < new Date(leaseData.move_in_date)) {
        errors.push('Move-out date cannot be before move-in date');
      }
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError(null);
      
      // Prepare data for submission - only include changed fields
      const updateData = {};
      
      // Convert and validate numeric fields
      if (leaseData.monthly_rent !== lease.monthly_rent?.toString()) {
        updateData.monthly_rent = parseFloat(leaseData.monthly_rent);
      }
      if (leaseData.security_deposit !== lease.security_deposit?.toString()) {
        updateData.security_deposit = parseFloat(leaseData.security_deposit);
      }
      if (leaseData.pet_deposit !== lease.pet_deposit?.toString()) {
        updateData.pet_deposit = parseFloat(leaseData.pet_deposit || 0);
      }
      if (leaseData.late_fee !== lease.late_fee?.toString()) {
        updateData.late_fee = parseFloat(leaseData.late_fee || 0);
      }
      if (leaseData.grace_period_days !== lease.grace_period_days?.toString()) {
        updateData.grace_period_days = parseInt(leaseData.grace_period_days || 5);
      }
      if (leaseData.rent_due_day !== lease.rent_due_day?.toString()) {
        updateData.rent_due_day = parseInt(leaseData.rent_due_day || 1);
      }

      // String fields
      const stringFields = [
        'lease_type', 'lease_status', 'start_date', 'end_date',
        'lease_terms', 'special_conditions', 'signed_date', 
        'move_in_date', 'move_out_date'
      ];

      stringFields.forEach(field => {
        const currentValue = leaseData[field];
        const originalValue = lease[field] || '';
        if (currentValue !== originalValue) {
          if (currentValue.trim()) {
            updateData[field] = currentValue;
          } else {
            updateData[field] = null; // Explicitly set to null for empty values
          }
        }
      });

      // Only submit if there are changes
      if (Object.keys(updateData).length === 0) {
        setError('No changes detected');
        return;
      }
      
      await onSubmit(lease.id, updateData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen || !lease) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">Edit Lease</h2>
            <p className="text-sm text-gray-600 mt-1">
              Lease #{lease.lease_number} - {lease.property_name} {lease.unit_number && `Unit ${lease.unit_number}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={submitLoading}
          >
            <X className="w-6 h-6" />
          </button>
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

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading form data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lease Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Type
                  </label>
                  <select 
                    value={leaseData.lease_type}
                    onChange={(e) => handleInputChange('lease_type', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Fixed Term">Fixed Term</option>
                    <option value="Month-to-Month">Month-to-Month</option>
                    <option value="Week-to-Week">Week-to-Week</option>
                  </select>
                </div>

                {/* Lease Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Status
                  </label>
                  <select 
                    value={leaseData.lease_status}
                    onChange={(e) => handleInputChange('lease_status', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Lease Dates</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={leaseData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={leaseData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signed Date
                  </label>
                  <input
                    type="date"
                    value={leaseData.signed_date}
                    onChange={(e) => handleInputChange('signed_date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Move-in Date
                  </label>
                  <input
                    type="date"
                    value={leaseData.move_in_date}
                    onChange={(e) => handleInputChange('move_in_date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Move-out Date
                  </label>
                  <input
                    type="date"
                    value={leaseData.move_out_date}
                    onChange={(e) => handleInputChange('move_out_date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Financial Terms */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Financial Terms</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={leaseData.monthly_rent}
                    onChange={(e) => handleInputChange('monthly_rent', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Deposit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={leaseData.security_deposit}
                    onChange={(e) => handleInputChange('security_deposit', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Deposit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={leaseData.pet_deposit}
                    onChange={(e) => handleInputChange('pet_deposit', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Late Fee
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={leaseData.late_fee}
                    onChange={(e) => handleInputChange('late_fee', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grace Period (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={leaseData.grace_period_days}
                    onChange={(e) => handleInputChange('grace_period_days', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rent Due Day
                  </label>
                  <select
                    value={leaseData.rent_due_day}
                    onChange={(e) => handleInputChange('rent_due_day', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Terms */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Terms</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lease Terms
                </label>
                <textarea
                  value={leaseData.lease_terms}
                  onChange={(e) => handleInputChange('lease_terms', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter general lease terms and conditions..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Conditions
                </label>
                <textarea
                  value={leaseData.special_conditions}
                  onChange={(e) => handleInputChange('special_conditions', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any special conditions or notes..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={submitLoading}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
              >
                {submitLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {submitLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditLeaseModal;