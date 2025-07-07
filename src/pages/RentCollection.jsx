import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  Download, 
  Send, 
  CheckCircle, 
  Clock, 
  Search,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import { redirect } from 'react-router';

// Import components
import Navbar from '../layout/navbar.jsx';
import PaymentCard from '../components/paymentCard.jsx';
import PaymentSubmissionCard from '../components/paymentSubmissionCard.jsx';
import PaymentModal from '../components/modals/paymentModal.jsx';
import VerificationModal from '../components/modals/verificationModal.jsx';
import BulkVerificationModal from '../components/modals/bulkVerificationModal.jsx';
import NewPaymentModal from '../components/modals/newPaymentModal.jsx';
import GeneratePaymentsModal from '../components/modals/GenerateReportModal.jsx';
import InvoiceModal from '../components/modals/invoiceModal.jsx';
import SubmissionDetailsModal from '../components/modals/submissionDetailsModal.jsx';
import VerificationFilters from '../components/verificationFilters.jsx';

// API service functions
const API_BASE_URL = 'http://localhost:5020/api';

const rentCollectionAPI = {
  // Existing API functions...
  
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

  getActiveLeases: async () => {
    const response = await fetch(`${API_BASE_URL}/leases?status=active`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

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
  },

  getPayments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/rent/rent-collection?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  getSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/rent/rent-collection/summary?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Verification API functions
  getPendingSubmissions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/payment-verification/payment-submissions/pending?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  getSubmissionHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/payment-verification/payment-submissions/history?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  verifyPaymentSubmission: async (submissionId, verificationData) => {
    const response = await fetch(`${API_BASE_URL}/payment-verification/payment-submissions/${submissionId}/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verificationData)
    });
    return response.json();
  },

  rejectPaymentSubmission: async (submissionId, rejectionData) => {
    const response = await fetch(`${API_BASE_URL}/payment-verification/payment-submissions/${submissionId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rejectionData)
    });
    return response.json();
  },

  getSubmissionDetails: async (submissionId) => {
    const response = await fetch(`${API_BASE_URL}/payment-verification/payment-submissions/${submissionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  bulkVerifySubmissions: async (submissionIds, verificationData) => {
    const response = await fetch(`${API_BASE_URL}/payment-verification/payment-submissions/bulk-verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        submission_ids: submissionIds,
        ...verificationData
      })
    });
    return response.json();
  },

  getVerificationStats: async () => {
    const response = await fetch(`${API_BASE_URL}/payment-verification/payment-submissions/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};

const RentCollection = () => {
  const [activeModule, setActiveModule] = useState('Rent Collection');
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeLeases, setActiveLeases] = useState([]);
  
  // Tab and verification state
  const [activeTab, setActiveTab] = useState('payments');
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [verificationStats, setVerificationStats] = useState({});
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSubmissionDetailsModal, setShowSubmissionDetailsModal] = useState(false);
  const [showBulkVerificationModal, setShowBulkVerificationModal] = useState(false);
   console.log(payments)
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    page: 1,
    limit: 10
  });

  const [verificationFilters, setVerificationFilters] = useState({
    status: 'pending',
    search: '',
    payment_method: 'all',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });

  const [verificationPagination, setVerificationPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });

  // Load data on component mount and filter changes
  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments();
      loadSummary();
    } else if (activeTab === 'verifications') {
      loadPendingSubmissions();
      loadSubmissionHistory();
      loadVerificationStats();
    }
    
    // Load these once on mount
    if (activeLeases.length === 0) loadActiveLeases();
  }, [filters, verificationFilters, activeTab]);

  // Data loading functions
  const loadPayments = async () => {
    try {
      setLoading(true);
      const result = await rentCollectionAPI.getPayments(filters);
      if (result.status === 200) {
        setPayments(result.data);
        setPagination(result.pagination);
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
      if (result.status === 200) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const loadActiveLeases = async () => {
    try {
      const result = await rentCollectionAPI.getActiveLeases();
      if (result.status === 200) {
        setActiveLeases(result.data);
      }
    } catch (error) {
      console.error('Error loading active leases:', error);
    }
  };

  const loadPendingSubmissions = async () => {
    try {
      setLoading(true);
      const result = await rentCollectionAPI.getPendingSubmissions({
        ...verificationFilters,
        status: 'pending'
      });
      if (result.status === 200) {
        setPendingSubmissions(result.data);
        setVerificationPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error loading pending submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionHistory = async () => {
    try {
      const result = await rentCollectionAPI.getSubmissionHistory({
        ...verificationFilters,
        limit: 5
      });
      if (result.status === 200) {
        setSubmissionHistory(result.data);
      }
    } catch (error) {
      console.error('Error loading submission history:', error);
    }
  };

  const loadVerificationStats = async () => {
    try {
      const result = await rentCollectionAPI.getVerificationStats();
      if (result.status === 200) {
        setVerificationStats(result.data);
      }
    } catch (error) {
      console.error('Error loading verification stats:', error);
    }
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handleVerificationFilterChange = (key, value) => {
    setVerificationFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPayments();
  };

  // Selection handlers
  const handleSubmissionSelect = (submissionId) => {
    setSelectedSubmissions(prev => {
      if (prev.includes(submissionId)) {
        return prev.filter(id => id !== submissionId);
      } else {
        return [...prev, submissionId];
      }
    });
  };

  const handleSelectAllSubmissions = () => {
    if (selectedSubmissions.length === pendingSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(pendingSubmissions.map(sub => sub.id));
    }
  };

  // Action handlers
  const handleProcessPayment = async (paymentId, paymentData) => {
    try {
      setProcessing(true);
      const result = await rentCollectionAPI.processPayment(paymentId, paymentData);
      
      if (result.success) {
        setPayments(prev => prev.map(p => 
          p.id === paymentId ? { ...p, ...result.data } : p
        ));
        loadSummary();
        alert('Payment processed successfully!');
        setShowPaymentModal(false);
        setSelectedPayment(null);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error processing payment: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCreatePayment = async (paymentData) => {
    try {
      setProcessing(true);
      
      const createResult = await rentCollectionAPI.createPayment({
        lease_id: paymentData.lease_id,
        due_date: paymentData.due_date,
        amount_due: paymentData.amount_due,
        amount_paid: 0,
        payment_status: 'pending'
      });

      if (createResult.success) {
        const processResult = await rentCollectionAPI.processPayment(createResult.data.id, {
          amount_paid: paymentData.amount_paid,
          payment_method: paymentData.payment_method,
          payment_reference: paymentData.payment_reference,
          payment_date: paymentData.payment_date,
          notes: paymentData.notes,
          processed_by: paymentData.processed_by
        });

        if (processResult.success) {
          alert('Payment recorded successfully!');
          loadPayments();
          loadSummary();
          setShowNewPaymentModal(false);
        } else {
          alert('Error processing payment: ' + processResult.message);
        }
      } else {
        alert('Error creating payment: ' + createResult.message);
      }
    } catch (error) {
      alert('Error recording payment: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleGeneratePayments = async (month, year) => {
    try {
      setProcessing(true);
      const result = await rentCollectionAPI.generatePayments(month, year);
      if (result.success) {
        alert(result.message);
        loadPayments();
        loadSummary();
        setShowGenerateModal(false);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error generating payments: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Verification handlers
  const handleVerifyPayment = async (submissionId, verificationData) => {
    try {
      setProcessing(true);
      const result = await rentCollectionAPI.verifyPaymentSubmission(submissionId, verificationData);
      
      if (result.success) {
        setPendingSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
        loadVerificationStats();
        loadSubmissionHistory();
        
        if (activeTab === 'payments') {
          loadPayments();
          loadSummary();
        }
        
        alert('Payment verified successfully!');
        setShowVerificationModal(false);
        setSelectedSubmission(null);
      } else {
        alert('Error verifying payment: ' + result.message);
      }
    } catch (error) {
      alert('Error verifying payment: ' + error.message);
    } finally {
      setProcessing(false);
      setShowVerificationModal(false)
    }
  };

  const handleRejectPayment = async (submissionId, rejectionData) => {
    try {
      setProcessing(true);
      const result = await rentCollectionAPI.rejectPaymentSubmission(submissionId, rejectionData);
      
      if (result.success) {
        setPendingSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
        loadVerificationStats();
        loadSubmissionHistory();
        
        alert('Payment rejected successfully. Tenant has been notified.');
        setShowVerificationModal(false);
        setSelectedSubmission(null);
      } else {
        alert('Error rejecting payment: ' + result.message);
      }
    } catch (error) {
      alert('Error rejecting payment: ' + error.message);
    } finally {
      setProcessing(false);
      setShowVerificationModal(false)
    }
  };

  const handleBulkVerification = async (submissionIds, bulkData) => {
    try {
      setProcessing(true);
      
      if (bulkData.action === 'verify') {
        const result = await rentCollectionAPI.bulkVerifySubmissions(submissionIds, {
          admin_notes: bulkData.admin_notes,
          apply_to_accounts: bulkData.apply_to_accounts
        });
        
        if (result.success) {
          setPendingSubmissions(prev => prev.filter(sub => !submissionIds.includes(sub.id)));
          alert(`${submissionIds.length} payment${submissionIds.length > 1 ? 's' : ''} verified successfully!`);
        } else {
          alert('Error in bulk verification: ' + result.message);
        }
      } else {
        const results = await Promise.allSettled(
          submissionIds.map(id => 
            rentCollectionAPI.rejectPaymentSubmission(id, {
              admin_notes: bulkData.admin_notes
            })
          )
        );
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;
        
        if (successful > 0) {
          setPendingSubmissions(prev => prev.filter(sub => !submissionIds.includes(sub.id)));
          
          if (failed === 0) {
            alert(`${successful} payment${successful > 1 ? 's' : ''} rejected successfully!`);
          } else {
            alert(`${successful} payments rejected successfully, ${failed} failed.`);
          }
        } else {
          alert('Failed to reject payments. Please try again.');
        }
      }
      
      setSelectedSubmissions([]);
      loadVerificationStats();
      loadSubmissionHistory();
      
      if (activeTab === 'payments') {
        loadPayments();
        loadSummary();
      }
      
      setShowBulkVerificationModal(false);
    } catch (error) {
      alert('Error in bulk action: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleViewSubmissionDetails = async (submission) => {
    try {
      const result = await rentCollectionAPI.getSubmissionDetails(submission.id);
      
      if (result.success) {
        setSelectedSubmission(result.data);
        setShowSubmissionDetailsModal(true);
      } else {
        alert('Error loading submission details: ' + result.message);
      }
    } catch (error) {
      alert('Error loading submission details: ' + error.message);
    }
  };

  // Quick action handlers
  const handleQuickVerify = (submission) => {
    setSelectedSubmission(submission);
    setShowVerificationModal(true);
  };

  const handleQuickReject = (submission) => {
    setSelectedSubmission(submission);
    setShowVerificationModal(true);
  };

  // Bulk actions
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

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Tab Navigation Component
  const TabNavigation = ({ activeTab, onTabChange, verificationStats }) => (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => onTabChange('payments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Rent Payments</span>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange('verifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
              activeTab === 'verifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Payment Verification</span>
              {verificationStats.pending_count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {verificationStats.pending_count}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>
    </div>
  );

  // Verification Stats Component
  const VerificationStatsComponent = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Pending Verification</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending_count || 0}
            </p>
          </div>
          <Clock className="w-8 h-8 text-yellow-500" />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Verified Today</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.verified_today || 0}
            </p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.rejected_count || 0}
            </p>
          </div>
          <X className="w-8 h-8 text-red-500" />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total Amount Pending</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.total_pending_amount || 0)}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    </div>
  );

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          verificationStats={verificationStats}
        />

        {/* Content based on active tab */}
        {activeTab === 'payments' ? (
          <>
            {/* Payments Tab Content */}
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
                    <PaymentCard 
                      key={payment.id} 
                      payment={payment}
                      onViewInvoice={(payment) => {
                        setSelectedPayment(payment);
                        setShowInvoiceModal(true);
                      }}
                      onProcessPayment={(payment) => {
                        setSelectedPayment(payment);
                        setShowPaymentModal(true);
                      }}
                    />
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
          </>
        ) : (
          <>
            {/* Verification Tab Content */}
            <VerificationStatsComponent stats={verificationStats} />

            <VerificationFilters 
              filters={verificationFilters}
              onFilterChange={handleVerificationFilterChange}
              onSearch={(e) => { e.preventDefault(); loadPendingSubmissions(); }}
              selectedCount={selectedSubmissions.length}
              onBulkAction={(action) => {
                if (action === 'verify' || action === 'reject') {
                  setShowBulkVerificationModal(true);
                }
              }}
              onClearSelection={() => setSelectedSubmissions([])}
            />

            <div className="flex flex-wrap space-x-2 mb-4">
              <button 
                onClick={() => loadPendingSubmissions()}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600"
              >
                <RefreshCw className="mr-2 w-4 h-4" /> Refresh
              </button>
              
              {pendingSubmissions.length > 0 && (
                <button 
                  onClick={handleSelectAllSubmissions}
                  className="bg-gray-500 text-white px-4 py-2 rounded flex items-center hover:bg-gray-600"
                >
                  <CheckCircle className="mr-2 w-4 h-4" />
                  {selectedSubmissions.length === pendingSubmissions.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
              
              <button className="bg-green-500 text-white px-4 py-2 rounded flex items-center hover:bg-green-600">
                <Download className="mr-2 w-4 h-4" /> Export Submissions
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-600 mt-2">Loading submissions...</p>
              </div>
            ) : pendingSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Submissions</h3>
                <p className="text-gray-600">All payment submissions have been processed!</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6">
                  {pendingSubmissions.map(submission => (
                    <PaymentSubmissionCard 
                      key={submission.id} 
                      submission={submission}
                      isSelected={selectedSubmissions.includes(submission.id)}
                      onSelect={handleSubmissionSelect}
                      onViewDetails={handleViewSubmissionDetails}
                      onVerify={handleQuickVerify}
                      onReject={handleQuickReject}
                    />
                  ))}
                </div>

                {verificationPagination.totalPages > 1 && (
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleVerificationFilterChange('page', verificationPagination.currentPage - 1)}
                      disabled={verificationPagination.currentPage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({length: verificationPagination.totalPages}, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handleVerificationFilterChange('page', page)}
                        className={`px-3 py-1 border rounded ${
                          page === verificationPagination.currentPage ? 'bg-blue-500 text-white' : ''
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handleVerificationFilterChange('page', verificationPagination.currentPage + 1)}
                      disabled={verificationPagination.currentPage === verificationPagination.totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Recent Verification History */}
            {submissionHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Recent Verification History</h3>
                <div className="space-y-3">
                  {submissionHistory.map(submission => (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{submission.tenant_name}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(submission.amount)} • {submission.property_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          submission.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {submission.verification_status.charAt(0).toUpperCase() + submission.verification_status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(submission.verified_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* All Modals */}
        <PaymentModal 
          payment={selectedPayment}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
          onSubmit={handleProcessPayment}
          processing={processing}
        />

        <InvoiceModal 
          payment={selectedPayment}
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedPayment(null);
          }}
        />

        <NewPaymentModal 
          isOpen={showNewPaymentModal}
          onClose={() => setShowNewPaymentModal(false)}
          activeLeases={activeLeases}
          onSubmit={handleCreatePayment}
          processing={processing}
        />

        <GeneratePaymentsModal 
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onSubmit={handleGeneratePayments}
          processing={processing}
        />

        <VerificationModal 
          submission={selectedSubmission}
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            setSelectedSubmission(null);
          }}
          onVerify={handleVerifyPayment}
          onReject={handleRejectPayment}
          processing={processing}
        />

        <SubmissionDetailsModal 
          submission={selectedSubmission}
          isOpen={showSubmissionDetailsModal}
          onClose={() => {
            setShowSubmissionDetailsModal(false);
            setSelectedSubmission(null);
          }}
        />

        <BulkVerificationModal 
          selectedSubmissions={selectedSubmissions}
          submissions={pendingSubmissions}
          isOpen={showBulkVerificationModal}
          onClose={() => setShowBulkVerificationModal(false)}
          onBulkVerify={handleBulkVerification}
          processing={processing}
        />
      </div>
    </Navbar>
  );
};

export default RentCollection;

export async function loader() {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/");
  }
   
  try {
    const response = await fetch("http://localhost:5020/api/auth/verifyToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const userData = await response.json();
     
    if (userData.status !== 200) {
      const keysToRemove = ["token", "user", "name", "userRole", "userId"];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      return redirect("/");
    }

    const allowedRoles = ["Super Admin", "Admin", "Manager", "Staff"];
    const userRole = userData.user?.role || localStorage.getItem("userRole");

    if (!userRole || !allowedRoles.includes(userRole)) {
      return redirect("/");
    }

    return {
      user: userData.user,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Auth check error:", error);
    const keysToRemove = ["token", "user", "name", "userRole", "userId"];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    return redirect("/");
  }
}