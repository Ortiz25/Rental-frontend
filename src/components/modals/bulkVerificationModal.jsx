import React, { useState } from 'react';
import { X, CheckCircle, RefreshCw } from 'lucide-react';

const BulkVerificationModal = ({ 
  selectedSubmissions, 
  submissions,
  isOpen, 
  onClose, 
  onBulkVerify, 
  processing 
}) => {
  const [bulkData, setBulkData] = useState({
    action: 'verify',
    admin_notes: '',
    apply_to_accounts: true
  });

  const selectedItems = submissions.filter(sub => selectedSubmissions.includes(sub.id));
  const totalAmount = selectedItems.reduce((sum, sub) => sum + sub.amount, 0);

  const handleBulkAction = async () => {
    if (!bulkData.admin_notes.trim()) {
      alert('Please add notes for bulk action');
      return;
    }
    await onBulkVerify(selectedSubmissions, bulkData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (!isOpen || selectedSubmissions.length === 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            Bulk Action - {selectedSubmissions.length} Payment{selectedSubmissions.length > 1 ? 's' : ''}
          </h2>
          <button onClick={onClose} disabled={processing}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Action Selection */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setBulkData(prev => ({ ...prev, action: 'verify' }))}
              className={`px-4 py-2 rounded flex items-center ${
                bulkData.action === 'verify' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify All
            </button>
            <button
              onClick={() => setBulkData(prev => ({ ...prev, action: 'reject' }))}
              className={`px-4 py-2 rounded flex items-center ${
                bulkData.action === 'reject' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <X className="w-4 h-4 mr-2" />
              Reject All
            </button>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Bulk Action Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Selected Payments</p>
                <p className="font-medium">{selectedSubmissions.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Selected Items List */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Selected Payments:</h4>
            <div className="max-h-40 overflow-y-auto border rounded">
              {selectedItems.map(item => (
                <div key={item.id} className="p-3 border-b last:border-b-0 flex justify-between">
                  <div>
                    <p className="font-medium">{item.tenant_name}</p>
                    <p className="text-sm text-gray-600">{item.property_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.amount)}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {item.payment_method.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options for verification */}
          {bulkData.action === 'verify' && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="bulk_apply_to_accounts"
                  checked={bulkData.apply_to_accounts}
                  onChange={(e) => setBulkData(prev => ({
                    ...prev,
                    apply_to_accounts: e.target.checked
                  }))}
                  disabled={processing}
                />
                <label htmlFor="bulk_apply_to_accounts" className="text-sm">
                  Automatically apply all verified payments to tenant accounts
                </label>
              </div>
            </div>
          )}

          {/* Bulk Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {bulkData.action === 'verify' ? 'Bulk Verification Notes *' : 'Bulk Rejection Reason *'}
            </label>
            <textarea
              className={`w-full p-2 border rounded focus:ring-2 ${
                bulkData.action === 'verify' 
                  ? 'focus:ring-green-500 focus:border-green-500' 
                  : 'focus:ring-red-500 focus:border-red-500'
              }`}
              rows="3"
              value={bulkData.admin_notes}
              onChange={(e) => setBulkData(prev => ({
                ...prev,
                admin_notes: e.target.value
              }))}
              placeholder={
                bulkData.action === 'verify' 
                  ? 'Add notes for bulk verification...' 
                  : 'Explain why these payments are being rejected...'
              }
              disabled={processing}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={processing}
            >
              Cancel
            </button>
            
            <button
              onClick={handleBulkAction}
              className={`px-4 py-2 rounded text-white disabled:opacity-50 flex items-center ${
                bulkData.action === 'verify' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
              disabled={processing || !bulkData.admin_notes.trim()}
            >
              {processing && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {processing 
                ? `${bulkData.action === 'verify' ? 'Verifying' : 'Rejecting'}...` 
                : `${bulkData.action === 'verify' ? 'Verify' : 'Reject'} ${selectedSubmissions.length} Payment${selectedSubmissions.length > 1 ? 's' : ''}`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkVerificationModal;