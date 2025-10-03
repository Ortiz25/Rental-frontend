import React, { useState, useEffect } from 'react';
import { X, CheckCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/helperFunctions';

const PaymentModal = ({ payment, isOpen, onClose, onSubmit, processing }) => {
  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    amount_paid: 0,
    payment_reference: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
    processed_by: 'Admin'
  });

  useEffect(() => {
    if (payment) {
      // Calculate total including utilities - round to 2 decimal places
      const totalDue = 
        parseFloat((parseFloat(payment.amount_due) || 0).toFixed(2)) + 
        parseFloat((parseFloat(payment.utilities_charges) || 0).toFixed(2)) + 
        parseFloat((parseFloat(payment.late_fee) || 0).toFixed(2));
      
      setPaymentData(prev => ({
        ...prev,
        amount_paid: parseFloat(totalDue.toFixed(2))  // Ensure 2 decimal precision
      }));
    }
  }, [payment]);

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentData.payment_method || !paymentData.amount_paid) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(payment.id, paymentData);
  };

  if (!isOpen || !payment) return null;

  // Calculate amounts for display
  const rentAmount = parseFloat(payment.amount_due) || 0;
  const utilitiesAmount = parseFloat(payment.utilities_charges) || 0;
  const lateFee = parseFloat(payment.late_fee) || 0;
  const totalDue = rentAmount + utilitiesAmount + lateFee;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Process Payment</h2>
          <button onClick={onClose} disabled={processing}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <h3 className="font-semibold mb-2">Payment Summary</h3>
            <div className="flex justify-between">
              <span className="text-gray-600">Rent:</span>
              <span>{formatCurrency(rentAmount)}</span>
            </div>
            {utilitiesAmount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Utilities:</span>
                <span>{formatCurrency(utilitiesAmount)}</span>
              </div>
            )}
            {lateFee > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Late Fee:</span>
                <span>{formatCurrency(lateFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>Total Due:</span>
              <span>{formatCurrency(totalDue)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method *</label>
            <select 
              className="w-full p-2 border rounded"
              value={paymentData.payment_method}
              onChange={(e) => handleInputChange('payment_method', e.target.value)}
              disabled={processing}
            >
              <option value="">Select Method</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Online Payment">Online Payment</option>
              <option value="Money Order">Money Order</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount Paid *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full p-2 border rounded"
              value={paymentData.amount_paid}
              onChange={(e) => handleInputChange('amount_paid', parseFloat(e.target.value))}
              disabled={processing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Default is full amount. Adjust for partial payments.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Reference</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={paymentData.payment_reference}
              onChange={(e) => handleInputChange('payment_reference', e.target.value)}
              placeholder="Check number, transaction ID, etc."
              disabled={processing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={paymentData.payment_date}
              onChange={(e) => handleInputChange('payment_date', e.target.value)}
              disabled={processing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              className="w-full p-2 border rounded"
              rows="3"
              value={paymentData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
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
              disabled={processing || !paymentData.payment_method || !paymentData.amount_paid}
            >
              {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              {processing ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;