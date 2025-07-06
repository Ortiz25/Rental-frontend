import React from 'react';
import { X } from 'lucide-react';

const SubmissionDetailsModal = ({ submission, isOpen, onClose }) => {
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
          <h2 className="text-xl font-bold">Payment Submission Details</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Submission ID</p>
                <p className="font-medium">#{submission.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  submission.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  submission.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {submission.verification_status.charAt(0).toUpperCase() + submission.verification_status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted Date</p>
                <p className="font-medium">{new Date(submission.submission_date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Date</p>
                <p className="font-medium">{new Date(submission.transaction_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Tenant & Property Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Tenant & Property</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tenant Name</p>
                <p className="font-medium">{submission.tenant_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tenant Email</p>
                <p className="font-medium">{submission.tenant_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Property</p>
                <p className="font-medium">{submission.property_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unit</p>
                <p className="font-medium">Unit {submission.unit_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lease Number</p>
                <p className="font-medium">{submission.lease_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className={`font-medium ${
                  submission.current_balance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(submission.current_balance || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium text-lg">
                  {formatCurrency(submission.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium capitalize">
                  {submission.payment_method.replace('_', ' ')}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Transaction Reference</p>
                <p className="font-medium font-mono bg-gray-100 p-2 rounded">
                  {submission.transaction_reference}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(submission.tenant_notes || submission.admin_notes) && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Notes</h3>
              
              {submission.tenant_notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Tenant Notes</p>
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <p className="italic">"{submission.tenant_notes}"</p>
                  </div>
                </div>
              )}
              
              {submission.admin_notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Admin Notes</p>
                  <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-400">
                    <p>{submission.admin_notes}</p>
                    {submission.verified_date && (
                      <p className="text-sm text-gray-500 mt-2">
                        Added on {new Date(submission.verified_date).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification History */}
          {submission.verification_status !== 'pending' && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Verification History</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    submission.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {submission.verification_status === 'verified' ? 'Verified' : 'Rejected'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {submission.verified_date && new Date(submission.verified_date).toLocaleString()}
                  </span>
                </div>
                {submission.verified_by_username && (
                  <p className="text-sm text-gray-600 mt-2">
                    By: {submission.verified_by_username}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Payment Submitted</p>
                  <p className="text-sm text-gray-600">
                    {new Date(submission.submission_date).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {submission.verification_status !== 'pending' && (
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    submission.verification_status === 'verified' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">
                      Payment {submission.verification_status === 'verified' ? 'Verified' : 'Rejected'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {submission.verified_date && new Date(submission.verified_date).toLocaleString()}
                    </p>
                    {submission.verified_by_username && (
                      <p className="text-xs text-gray-500">
                        By {submission.verified_by_username}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailsModal;