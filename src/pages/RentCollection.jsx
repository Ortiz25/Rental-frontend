import React, { useState, useEffect } from 'react';
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
  X,
  RefreshCw,
  Plus
} from 'lucide-react';
import Navbar from '../layout/navbar.jsx';

// API service functions
const API_BASE_URL = '/backend';

const rentCollectionAPI = {
  // Get all rent payments with filters
  getPayments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/rent-collection?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get payment summary/dashboard stats
  getSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/rent-collection/summary?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get single payment by ID
  getPaymentById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/rent-collection/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Process payment
  processPayment: async (id, paymentData) => {
    const response = await fetch(`${API_BASE_URL}/rent-collection/${id}/process`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    return response.json();
  },

  // Generate rent payments for a month
  generatePayments: async (month, year) => {
    const response = await fetch(`${API_BASE_URL}/rent-collection/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ month, year })
    });
    return response.json();
  },

  // Send reminders
  sendReminders: async (paymentIds, reminderType = 'overdue') => {
    const response = await fetch(`${API_BASE_URL}/rent-collection/send-reminders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payment_ids: paymentIds, reminder_type: reminderType })
    });
    return response.json();
  },

  // Update overdue payments
  updateOverdue: async () => {
    const response = await fetch(`${API_BASE_URL}/rent-collection/update-overdue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get active tenants for payment recording
  getActiveTenants: async () => {
    const response = await fetch(`${API_BASE_URL}/tenants?status=active`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get active leases
  getActiveLeases: async () => {
    const response = await fetch(`${API_BASE_URL}/leases?status=active`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Create new payment record
  createPayment: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/rent-collection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    return response.json();
  }
};

const RentCollection = () => {
  const [activeModule, setActiveModule] = useState('Rent Collection');
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [activeLeases, setActiveLeases] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });

  // Load data on component mount and filter changes
  useEffect(() => {
    loadPayments();
    loadSummary();
    loadTenants();
    loadActiveLeases();
  }, [filters]);

  const loadTenants = async () => {
    try {
      const result = await rentCollectionAPI.getActiveTenants();
      if (result.success) {
        setTenants(result.data);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadActiveLeases = async () => {
    try {
      const result = await rentCollectionAPI.getActiveLeases();
      if (result.success) {
        setActiveLeases(result.data);
      }
    } catch (error) {
      console.error('Error loading active leases:', error);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const result = await rentCollectionAPI.getPayments(filters);
      if (result.success) {
        setPayments(result.data);
        setPagination(result.pagination);
      } else {
        console.error('Error loading payments:', result.message);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const result = await rentCollectionAPI.getSummary({
        month: filters.month,
        year: filters.year
      });
      if (result.success) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset to page 1 when other filters change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPayments();
  };

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

  // New Payment Modal Component
  const NewPaymentModal = ({ isOpen, onClose }) => {
    const [newPaymentData, setNewPaymentData] = useState({
      lease_id: '',
      amount_due: 0,
      amount_paid: 0,
      payment_method: '',
      payment_reference: '',
      payment_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      notes: '',
      processed_by: 'Admin' // You might want to get this from user context
    });
    const [selectedLease, setSelectedLease] = useState(null);
    const [creating, setCreating] = useState(false);

    const handleLeaseChange = (leaseId) => {
      const lease = activeLeases.find(l => l.id === parseInt(leaseId));
      setSelectedLease(lease);
      if (lease) {
        setNewPaymentData(prev => ({
          ...prev,
          lease_id: leaseId,
          amount_due: lease.monthly_rent,
          amount_paid: lease.monthly_rent
        }));
      }
    };

    const handleInputChange = (field, value) => {
      setNewPaymentData(prev => ({ ...prev, [field]: value }));
    };

    const handleCreatePayment = async () => {
      if (!newPaymentData.lease_id || !newPaymentData.payment_method || !newPaymentData.amount_paid) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        setCreating(true);
        
        // First create the payment record
        const createResult = await rentCollectionAPI.createPayment({
          lease_id: newPaymentData.lease_id,
          due_date: newPaymentData.due_date,
          amount_due: newPaymentData.amount_due,
          amount_paid: 0, // Start with 0, then process payment
          payment_status: 'pending'
        });

        if (createResult.success) {
          // Then immediately process the payment
          const processResult = await rentCollectionAPI.processPayment(createResult.data.id, {
            amount_paid: newPaymentData.amount_paid,
            payment_method: newPaymentData.payment_method,
            payment_reference: newPaymentData.payment_reference,
            payment_date: newPaymentData.payment_date,
            notes: newPaymentData.notes,
            processed_by: newPaymentData.processed_by
          });

          if (processResult.success) {
            alert('Payment recorded successfully!');
            loadPayments();
            loadSummary();
            onClose();
            // Reset form
            setNewPaymentData({
              lease_id: '',
              amount_due: 0,
              amount_paid: 0,
              payment_method: '',
              payment_reference: '',
              payment_date: new Date().toISOString().split('T')[0],
              due_date: new Date().toISOString().split('T')[0],
              notes: '',
              processed_by: 'Admin'
            });
            setSelectedLease(null);
          } else {
            alert('Error processing payment: ' + processResult.message);
          }
        } else {
          alert('Error creating payment: ' + createResult.message);
        }
      } catch (error) {
        alert('Error recording payment: ' + error.message);
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">Record New Payment</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Tenant/Lease *</label>
              <select 
                className="w-full p-2 border rounded"
                value={newPaymentData.lease_id}
                onChange={(e) => handleLeaseChange(e.target.value)}
              >
                <option value="">Select a lease...</option>
                {activeLeases.map(lease => (
                  <option key={lease.id} value={lease.id}>
                    {lease.primary_tenant_name} - {lease.property_name} ({lease.lease_number})
                  </option>
                ))}
              </select>
            </div>

            {selectedLease && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm"><strong>Property:</strong> {selectedLease.property_name}</p>
                <p className="text-sm"><strong>Monthly Rent:</strong> {formatCurrency(selectedLease.monthly_rent)}</p>
                <p className="text-sm"><strong>Tenant:</strong> {selectedLease.primary_tenant_name}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Due Date *</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={newPaymentData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount Due *</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded"
                value={newPaymentData.amount_due}
                onChange={(e) => handleInputChange('amount_due', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Method *</label>
              <select 
                className="w-full p-2 border rounded"
                value={newPaymentData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value)}
              >
                <option value="">Select Payment Method</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount Paid *</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded"
                value={newPaymentData.amount_paid}
                onChange={(e) => handleInputChange('amount_paid', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Reference</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={newPaymentData.payment_reference}
                onChange={(e) => handleInputChange('payment_reference', e.target.value)}
                placeholder="Transaction ID, receipt number, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Date *</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={newPaymentData.payment_date}
                onChange={(e) => handleInputChange('payment_date', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="3"
                value={newPaymentData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about the payment..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePayment}
                className="px-4 py-2 bg-green-500 text-white rounded flex items-center"
                disabled={creating || !newPaymentData.lease_id || !newPaymentData.payment_method || !newPaymentData.amount_paid}
              >
                {creating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <DollarSign className="w-4 h-4 mr-2" />}
                {creating ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const GeneratePaymentsModal = ({ isOpen, onClose }) => {
    const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);
    const [generateYear, setGenerateYear] = useState(new Date().getFullYear());
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
      try {
        setGenerating(true);
        const result = await rentCollectionAPI.generatePayments(generateMonth, generateYear);
        if (result.success) {
          alert(result.message);
          loadPayments();
          loadSummary();
          onClose();
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        alert('Error generating payments: ' + error.message);
      } finally {
        setGenerating(false);
      }
    };

    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-96">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">Generate Rent Payments</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Month</label>
              <select 
                className="w-full p-2 border rounded"
                value={generateMonth}
                onChange={(e) => setGenerateMonth(parseInt(e.target.value))}
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={generateYear}
                onChange={(e) => setGenerateYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded"
                disabled={generating}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                disabled={generating}
              >
                {generating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Invoice Modal Component
  const InvoiceModal = ({ payment, isOpen, onClose }) => (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-2/3 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Invoice #{payment?.invoice_number}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Property</h3>
              <p>{payment?.property_unit}</p>
              <p className="text-gray-600">Tenant: {payment?.tenant_name}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Payment Details</h3>
              <p>Due Date: {formatDate(payment?.due_date)}</p>
              <p>Amount: {formatCurrency(payment?.amount_due)}</p>
              {payment?.payment_date && (
                <p>Paid: {formatDate(payment?.payment_date)}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span>Base Rent</span>
              <span>{formatCurrency(payment?.amount_due)}</span>
            </div>
            {payment?.late_fee > 0 && (
              <div className="flex justify-between items-center mb-4 text-red-600">
                <span>Late Fee</span>
                <span>{formatCurrency(payment?.late_fee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-bold border-t pt-4">
              <span>Total Due</span>
              <span>{formatCurrency((payment?.amount_due || 0) + (payment?.late_fee || 0))}</span>
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

  // Payment Modal Component
  const PaymentModal = ({ payment, isOpen, onClose }) => {
    const [paymentData, setPaymentData] = useState({
      payment_method: '',
      amount_paid: (payment?.amount_due || 0) + (payment?.late_fee || 0),
      payment_reference: '',
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
      processed_by: 'Admin' // You might want to get this from user context
    });

    useEffect(() => {
      if (payment) {
        setPaymentData(prev => ({
          ...prev,
          amount_paid: (payment.amount_due || 0) + (payment.late_fee || 0)
        }));
      }
    }, [payment]);

    const handleInputChange = (field, value) => {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    };

    const handlePayment = async () => {
      if (!paymentData.payment_method || !paymentData.amount_paid) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        setProcessing(true);
        const result = await rentCollectionAPI.processPayment(payment.id, paymentData);
        
        if (result.success) {
          // Update the local payment data
          setPayments(prev => prev.map(p => 
            p.id === payment.id ? { ...p, ...result.data } : p
          ));
          
          // Reload summary to reflect changes
          loadSummary();
          
          alert('Payment processed successfully!');
          onClose();
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        alert('Error processing payment: ' + error.message);
      } finally {
        setProcessing(false);
      }
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
              <label className="block text-sm font-medium mb-2">Payment Method *</label>
              <select 
                className="w-full p-2 border rounded"
                value={paymentData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value)}
              >
                <option value="">Select Method</option>
                <option value="Bank Transfer">Bank Transfer</option>
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
                className="w-full p-2 border rounded"
                value={paymentData.amount_paid}
                onChange={(e) => handleInputChange('amount_paid', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Reference</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={paymentData.payment_reference}
                onChange={(e) => handleInputChange('payment_reference', e.target.value)}
                placeholder="Check number, transaction ID, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={paymentData.payment_date}
                onChange={(e) => handleInputChange('payment_date', e.target.value)}
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
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-green-500 text-white rounded flex items-center"
                disabled={processing || !paymentData.payment_method || !paymentData.amount_paid}
              >
                {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {processing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Payment Card Component
  const PaymentCard = ({ payment }) => (
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
          onClick={() => {
            setSelectedPayment(payment);
            setShowInvoiceModal(true);
          }}
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          <FileText className="w-4 h-4 mr-1" />
          View Invoice
        </button>
        {payment.payment_status !== 'paid' && (
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

  // Handle bulk actions
  const handleSendReminders = async () => {
    const overduePayments = payments
      .filter(p => p.payment_status === 'overdue')
      .map(p => p.id);
    
    if (overduePayments.length === 0) {
      alert('No overdue payments found');
      return;
    }

    try {
      const result = await rentCollectionAPI.sendReminders(overduePayments, 'overdue');
      if (result.success) {
        alert(result.message);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error sending reminders: ' + error.message);
    }
  };

  const handleUpdateOverdue = async () => {
    try {
      const result = await rentCollectionAPI.updateOverdue();
      if (result.success) {
        alert(result.message);
        loadPayments();
        loadSummary();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error updating overdue payments: ' + error.message);
    }
  };

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Due</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.total_due)}
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
                  {formatCurrency(summary.total_collected)}
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
                  {formatCurrency(summary.total_pending)}
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
                  {formatCurrency(summary.total_overdue)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center space-x-4">
              <div>
                <select 
                  className="border rounded px-3 py-2"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
              
              <div>
                <select 
                  className="border rounded px-3 py-2"
                  value={filters.month}
                  onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <select 
                  className="border rounded px-3 py-2"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                >
                  {Array.from({length: 5}, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input 
                placeholder="Search payments..."
                className="border rounded px-4 py-2 w-64"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <button
                type="submit"
                className="bg-gray-100 p-2 rounded hover:bg-gray-200"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap space-x-2">
            <button 
              onClick={() => setShowNewPaymentModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600"
            >
              <Plus className="mr-2 w-4 h-4" /> Record Payment
            </button>
            <button 
              onClick={handleSendReminders}
              className="bg-orange-500 text-white px-4 py-2 rounded flex items-center hover:bg-orange-600"
            >
              <Send className="mr-2 w-4 h-4" /> Send Reminders
            </button>
            <button 
              onClick={handleUpdateOverdue}
              className="bg-red-500 text-white px-4 py-2 rounded flex items-center hover:bg-red-600"
            >
              <RefreshCw className="mr-2 w-4 h-4" /> Update Overdue
            </button>
            <button 
              onClick={() => setShowGenerateModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center hover:bg-green-600"
            >
              <Calendar className="mr-2 w-4 h-4" /> Generate Monthly
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded flex items-center hover:bg-gray-600">
              <Download className="mr-2 w-4 h-4" /> Export Report
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Collection Rate: {summary.collection_rate || 0}%
          </div>
        </div>

        {/* Payments Grid */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-600 mt-2">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No payments found</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {payments.map(payment => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({length: pagination.totalPages}, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`px-3 py-1 border rounded ${
                      page === pagination.currentPage ? 'bg-blue-500 text-white' : ''
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

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

        <NewPaymentModal 
          isOpen={showNewPaymentModal}
          onClose={() => setShowNewPaymentModal(false)}
        />

        <GeneratePaymentsModal 
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
        />
      </div>
    </Navbar>
  );
};

export default RentCollection;