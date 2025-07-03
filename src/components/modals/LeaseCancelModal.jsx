import React, { useState, useEffect } from 'react';
import { X, XCircle, AlertTriangle, DollarSign, Calendar, FileText, Loader2 } from 'lucide-react';

const LeaseCancelModal = ({ lease, isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [cancelData, setCancelData] = useState({
    termination_date: '',
    termination_reason: '',
    notice_given: 'yes',
    notice_date: '',
    refund_amount: '',
    deduction_reason: '',
    early_termination_fee: '0',
    final_inspection_date: '',
    notes: ''
  });

  // Calculate suggested termination date (30 days from today)
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const suggestedDate = new Date(today);
      suggestedDate.setDate(suggestedDate.getDate() + 30);
      
      setCancelData(prev => ({
        ...prev,
        termination_date: suggestedDate.toISOString().split('T')[0],
        notice_date: today.toISOString().split('T')[0],
        refund_amount: lease?.security_deposit || lease?.securityDeposit || '0'
      }));
    }
  }, [isOpen, lease]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCancelData({
        termination_date: '',
        termination_reason: '',
        notice_given: 'yes',
        notice_date: '',
        refund_amount: '',
        deduction_reason: '',
        early_termination_fee: '0',
        final_inspection_date: '',
        notes: ''
      });
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setCancelData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!cancelData.termination_date) {
      errors.push('Termination date is required');
    }
    
    if (!cancelData.termination_reason.trim()) {
      errors.push('Termination reason is required');
    }
    
    if (cancelData.notice_given === 'yes' && !cancelData.notice_date) {
      errors.push('Notice date is required when notice was given');
    }
    
    // Validate termination date is not in the past
    if (cancelData.termination_date) {
      const termDate = new Date(cancelData.termination_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (termDate < today) {
        errors.push('Termination date cannot be in the past');
      }
    }
    
    // Validate refund amount
    const securityDeposit = parseFloat(lease?.security_deposit || lease?.securityDeposit || 0);
    const refundAmount = parseFloat(cancelData.refund_amount || 0);
    
    if (refundAmount > securityDeposit) {
      errors.push('Refund amount cannot exceed security deposit');
    }
    
    if (refundAmount < 0) {
      errors.push('Refund amount cannot be negative');
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
        ...cancelData,
        refund_amount: parseFloat(cancelData.refund_amount || 0),
        early_termination_fee: parseFloat(cancelData.early_termination_fee || 0)
      };
      
      // Remove empty optional fields
      if (!submitData.final_inspection_date) delete submitData.final_inspection_date;
      if (!submitData.deduction_reason.trim()) delete submitData.deduction_reason;
      if (!submitData.notes.trim()) delete submitData.notes;
      
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const securityDeposit = parseFloat(lease?.security_deposit || lease?.securityDeposit || 0);
  const refundAmount = parseFloat(cancelData.refund_amount || 0);
  const deductionAmount = securityDeposit - refundAmount;

  const terminationReasons = [
    'Tenant Request - Personal Reasons',
    'Tenant Request - Job Relocation',
    'Tenant Request - Financial Hardship',
    'Lease Violation by Tenant',
    'Non-Payment of Rent',
    'Property Sale',
    'Property Renovation/Demolition',
    'Owner Move-In',
    'Mutual Agreement',
    'Other'
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-red-50">
          <div>
            <h2 className="text-xl font-bold text-red-900 flex items-center">
              <XCircle className="w-6 h-6 mr-2" />
              Cancel Lease
            </h2>
            <p className="text-sm text-red-700 mt-1">
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

        {/* Warning Banner */}
        <div className="mx-6 mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> This action will terminate the lease and cannot be undone. 
                Please ensure all details are correct before proceeding.
              </p>
            </div>
          </div>
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
              <span className="font-medium text-gray-700">Monthly Rent:</span>
              <p>{formatCurrency(lease.monthly_rent || lease.monthlyRent)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Security Deposit:</span>
              <p>{formatCurrency(securityDeposit)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tenant:</span>
              <p>{lease.all_tenant_names || lease.primary_tenant_name || lease.tenantName || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <XCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Termination Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Termination Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Termination Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={cancelData.termination_date}
                  onChange={(e) => handleInputChange('termination_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">When the lease will be terminated</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Inspection Date
                </label>
                <input
                  type="date"
                  value={cancelData.final_inspection_date}
                  onChange={(e) => handleInputChange('final_inspection_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Schedule final inspection</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Termination Reason <span className="text-red-500">*</span>
              </label>
              <select
                value={cancelData.termination_reason}
                onChange={(e) => handleInputChange('termination_reason', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Select a reason</option>
                {terminationReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notice Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Notice Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Was Proper Notice Given?
                </label>
                <select
                  value={cancelData.notice_given}
                  onChange={(e) => handleInputChange('notice_given', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              
              {cancelData.notice_given === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={cancelData.notice_date}
                    onChange={(e) => handleInputChange('notice_date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Financial Settlement */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Settlement
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Deposit Refund ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={securityDeposit}
                  value={cancelData.refund_amount}
                  onChange={(e) => handleInputChange('refund_amount', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {formatCurrency(securityDeposit)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Early Termination Fee ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cancelData.early_termination_fee}
                  onChange={(e) => handleInputChange('early_termination_fee', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Deduction Reason */}
            {deductionAmount > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Security Deposit Deduction
                </label>
                <textarea
                  value={cancelData.deduction_reason}
                  onChange={(e) => handleInputChange('deduction_reason', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Explain why security deposit is being deducted (damages, cleaning, unpaid rent, etc.)"
                />
              </div>
            )}

            {/* Financial Summary */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">Financial Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-red-700 font-medium">Security Deposit:</span>
                  <p className="text-lg font-semibold text-red-900">{formatCurrency(securityDeposit)}</p>
                </div>
                <div>
                  <span className="text-red-700 font-medium">Refund Amount:</span>
                  <p className="text-lg font-semibold text-red-900">{formatCurrency(refundAmount)}</p>
                </div>
                <div>
                  <span className="text-red-700 font-medium">Deductions:</span>
                  <p className="text-lg font-semibold text-red-900">{formatCurrency(deductionAmount)}</p>
                </div>
              </div>
              {parseFloat(cancelData.early_termination_fee) > 0 && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <span className="text-red-700 font-medium">Early Termination Fee:</span>
                  <p className="text-lg font-semibold text-red-900">{formatCurrency(cancelData.early_termination_fee)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Additional Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Notes
              </label>
              <textarea
                value={cancelData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Add any additional notes about the lease cancellation, circumstances, or special arrangements..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This information will be added to the lease record for future reference
              </p>
            </div>
          </div>

          {/* Confirmation Checkboxes */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900">Confirmation</h4>
            <div className="space-y-2">
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  I confirm that all tenant obligations have been reviewed and proper procedures have been followed.
                </span>
              </label>
              
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  I understand that this action will permanently terminate the lease and cannot be undone.
                </span>
              </label>
              
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  I have verified that all financial calculations and refund amounts are correct.
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {loading ? 'Cancelling...' : 'Cancel Lease'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaseCancelModal;