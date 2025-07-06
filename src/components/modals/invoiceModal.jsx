import React from 'react';
import { X, Download, Send } from 'lucide-react';

const InvoiceModal = ({ payment, isOpen, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-2/3 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            Invoice #{payment.invoice_number || `INV-${payment.id}`}
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Property Information</h3>
              <p className="font-medium">{payment.property_unit}</p>
              <p className="text-gray-600">Tenant: {payment.tenant_name}</p>
              <p className="text-gray-600">Lease: {payment.lease_number}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2 text-lg">Payment Details</h3>
              <div className="space-y-1">
                <p><span className="text-gray-600">Issue Date:</span> {formatDate(new Date())}</p>
                <p><span className="text-gray-600">Due Date:</span> {formatDate(payment.due_date)}</p>
                {payment.payment_date && (
                  <p><span className="text-gray-600">Paid Date:</span> {formatDate(payment.payment_date)}</p>
                )}
                <p className={`font-semibold ${
                  payment.payment_status === 'paid' ? 'text-green-600' : 
                  payment.payment_status === 'overdue' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  Status: {payment.payment_status.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3">Description</th>
                  <th className="text-right py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3">
                    <div>
                      <p className="font-medium">Monthly Rent</p>
                      <p className="text-sm text-gray-600">
                        Period: {formatDate(payment.due_date)}
                      </p>
                    </div>
                  </td>
                  <td className="text-right py-3 font-medium">
                    {formatCurrency(payment.amount_due)}
                  </td>
                </tr>
                
                {payment.late_fee > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-red-600">Late Fee</p>
                        <p className="text-sm text-gray-600">
                          Applied for overdue payment
                        </p>
                      </div>
                    </td>
                    <td className="text-right py-3 font-medium text-red-600">
                      {formatCurrency(payment.late_fee)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Summary */}
          <div className="border-t-2 border-gray-300 pt-4 mb-8">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(payment.amount_due)}</span>
                </div>
                
                {payment.late_fee > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Late Fee:</span>
                    <span>{formatCurrency(payment.late_fee)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Due:</span>
                  <span>{formatCurrency((payment.amount_due || 0) + (payment.late_fee || 0))}</span>
                </div>
                
                {payment.amount_paid > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Amount Paid:</span>
                      <span>{formatCurrency(payment.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Balance Due:</span>
                      <span className={
                        (payment.amount_due + (payment.late_fee || 0) - payment.amount_paid) > 0 
                          ? 'text-red-600' : 'text-green-600'
                      }>
                        {formatCurrency(
                          (payment.amount_due || 0) + (payment.late_fee || 0) - (payment.amount_paid || 0)
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {payment.payment_method && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Method:</span> {payment.payment_method}
                </div>
                {payment.payment_reference && (
                  <div>
                    <span className="text-gray-600">Reference:</span> {payment.payment_reference}
                  </div>
                )}
                {payment.payment_date && (
                  <div>
                    <span className="text-gray-600">Date:</span> {formatDate(payment.payment_date)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t pt-4">
            <p>Thank you for your business!</p>
            <p>For questions about this invoice, please contact the property management office.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-6 pt-6 border-t">
            <button 
              onClick={() => window.print()}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button 
              onClick={() => alert('Email functionality would be implemented here')}
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center hover:bg-green-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to Tenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;