import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  Download, 
  Send, 
  CheckCircle, 
  Clock, 
  Filter,
  Search,
  BellRing,
  ArrowUpRight,
  FileText,
  X
} from 'lucide-react';
import Navbar from '../layout/navbar.jsx';



const initialPayments = [
  {
    id: 1,
    tenantName: "John Doe",
    propertyName: "123 Urban Loft, #304",
    amount: 2750,
    dueDate: "2024-02-01",
    status: "Paid",
    paymentDate: "2024-02-01",
    paymentMethod: "Bank Transfer",
    lateFee: 0,
    invoiceNumber: "INV-2024-001"
  },
  {
    id: 2,
    tenantName: "Jane Smith",
    propertyName: "456 Suburban Haven, Unit 12",
    amount: 3200,
    dueDate: "2024-02-01",
    status: "Overdue",
    lateFee: 150,
    invoiceNumber: "INV-2024-002"
  },
  {
    id: 3,
    tenantName: "Alice Johnson",
    propertyName: "789 Tech Campus, #205",
    amount: 2300,
    dueDate: "2024-02-01",
    status: "Pending",
    lateFee: 0,
    invoiceNumber: "INV-2024-003"
  }
];










const RentCollection = () => {

  const [activeModule, setActiveModule] = useState('Rent Collection')
  const [payments, setPayments] = useState(initialPayments);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Overdue': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  const getStatusIcon = (status) => {
    const icons = {
      'Paid': <CheckCircle className="w-5 h-5 text-green-500" />,
      'Pending': <Clock className="w-5 h-5 text-yellow-500" />,
      'Overdue': <AlertTriangle className="w-5 h-5 text-red-500" />
    };
    return icons[status];
  };

  const InvoiceModal = ({ payment, isOpen, onClose }) => (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-2/3 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Invoice #{payment?.invoiceNumber}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Property</h3>
              <p>{payment?.propertyName}</p>
              <p className="text-gray-600">Tenant: {payment?.tenantName}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Payment Details</h3>
              <p>Due Date: {new Date(payment?.dueDate).toLocaleDateString()}</p>
              <p>Amount: ${payment?.amount}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span>Base Rent</span>
              <span>${payment?.amount}</span>
            </div>
            {payment?.lateFee > 0 && (
              <div className="flex justify-between items-center mb-4 text-red-600">
                <span>Late Fee</span>
                <span>${payment?.lateFee}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-bold border-t pt-4">
              <span>Total Due</span>
              <span>${payment?.amount + (payment?.lateFee || 0)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded flex items-center">
              <Send className="w-4 h-4 mr-2" />
              Send to Tenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PaymentModal = ({ payment, isOpen, onClose }) => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [amount, setAmount] = useState(payment?.amount + (payment?.lateFee || 0));

    const handlePayment = () => {
      const updatedPayment = {
        ...payment,
        status: 'Paid',
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod
      };

      setPayments(payments.map(p => p.id === payment.id ? updatedPayment : p));
      onClose();
    };

    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-96">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">Process Payment</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select 
                className="w-full p-2 border rounded"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">Select Method</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-green-500 text-white rounded"
                disabled={!paymentMethod || !amount}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PaymentCard = ({ payment }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">{payment.tenantName}</h3>
          <p className="text-gray-600">{payment.propertyName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm flex items-center ${getStatusColor(payment.status)}`}>
          {getStatusIcon(payment.status)}
          <span className="ml-2">{payment.status}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Due Amount</p>
          <p className="font-semibold">${payment.amount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Due Date</p>
          <p className="font-semibold">{new Date(payment.dueDate).toLocaleDateString()}</p>
        </div>
        {payment.lateFee > 0 && (
          <div className="text-red-600">
            <p className="text-sm">Late Fee</p>
            <p className="font-semibold">${payment.lateFee}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between border-t pt-4">
        <button 
          onClick={() => {
            setSelectedPayment(payment);
            setShowInvoiceModal(true);
          }}
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          <FileText className="w-4 h-4 mr-1" />
          View Invoice
        </button>
        {payment.status !== 'Paid' && (
          <button
            onClick={() => {
              setSelectedPayment(payment);
              setShowPaymentModal(true);
            }}
            className="text-green-600 hover:underline text-sm flex items-center"
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Process Payment
          </button>
        )}
      </div>
    </div>
  );
  return (
    <Navbar module={activeModule} >
      <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600">Total Due</p>
        <p className="text-2xl font-bold">
          ${payments.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0)}
        </p>
      </div>
      <DollarSign className="w-8 h-8 text-blue-500" />
    </div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600">Collected</p>
        <p className="text-2xl font-bold text-green-600">
          ${payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)}
        </p>
      </div>
      <CheckCircle className="w-8 h-8 text-green-500" />
    </div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600">Pending</p>
        <p className="text-2xl font-bold text-yellow-600">
          ${payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)}
        </p>
      </div>
      <Clock className="w-8 h-8 text-yellow-500" />
    </div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600">Overdue</p>
        <p className="text-2xl font-bold text-red-600">
          ${payments.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + p.amount + p.lateFee, 0)}
        </p>
      </div>
      <AlertTriangle className="w-8 h-8 text-red-500" />
    </div>
  </div>
</div>


      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
  <div className="flex space-x-2">
    <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
      <Send className="mr-2" /> Send All Reminders
    </button>
    <button className="bg-green-500 text-white px-4 py-2 rounded flex items-center">
      <Download className="mr-2" /> Export Report
    </button>
  </div>
  <div className="flex space-x-2">
    <input 
      placeholder="Search payments..."
      className="border rounded px-4 py-2 w-full md:w-auto"
    />
    <button className="bg-gray-100 p-2 rounded">
      <Filter className="w-5 h-5" />
    </button>
  </div>
</div>


      {/* Payments Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {payments.map(payment => (
          <PaymentCard key={payment.id} payment={payment} />
        ))}
      </div>

      {/* Modals */}
      {selectedPayment && (
        <>
          <PaymentModal 
            payment={selectedPayment}
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPayment(null);
            }}
          />
          <InvoiceModal 
            payment={selectedPayment}
            isOpen={showInvoiceModal}
            onClose={() => {
              setShowInvoiceModal(false);
              setSelectedPayment(null);
            }}
          />
        </>
      )}
    </div>
    </Navbar>
 
)
} ;


  export default RentCollection