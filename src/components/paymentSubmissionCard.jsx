import React from 'react';
import { 
  CheckCircle, 
  X, 
  FileText 
} from 'lucide-react';

const PaymentSubmissionCard = ({ 
  submission, 
  isSelected, 
  onSelect, 
  onViewDetails, 
  onVerify, 
  onReject 
}) => {
  const getPaymentMethodIcon = (method) => {
    const icons = {
      'mpesa': '📱',
      'airtel_money': '📲',
      'bank_transfer': '🏦',
      'cash': '💵',
      'check': '📝'
    };
    return icons[method] || '💳';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'verified': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'under_review': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyIndicator = (submissionDate) => {
    const now = new Date();
    const submitted = new Date(submissionDate);
    const hoursDiff = (now - submitted) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      return { color: 'text-red-600', text: 'Urgent - Over 24hrs' };
    } else if (hoursDiff > 12) {
      return { color: 'text-orange-600', text: 'Priority - Over 12hrs' };
    } else {
      return { color: 'text-green-600', text: 'Recent' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const urgency = getUrgencyIndicator(submission.submission_date);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
      submission.verification_status === 'pending' ? 'border-yellow-400' :
      submission.verification_status === 'verified' ? 'border-green-400' :
      'border-red-400'
    }`}>
      {/* Selection checkbox and header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          {submission.verification_status === 'pending' && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(submission.id)}
              className="mt-1 h-4 w-4 text-blue-600 rounded"
            />
          )}
          <div>
            <h3 className="text-lg font-bold">{submission.tenant_name}</h3>
            <p className="text-gray-600">{submission.property_name} - Unit {submission.unit_number}</p>
            <p className="text-sm text-gray-500">Lease: {submission.lease_number}</p>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(submission.verification_status)}`}>
            {submission.verification_status.charAt(0).toUpperCase() + submission.verification_status.slice(1)}
          </span>
          <div className={`text-xs mt-1 ${urgency.color}`}>
            {urgency.text}
          </div>
        </div>
      </div>

      {/* Payment details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Amount Submitted</p>
          <p className="font-semibold text-lg">
            {formatCurrency(submission.amount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Current Balance</p>
          <p className={`font-semibold ${
            submission.current_balance > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {formatCurrency(submission.current_balance || 0)}
          </p>
        </div>
      </div>

      {/* Transaction details */}
      <div className="bg-gray-50 p-3 rounded mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getPaymentMethodIcon(submission.payment_method)}</span>
            <span className="font-medium capitalize">
              {submission.payment_method.replace('_', ' ')}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {new Date(submission.transaction_date).toLocaleDateString()}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Reference:</span>
            <span className="font-mono text-sm">{submission.transaction_reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Submitted:</span>
            <span className="text-sm">
              {new Date(submission.submission_date).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tenant notes */}
      {submission.tenant_notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Tenant Notes:</p>
          <p className="text-sm bg-blue-50 p-2 rounded italic">
            "{submission.tenant_notes}"
          </p>
        </div>
      )}

      {/* Admin notes (if verified/rejected) */}
      {submission.admin_notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Admin Notes:</p>
          <p className="text-sm bg-gray-50 p-2 rounded">
            {submission.admin_notes}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between items-center border-t pt-4">
        <button 
          onClick={() => onViewDetails(submission)}
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          <FileText className="w-4 h-4 mr-1" />
          View Details
        </button>
        
        {submission.verification_status === 'pending' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onReject(submission)}
              className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </button>
            <button
              onClick={() => onVerify(submission)}
              className="text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Verify
            </button>
          </div>
        )}
        
        {submission.verification_status === 'verified' && submission.verified_date && (
          <div className="text-sm text-green-600">
            ✓ Verified on {new Date(submission.verified_date).toLocaleDateString()}
          </div>
        )}
        
        {submission.verification_status === 'rejected' && submission.verified_date && (
          <div className="text-sm text-red-600">
            ✗ Rejected on {new Date(submission.verified_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSubmissionCard;