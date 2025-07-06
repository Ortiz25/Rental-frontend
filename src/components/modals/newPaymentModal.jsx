import React, { useState } from 'react';
import { X, DollarSign, RefreshCw } from 'lucide-react';

const NewPaymentModal = ({ isOpen, onClose, activeLeases, onSubmit, processing }) => {
  const [newPaymentData, setNewPaymentData] = useState({
    lease_id: '',
    amount_due: 0,
    amount_paid: 0,
    payment_method: '',
    payment_reference: '',
    payment_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
    processed_by: 'Admin'
  });
  const [selectedLease, setSelectedLease] = useState(null);

  const handleLeaseChange = (leaseId) => {
    const lease = activeLeases.find(l => l.id === parseInt(leaseId));
    setSelectedLease(lease);
    if (lease) {
      setNewPaymentData(prev => ({
        ...prev,
        lease_id: leaseId,
        amount_due: lease.monthly_rent,
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (!isOpen) return null;

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
            <label className="block text-sm font-medium mb-2">Amount Due *</label>
            <input
              type="number"
              step="0.01"
              className="w-full p-2 border rounded"
              value={newPaymentData.amount_due}
              onChange={(e) => handleInputChange('amount_due', parseFloat(e.target.value))}
              disabled={processing}
            />
          </div>

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
              className="w-full p-2 border rounded"
              value={newPaymentData.amount_paid}
              onChange={(e) => handleInputChange('amount_paid', parseFloat(e.target.value))}
              disabled={processing}
            />
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
              className="px-4 py-2 border rounded"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded flex items-center disabled:opacity-50"
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