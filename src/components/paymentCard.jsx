import React from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText 
} from 'lucide-react';
import { formatCurrency } from '../utils/helperFunctions';

const PaymentCard = ({ payment, onViewInvoice, onProcessPayment }) => {
   console.log(payment)
  const getStatusColor = (status) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'overdue': 'bg-red-100 text-red-800',
      'partial': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'paid': <CheckCircle className="w-5 h-5 text-green-500" />,
      'pending': <Clock className="w-5 h-5 text-yellow-500" />,
      'overdue': <AlertTriangle className="w-5 h-5 text-red-500" />,
      'partial': <Clock className="w-5 h-5 text-orange-500" />
    };
    return icons[status];
  };
  console.log(payment)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">{payment.tenant_name}</h3>
          <p className="text-gray-600">{payment.property_unit}</p>
          <p className="text-sm text-gray-500">Lease: {payment.lease_number}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm flex items-center ${getStatusColor(payment.payment_status)}`}>
          {getStatusIcon(payment.payment_status)}
          <span className="ml-2 capitalize">{payment.payment_status}</span>
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {/* Rent Amount */}
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-sm text-gray-600">Rent Amount:</span>
          <span className="font-medium">{formatCurrency(payment.amount_due)}</span>
        </div>

        {/* Utility Breakdown */}
        {payment.utilities_charges > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">Utility Charges:</span>
              <span className="font-bold text-blue-900">{formatCurrency(payment.utilities_charges)}</span>
            </div>
            
            {payment.utility_breakdown && (
              <div className="space-y-1 text-xs text-gray-700 ml-2">
                {payment.utility_breakdown.water_charges > 0 && (
                  <div className="flex justify-between">
                    <span>• Water:</span>
                    <span>{formatCurrency(payment.utility_breakdown.water_charges)}</span>
                  </div>
                )}
                {payment.utility_breakdown.electricity_charges > 0 && (
                  <div className="flex justify-between">
                    <span>• Electricity:</span>
                    <span>{formatCurrency(payment.utility_breakdown.electricity_charges)}</span>
                  </div>
                )}
                {payment.utility_breakdown.gas_charges > 0 && (
                  <div className="flex justify-between">
                    <span>• Gas:</span>
                    <span>{formatCurrency(payment.utility_breakdown.gas_charges)}</span>
                  </div>
                )}
                {payment.utility_breakdown.service_charges > 0 && (
                  <div className="flex justify-between">
                    <span>• Service Charges:</span>
                    <span>{formatCurrency(payment.utility_breakdown.service_charges)}</span>
                  </div>
                )}
                {payment.utility_breakdown.garbage_charges > 0 && (
                  <div className="flex justify-between">
                    <span>• Garbage:</span>
                    <span>{formatCurrency(payment.utility_breakdown.garbage_charges)}</span>
                  </div>
                )}
                {payment.utility_breakdown.common_area_charges > 0 && (
                  <div className="flex justify-between">
                    <span>• Common Area:</span>
                    <span>{formatCurrency(payment.utility_breakdown.common_area_charges)}</span>
                  </div>
                )}
                {payment.utility_breakdown.other_charges > 0 && (
                  <div className="flex justify-between">
                    <span>• Other ({payment.utility_breakdown.other_charges_description || 'Misc'}):</span>
                    <span>{formatCurrency(payment.utility_breakdown.other_charges)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Late Fee */}
        {payment.late_fee > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Late Fee:</span>
            <span className="font-medium text-red-600">{formatCurrency(payment.late_fee)}</span>
          </div>
        )}

        {/* Total Amount Due */}
        <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
          <span className="text-lg font-bold">Total Amount Due:</span>
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(payment.total_amount_due || 
              (parseFloat(payment.amount_due) + 
               parseFloat(payment.utilities_charges || 0) + 
               parseFloat(payment.late_fee || 0)))}
          </span>
        </div>

        {/* Amount Paid */}
        {payment.amount_paid > 0 && (
          <>
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm">Amount Paid:</span>
              <span className="font-semibold">{formatCurrency(payment.amount_paid)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-bold">Balance Due:</span>
              <span className={`font-bold ${
                (payment.total_amount_due - payment.amount_paid) > 0 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {formatCurrency(
                  (payment.total_amount_due || 
                    (parseFloat(payment.amount_due) + 
                     parseFloat(payment.utilities_charges || 0) + 
                     parseFloat(payment.late_fee || 0))) - 
                  parseFloat(payment.amount_paid || 0)
                )}
              </span>
            </div>
          </>
        )}

        {/* Due Date */}
        <div className="flex justify-between items-center text-sm pt-2 border-t">
          <span className="text-gray-600">Due Date:</span>
          <span className="font-medium">{formatDate(payment.due_date)}</span>
        </div>
      </div>

      {/* Payment Information */}
      {payment.payment_method && (
        <div className="mb-4 text-sm">
          <span className="text-gray-600">Payment Method: </span>
          <span className="font-medium">{payment.payment_method}</span>
          {payment.payment_date && (
            <>
              <span className="text-gray-600"> • Paid: </span>
              <span className="font-medium">{formatDate(payment.payment_date)}</span>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between border-t pt-4">
        <button 
          onClick={() => onViewInvoice(payment)}
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          <FileText className="w-4 h-4 mr-1" />
          View Invoice
        </button>
        {(+payment.amount_due + +payment.utilities_charges) !== +payment.amount_paid && (
          <button
            onClick={() => onProcessPayment(payment)}
            className="text-green-600 hover:underline text-sm flex items-center"
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Process Payment
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;