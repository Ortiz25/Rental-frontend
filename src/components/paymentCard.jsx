import React from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText 
} from 'lucide-react';

const PaymentCard = ({ payment, onViewInvoice, onProcessPayment }) => {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

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

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Due Amount</p>
          <p className="font-semibold">{formatCurrency(payment.amount_due)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Due Date</p>
          <p className="font-semibold">{formatDate(payment.due_date)}</p>
        </div>
        {payment.amount_paid > 0 && (
          <div className="text-green-600">
            <p className="text-sm">Amount Paid</p>
            <p className="font-semibold">{formatCurrency(payment.amount_paid)}</p>
          </div>
        )}
        {payment.late_fee > 0 && (
          <div className="text-red-600">
            <p className="text-sm">Late Fee</p>
            <p className="font-semibold">{formatCurrency(payment.late_fee)}</p>
          </div>
        )}
      </div>

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

      <div className="flex justify-between border-t pt-4">
        <button 
          onClick={() => onViewInvoice(payment)}
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          <FileText className="w-4 h-4 mr-1" />
          View Invoice
        </button>
        {payment.payment_status !== 'paid' && (
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