import React from "react";
import { X, Calendar, DollarSign, Key, FileText, MapPin } from "lucide-react";
import { formatCurrency } from "../../utils/helperFunctions";

const OffboardingDetailsModal = ({ details, tenant, onClose }) => {
  if (!details) return null;

  console.log(details, tenant)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b bg-orange-50">
          <div>
            <h2 className="text-xl font-bold text-orange-900">Offboarding Details</h2>
            <p className="text-sm text-orange-700">{tenant.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Move-out Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Move-out Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Move-out Date</p>
                <p className="font-medium">{formatDate(details.moveOutDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Processed By</p>
                <p className="font-medium">{details.processedBy || 'System'}</p>
              </div>
            </div>
          </div>

          {/* Forwarding Address */}
          {details.confirmAddress && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Forwarding Address
              </h3>
              <p className="text-sm">{details.confirmAddress}</p>
            </div>
          )}

          {/* Security Deposit Settlement */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Security Deposit Settlement
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Refund Amount:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(details.depositRefund)}
                </span>
              </div>
              
              {details.deductions && details.deductions.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Deductions:</p>
                  {details.deductions.map((deduction, index) => (
                    <div key={index} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{deduction.description}</span>
                      <span className="text-red-600">
                        -{formatCurrency(deduction.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                    <span>Total Deductions:</span>
                    <span className="text-red-600">
                      -{formatCurrency(details.totalDeductions || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Keys Returned */}
          {details.keyReturn && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <Key className="w-5 h-5 mr-2 text-yellow-600" />
                Keys Returned
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(details.keyReturn).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-sm text-gray-600 capitalize">{type}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspection Findings */}
          {details.inspectionFindings && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Inspection Findings
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {details.inspectionFindings}
              </p>
            </div>
          )}

          {/* Notes */}
          {details.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Additional Notes
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {details.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OffboardingDetailsModal;