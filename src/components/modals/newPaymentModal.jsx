import React, { useState, useEffect } from 'react';
import { X, DollarSign, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/helperFunctions';

const NewPaymentModal = ({ isOpen, onClose, activeLeases, onSubmit, processing }) => {
  const [newPaymentData, setNewPaymentData] = useState({
    lease_id: '',
    amount_due: 0,
    utilities_charges: 0,
    amount_paid: 0,
    payment_method: '',
    payment_reference: '',
    payment_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
    processed_by: 'Admin'
  });
  const [selectedLease, setSelectedLease] = useState(null);

  // Calculate total when rent or utilities change
  useEffect(() => {
    const total = (parseFloat(newPaymentData.amount_due) || 0) + 
                  (parseFloat(newPaymentData.utilities_charges) || 0);
    setNewPaymentData(prev => ({
      ...prev,
      amount_paid: total
    }));
  }, [newPaymentData.amount_due, newPaymentData.utilities_charges]);

  const handleLeaseChange = (leaseId) => {
    const lease = activeLeases.find(l => l.id === parseInt(leaseId));
    setSelectedLease(lease);
    if (lease) {
      setNewPaymentData(prev => ({
        ...prev,
        lease_id: leaseId,
        amount_due: lease.monthly_rent,
        utilities_charges: 0,
        amount_paid: lease.monthly_rent
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setNewPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPaymentData.lease_id || !newPaymentData.payment_method || !newPaymentData.amount_paid) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(newPaymentData);
  };

  const resetForm = () => {
    setNewPaymentData({
      lease_id: '',
      amount_due: 0,
      utilities_charges: 0,
      amount_paid: 0,
      payment_method: '',
      payment_reference: '',
      payment_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      notes: '',
      processed_by: 'Admin'
    });
    setSelectedLease(null);
  };

  if (!isOpen) return null;

  const totalDue = (parseFloat(newPaymentData.amount_due) || 0) + 
                   (parseFloat(newPaymentData.utilities_charges) || 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Record New Payment</h2>
          <button onClick={onClose} disabled={processing}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Tenant/Lease *</label>
            <select 
              className="w-full p-2 border rounded"
              value={newPaymentData.lease_id}
              onChange={(e) => handleLeaseChange(e.target.value)}
              disabled={processing}
              
            >
              <option value="">Select a lease...</option>
              {activeLeases.map(lease => (
                <option key={lease.id} value={lease.id}>
                  {lease.primary_tenant_name} - {lease.property_name} ({lease.lease_number})
                </option>
              ))}
            </select>
          </div>

          {selectedLease && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm"><strong>Property:</strong> {selectedLease.property_name}</p>
              <p className="text-sm"><strong>Monthly Rent:</strong> {formatCurrency(selectedLease.monthly_rent)}</p>
              <p className="text-sm"><strong>Tenant:</strong> {selectedLease.primary_tenant_name}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Due Date *</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={newPaymentData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
              disabled={processing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rent Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full p-2 border rounded"
              value={newPaymentData.amount_due}
              onChange={(e) => handleInputChange('amount_due', parseFloat(e.target.value) || 0)}
              disabled={processing}
            />
          </div>

          {/* ADD UTILITIES FIELD */}
          <div>
            <label className="block text-sm font-medium mb-2">Utilities Charges</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full p-2 border rounded"
              value={newPaymentData.utilities_charges}
              onChange={(e) => handleInputChange('utilities_charges', parseFloat(e.target.value) || 0)}
              disabled={processing}
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Add utility charges for this payment</p>
          </div>

          {/* SHOW TOTAL DUE */}
          {totalDue > 0 && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Amount Due:</span>
                <span className="text-lg font-bold text-blue-900">{formatCurrency(totalDue)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>Rent:</span>
                  <span>{formatCurrency(newPaymentData.amount_due)}</span>
                </div>
                {newPaymentData.utilities_charges > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Utilities:</span>
                    <span>{formatCurrency(newPaymentData.utilities_charges)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method *</label>
            <select 
              className="w-full p-2 border rounded"
              value={newPaymentData.payment_method}
              onChange={(e) => handleInputChange('payment_method', e.target.value)}
              disabled={processing}
            >
              <option value="">Select Payment Method</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Online Payment">Online Payment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount Paid *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full p-2 border rounded"
              value={newPaymentData.amount_paid}
              onChange={(e) => handleInputChange('amount_paid', parseFloat(e.target.value) || 0)}
              disabled={processing}
            />
            <p className="text-xs text-gray-500 mt-1">
              {newPaymentData.amount_paid < totalDue 
                ? `Partial payment (${formatCurrency(totalDue - newPaymentData.amount_paid)} remaining)`
                : newPaymentData.amount_paid === totalDue
                ? 'Full payment'
                : 'Overpayment'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Reference</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={newPaymentData.payment_reference}
              onChange={(e) => handleInputChange('payment_reference', e.target.value)}
              placeholder="Transaction ID, receipt number, etc."
              disabled={processing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Date *</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={newPaymentData.payment_date}
              onChange={(e) => handleInputChange('payment_date', e.target.value)}
              disabled={processing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              className="w-full p-2 border rounded"
              rows="3"
              value={newPaymentData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about the payment..."
              disabled={processing}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded flex items-center hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={processing || !newPaymentData.lease_id || !newPaymentData.payment_method || !newPaymentData.amount_paid}
            >
              {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <DollarSign className="w-4 h-4 mr-2" />}
              {processing ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPaymentModal;