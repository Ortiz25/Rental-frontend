import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const VerificationModal = ({ 
  submission, 
  isOpen, 
  onClose, 
  onVerify, 
  onReject, 
  processing 
}) => {
  const [action, setAction] = useState('verify');
  const [verificationData, setVerificationData] = useState({
    admin_notes: '',
    verified_amount: 0,
    apply_to_account: true
  });

  useEffect(() => {
    if (submission) {
      setVerificationData(prev => ({
        ...prev,
        verified_amount: submission.amount
      }));
    }
  }, [submission]);

  const handleVerify = async () => {
    if (!verificationData.admin_notes.trim()) {
      alert('Please add verification notes');
      return;
    }
    await onVerify(submission.id, verificationData);
  };

  const handleReject = async () => {
    if (!verificationData.admin_notes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    await onReject(submission.id, {
      admin_notes: verificationData.admin_notes
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {action === 'verify' ? 'Verify Payment' : 'Reject Payment'} - {submission.tenant_name}
          </h2>
          <button onClick={onClose} disabled={processing}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Action Toggle */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setAction('verify')}
              className={`px-4 py-2 rounded flex items-center ${
                action === 'verify' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Payment
            </button>
            <button
              onClick={() => setAction('reject')}
              className={`px-4 py-2 rounded flex items-center ${
                action === 'reject' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <X className="w-4 h-4 mr-2" />
              Reject Payment
            </button>
          </div>

          {/* Submission Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Payment Submission Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tenant</p>
                <p className="font-medium">{submission.tenant_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Property</p>
                <p className="font-medium">{submission.property_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium">{formatCurrency(submission.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium capitalize">
                  {submission.payment_method.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Reference</p>
                <p className="font-medium font-mono">{submission.transaction_reference}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Date</p>
                <p className="font-medium">
                  {new Date(submission.transaction_date).toLocaleDateString()}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Current Account Balance</p>
                <p className={`font-medium ${
                  submission.current_balance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(submission.current_balance || 0)}
                </p>
              </div>
            </div>
            
            {submission.tenant_notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Tenant Notes</p>
                <p className="bg-blue-50 p-2 rounded italic">"{submission.tenant_notes}"</p>
              </div>
            )}
          </div>

          {/* Verification Form */}
          {action === 'verify' && (
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Verified Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={verificationData.verified_amount}
                  onChange={(e) => setVerificationData(prev => ({
                    ...prev,
                    verified_amount: parseFloat(e.target.value)
                  }))}
                  disabled={processing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Adjust if the verified amount differs from submitted amount
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="apply_to_account"
                  checked={verificationData.apply_to_account}
                  onChange={(e) => setVerificationData(prev => ({
                    ...prev,
                    apply_to_account: e.target.checked
                  }))}
                  disabled={processing}
                />
                <label htmlFor="apply_to_account" className="text-sm">
                  Automatically apply to tenant's oldest unpaid rent
                </label>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {action === 'verify' ? 'Verification Notes *' : 'Rejection Reason *'}
            </label>
            <textarea
              className={`w-full p-2 border rounded focus:ring-2 ${
                action === 'verify' 
                  ? 'focus:ring-green-500 focus:border-green-500' 
                  : 'focus:ring-red-500 focus:border-red-500'
              }`}
              rows="4"
              value={verificationData.admin_notes}
              onChange={(e) => setVerificationData(prev => ({
                ...prev,
                admin_notes: e.target.value
              }))}
              placeholder={
                action === 'verify' 
                  ? 'Add notes about the verification process...' 
                  : 'Explain why this payment is being rejected...'
              }
              disabled={processing}
              required
            />
          </div>

          {/* Warning for rejection */}
          {action === 'reject' && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <div>
                  <h4 className="font-medium text-red-800">Payment Rejection</h4>
                  <p className="text-sm text-red-700">
                    The tenant will be notified of the rejection and can submit a new payment proof. 
                    Please provide a clear reason for rejection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={processing}
            >
              Cancel
            </button>
            
            {action === 'verify' ? (
              <button
                onClick={handleVerify}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center"
                disabled={processing || !verificationData.admin_notes.trim()}
              >
                {processing && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {processing ? 'Verifying...' : 'Verify Payment'}
              </button>
            ) : (
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center"
                disabled={processing || !verificationData.admin_notes.trim()}
              >
                {processing && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {processing ? 'Rejecting...' : 'Reject Payment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;