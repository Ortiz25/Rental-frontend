import React, { useState, useEffect } from "react";
import {
  Home,
  DollarSign,
  FileText,
  Bell,
  MessageSquare,
  WrenchIcon,
  Calendar,
  ChevronRight,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Paperclip,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";

import Navbar from "../layout/navbar";

const API_BASE_URL = 'http://localhost:5020/api/tenant-dash';

const ContactManagerModal = ({ isOpen, onClose, onSubmit }) => {
  const [messageData, setMessageData] = useState({
    subject: "",
    message: "",
    priority: "normal",
    attachments: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(messageData);
    setMessageData({ subject: "", message: "", priority: "normal", attachments: [] });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Contact Property Manager</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={messageData.subject}
              onChange={(e) =>
                setMessageData({ ...messageData, subject: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              className="w-full p-2 border rounded"
              value={messageData.priority}
              onChange={(e) =>
                setMessageData({ ...messageData, priority: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              value={messageData.message}
              onChange={(e) =>
                setMessageData({ ...messageData, message: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UploadDocumentModal = ({ isOpen, onClose, onSubmit }) => {
  const [uploadData, setUploadData] = useState({
    title: "",
    category: "",
    file: null,
    description: "",
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(uploadData);
    setUploadData({ title: "", category: "", file: null, description: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Document Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={uploadData.title}
              onChange={(e) =>
                setUploadData({ ...uploadData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="w-full p-2 border rounded"
              value={uploadData.category}
              onChange={(e) =>
                setUploadData({ ...uploadData, category: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              <option value="lease">Lease Documents</option>
              <option value="identification">Identification</option>
              <option value="insurance">Insurance</option>
              <option value="maintenance">Maintenance Records</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={uploadData.description}
              onChange={(e) =>
                setUploadData({ ...uploadData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">File</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
              onClick={() => document.getElementById("document-upload").click()}
            >
              {uploadData.file ? (
                <div className="text-green-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>{uploadData.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p>Click to upload or drag and drop</p>
                  <p className="text-sm">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                </div>
              )}
              <input
                id="document-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!uploadData.file}
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, tenantData, onPaymentSubmit, loading }) => {
  const [paymentData, setPaymentData] = useState({
    amount: tenantData?.tenant?.rentAmount || 0,
    paymentMethod: "Credit Card",
    reference: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onPaymentSubmit(paymentData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Make Payment</h2>
          <button onClick={onClose} disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Payment Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full p-2 border rounded"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select 
              className="w-full p-2 border rounded"
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              disabled={loading}
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reference Number (Optional)</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={paymentData.reference}
              onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
              placeholder="Transaction reference"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Process Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MaintenanceRequestModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [requestData, setRequestData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "Other"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(requestData);
    setRequestData({ title: "", description: "", priority: "medium", category: "Other" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">New Maintenance Request</h2>
          <button onClick={onClose} disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Issue Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Brief description of the issue"
              value={requestData.title}
              onChange={(e) => setRequestData({ ...requestData, title: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Detailed description of the issue"
              value={requestData.description}
              onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select 
              className="w-full p-2 border rounded"
              value={requestData.category}
              onChange={(e) => setRequestData({ ...requestData, category: e.target.value })}
              disabled={loading}
            >
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC</option>
              <option value="Appliances">Appliances</option>
              <option value="Structural">Structural</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select 
              className="w-full p-2 border rounded"
              value={requestData.priority}
              onChange={(e) => setRequestData({ ...requestData, priority: e.target.value })}
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TenantDashboard = () => {
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [activeModule, setActiveModule] = useState("Tenant Dashboard");

  // Fetch tenant data from API
  const fetchTenantData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token'); // Adjust based on your auth implementation
      const response = await fetch(`${API_BASE_URL}/tenant/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTenantData(result.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch tenant data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTenantData();
  }, []);

  // Handle payment submission
  const handlePaymentSubmit = async (paymentData) => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tenant/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          paymentReference: paymentData.reference
        })
      });

      if (!response.ok) {
        throw new Error(`Payment failed: ${response.status}`);
      }

      const result = await response.json();
      alert('Payment processed successfully!');
      setShowPaymentModal(false);
      
      // Refresh dashboard data
      await fetchTenantData();
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle maintenance request submission
  const handleMaintenanceSubmit = async (requestData) => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tenant/maintenance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      alert('Maintenance request submitted successfully!');
      setShowMaintenanceModal(false);
      
      // Refresh dashboard data
      await fetchTenantData();
    } catch (err) {
      alert(`Request failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle contact manager submission
  const handleContactSubmit = async (messageData) => {
    try {
      // In a real app, you'd send this to your backend
      console.log('Contact message:', messageData);
      alert('Message sent to property manager!');
    } catch (err) {
      alert(`Failed to send message: ${err.message}`);
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (uploadData) => {
    try {
      // In a real app, you'd upload the file to your backend
      console.log('Document upload:', uploadData);
      alert('Document uploaded successfully!');
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Navbar>
    );
  }

  // Error state
  if (error) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchTenantData}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </Navbar>
    );
  }

  // No data state
  if (!tenantData?.tenant) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Tenant Data Found</h2>
            <p className="text-gray-600">Your account may not be associated with a rental property.</p>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6">
        {/* Tenant Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 text-center sm:text-left">
              <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-gray-300 mb-3 sm:mb-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {tenantData.tenant.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {tenantData.tenant.name}
                </h1>
                <p className="font-semibold">{tenantData.tenant.propertyName}</p>
                <p className="text-gray-600">{tenantData.tenant.unit}</p>
                {tenantData.tenant.leaseNumber && (
                  <p className="text-sm text-gray-500">Lease: {tenantData.tenant.leaseNumber}</p>
                )}
              </div>
            </div>
            <div className="text-center sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0">
              <p className="text-sm text-gray-600">Lease Period</p>
              <p className="font-medium">
                <span className="block sm:inline">
                  {formatDate(tenantData.tenant.leaseStart)}
                </span>
                <span className="hidden sm:inline"> - </span>
                <span className="block sm:inline">
                  {formatDate(tenantData.tenant.leaseEnd)}
                </span>
              </p>
              {tenantData.tenant.leaseStatus && (
                <p className={`text-sm font-medium mt-1 ${
                  tenantData.tenant.leaseStatus === 'active' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  Status: {tenantData.tenant.leaseStatus.toUpperCase()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mb-2 mx-auto" />
            <h3 className="font-medium text-sm sm:text-base">Make Payment</h3>
          </button>

          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <WrenchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mb-2 mx-auto" />
            <h3 className="font-medium text-sm sm:text-base">Request Maintenance</h3>
          </button>

          <button
            onClick={() => setShowContactModal(true)}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <MessageSquare className="w-8 h-8 text-purple-500 mb-2 mx-auto" />
            <h3 className="font-medium">Contact Manager</h3>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <Upload className="w-8 h-8 text-orange-500 mb-2 mx-auto" />
            <h3 className="font-medium">Upload Document</h3>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Rent & Payments Card */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-bold">Rent & Payments</h2>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-gray-600">Monthly Rent</span>
                <span className="font-medium">
                  {formatCurrency(tenantData.tenant.rentAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-gray-600">Current Balance</span>
                <span className={`font-medium ${
                  tenantData.tenant.balance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(tenantData.tenant.balance)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-gray-600">Next Due Date</span>
                <span className="font-medium">
                  {formatDate(tenantData.tenant.nextDueDate)}
                </span>
              </div>

              <div className="pt-3 sm:pt-4">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors duration-200"
                >
                  Make Payment
                </button>
              </div>
            </div>
          </div>

          {/* Maintenance Requests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Maintenance Requests</h2>
              <WrenchIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-4">
              {tenantData.maintenanceRequests && tenantData.maintenanceRequests.length > 0 ? (
                tenantData.maintenanceRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{request.title}</h3>
                        <p className="text-sm text-gray-600">
                          Submitted: {formatDate(request.submitted)}
                        </p>
                        {request.category && (
                          <p className="text-xs text-gray-500">{request.category}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          request.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : request.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : request.status === "Open"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No maintenance requests</p>
              )}
              <button
                onClick={() => setShowMaintenanceModal(true)}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                New Request
              </button>
            </div>
          </div>

          {/* Important Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Notifications</h2>
              <Bell className="w-5 h-5 text-purple-500" />
            </div>
            <div className="space-y-4">
              {tenantData.notifications && tenantData.notifications.length > 0 ? (
                tenantData.notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-gray-600">{notification.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(notification.date)}
                        </p>
                      </div>
                      {notification.isUrgent && (
                        <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              )}
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Important Documents</h2>
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenantData.documents && tenantData.documents.length > 0 ? (
              tenantData.documents.map((document) => (
                <div
                  key={document.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded"
                >
                  <div>
                    <h3 className="font-medium">{document.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(document.date)}
                    </p>
                    {document.category && (
                      <p className="text-xs text-gray-500">{document.category}</p>
                    )}
                  </div>
                  <button className="text-blue-500 hover:text-blue-700">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No documents available
              </div>
            )}
          </div>
        </div>

        {/* Payment History Section */}
        {tenantData.rentHistory && tenantData.rentHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Recent Payment History</h2>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantData.rentHistory.slice(0, 5).map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="py-2">{formatDate(payment.date)}</td>
                      <td className="py-2">{formatCurrency(payment.amount)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-2">{payment.method || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          tenantData={tenantData}
          onPaymentSubmit={handlePaymentSubmit}
          loading={actionLoading}
        />
        
        <MaintenanceRequestModal
          isOpen={showMaintenanceModal}
          onClose={() => setShowMaintenanceModal(false)}
          onSubmit={handleMaintenanceSubmit}
          loading={actionLoading}
        />
        
        <ContactManagerModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          onSubmit={handleContactSubmit}
        />

        <UploadDocumentModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleDocumentUpload}
        />
      </div>
    </Navbar>
  );
};

export default TenantDashboard;