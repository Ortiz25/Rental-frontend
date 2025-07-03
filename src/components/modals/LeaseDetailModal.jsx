import React, { useState } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Plus,
  X,
  Download,
  Edit,
  ArrowRight,
  User,
  Home,
  CreditCard,
  FileCheck
} from 'lucide-react';

const LeaseDetailsModal = ({ lease, isOpen, onClose, onRenewal }) => {
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [renewalData, setRenewalData] = useState({
    newEndDate: '',
    rentIncrease: 0,
    notes: ''
  });

  // Handle cases where lease might be undefined
  if (!lease) return null;

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diff = end - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'pending':
      case 'draft':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'expired':
      case 'terminated':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  // Parse tenants - handle both string and array formats
  const getTenantNames = () => {
    if (lease.all_tenant_names) return lease.all_tenant_names;
    if (lease.primary_tenant_name) return lease.primary_tenant_name;
    if (lease.tenantName) return lease.tenantName;
    if (lease.tenants && Array.isArray(lease.tenants)) {
      return lease.tenants.map(t => `${t.first_name} ${t.last_name}`).join(', ');
    }
    return 'No tenant assigned';
  };

  // Get property name
  const getPropertyName = () => {
    if (lease.property_name && lease.unit_number) {
      return `${lease.property_name} - Unit ${lease.unit_number}`;
    }
    return lease.property_name || lease.propertyName || 'Property information not available';
  };

  // Get utilities - handle different data structures
  const getUtilities = () => {
    if (lease.utilities && Array.isArray(lease.utilities)) {
      return lease.utilities
        .filter(util => util.included)
        .map(util => util.name)
        .join(', ') || 'None included';
    }
    if (lease.terms && lease.terms.utilities) {
      return lease.terms.utilities.join(', ') || 'None included';
    }
    return 'Not specified';
  };

  // Get documents - handle different structures
  const getDocuments = () => {
    if (lease.documents && Array.isArray(lease.documents)) {
      return lease.documents;
    }
    return ['Lease Agreement']; // Default document
  };

  const RenewalForm = () => (
    <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FileCheck className="w-5 h-5 mr-2" />
        Process Renewal
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={renewalData.newEndDate}
            onChange={(e) => setRenewalData({...renewalData, newEndDate: e.target.value})}
            min={lease.end_date || lease.endDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rent Increase ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={renewalData.rentIncrease}
            onChange={(e) => setRenewalData({...renewalData, rentIncrease: Number(e.target.value)})}
            placeholder="0.00"
          />
          <p className="text-sm text-gray-500 mt-1">
            New monthly rent: {formatCurrency((lease.monthly_rent || lease.monthlyRent || 0) + renewalData.rentIncrease)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Renewal Notes
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={renewalData.notes}
            onChange={(e) => setRenewalData({...renewalData, notes: e.target.value})}
            placeholder="Add any notes about the renewal..."
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={() => setShowRenewalForm(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!renewalData.newEndDate) {
                alert('Please select a new end date');
                return;
              }
              
              const updatedLease = {
                lease_status: 'active',
                end_date: renewalData.newEndDate,
                monthly_rent: (lease.monthly_rent || lease.monthlyRent || 0) + renewalData.rentIncrease,
                special_conditions: renewalData.notes ? 
                  `${lease.special_conditions || ''}\n\nRenewal Notes: ${renewalData.notes}`.trim() : 
                  lease.special_conditions
              };
              
              onRenewal(lease.id, updatedLease);
              setShowRenewalForm(false);
              onClose();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Confirm Renewal
          </button>
        </div>
      </div>
    </div>
  );

  const daysRemaining = calculateDaysRemaining(lease.end_date || lease.endDate);
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;
  const isExpired = daysRemaining <= 0;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lease Details</h2>
            <p className="text-sm text-gray-600">
              Lease #{lease.lease_number || lease.id}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Status Banner */}
          <div className={`mb-6 p-4 rounded-lg border ${getStatusColor(lease.lease_status || lease.status)}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-lg">
                    Status: {(lease.lease_status || lease.status || 'Unknown').charAt(0).toUpperCase() + (lease.lease_status || lease.status || 'unknown').slice(1)}
                  </p>
                  {isExpired && <XCircle className="w-5 h-5 text-red-500" />}
                  {isExpiringSoon && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                  {!isExpired && !isExpiringSoon && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <p className="text-sm mt-1">
                  {isExpired ? 
                    `Expired ${Math.abs(daysRemaining)} days ago` : 
                    `${daysRemaining} days remaining`
                  }
                </p>
                {isExpiringSoon && !isExpired && (
                  <p className="text-sm text-yellow-700 mt-1">
                    ⚠️ Lease expires soon - consider renewal
                  </p>
                )}
              </div>
              {((lease.lease_status || lease.status) === 'Pending Renewal' || isExpiringSoon) && !showRenewalForm && (
                <button
                  onClick={() => setShowRenewalForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Process Renewal</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Property Details */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 flex items-center mb-3">
                  <Home className="w-5 h-5 mr-2" />
                  Property Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Property:</span> {getPropertyName()}</p>
                  {lease.property_address && (
                    <p><span className="font-medium">Address:</span> {lease.property_address}</p>
                  )}
                  {lease.bedrooms && lease.bathrooms && (
                    <p><span className="font-medium">Size:</span> {lease.bedrooms}BR / {lease.bathrooms}BA</p>
                  )}
                  {lease.size_sq_ft && (
                    <p><span className="font-medium">Square Feet:</span> {lease.size_sq_ft.toLocaleString()} sq ft</p>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 flex items-center mb-3">
                  <User className="w-5 h-5 mr-2" />
                  Tenant Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Tenant(s):</span> {getTenantNames()}</p>
                  {lease.primary_tenant_email && (
                    <p><span className="font-medium">Email:</span> {lease.primary_tenant_email}</p>
                  )}
                  {lease.primary_tenant_phone && (
                    <p><span className="font-medium">Phone:</span> {lease.primary_tenant_phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial & Dates */}
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 flex items-center mb-3">
                  <Calendar className="w-5 h-5 mr-2" />
                  Lease Period
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Start Date:</span> {formatDate(lease.start_date || lease.startDate)}</p>
                  <p><span className="font-medium">End Date:</span> {formatDate(lease.end_date || lease.endDate)}</p>
                  <p><span className="font-medium">Lease Type:</span> {lease.lease_type || lease.type || 'Not specified'}</p>
                  {lease.signed_date && (
                    <p><span className="font-medium">Signed:</span> {formatDate(lease.signed_date)}</p>
                  )}
                  {lease.move_in_date && (
                    <p><span className="font-medium">Move-in:</span> {formatDate(lease.move_in_date)}</p>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 flex items-center mb-3">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Financial Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Monthly Rent:</span> {formatCurrency(lease.monthly_rent || lease.monthlyRent)}</p>
                  <p><span className="font-medium">Security Deposit:</span> {formatCurrency(lease.security_deposit || lease.securityDeposit)}</p>
                  {(lease.pet_deposit || lease.terms?.petDeposit) && (
                    <p><span className="font-medium">Pet Deposit:</span> {formatCurrency(lease.pet_deposit || lease.terms?.petDeposit)}</p>
                  )}
                  {lease.late_fee && (
                    <p><span className="font-medium">Late Fee:</span> {formatCurrency(lease.late_fee)}</p>
                  )}
                  <p><span className="font-medium">Rent Due:</span> {lease.rent_due_day || lease.paymentSchedule?.dueDate || 1}{getOrdinalSuffix(lease.rent_due_day || lease.paymentSchedule?.dueDate || 1)} of each month</p>
                  {lease.grace_period_days && (
                    <p><span className="font-medium">Grace Period:</span> {lease.grace_period_days} days</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Terms Section */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Lease Terms & Conditions
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Lease Type:</span> {lease.lease_type || lease.type || 'Not specified'}</p>
                  <p><span className="font-medium">Utilities Included:</span> {getUtilities()}</p>
                </div>
                <div>
                  {lease.terms?.parkingSpaces !== undefined && (
                    <p><span className="font-medium">Parking Spaces:</span> {lease.terms.parkingSpaces}</p>
                  )}
                  {lease.terms?.petsAllowed !== undefined && (
                    <p><span className="font-medium">Pets Allowed:</span> {lease.terms.petsAllowed ? 'Yes' : 'No'}</p>
                  )}
                </div>
              </div>
              
              {lease.lease_terms && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium text-gray-700 mb-2">General Terms:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{lease.lease_terms}</p>
                </div>
              )}
              
              {lease.special_conditions && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium text-gray-700 mb-2">Special Conditions:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{lease.special_conditions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Documents
            </h3>
            <div className="space-y-2">
              {getDocuments().map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-sm font-medium">{doc}</span>
                  </div>
                  <button 
                    className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-1"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {getDocuments().length === 0 && (
                <p className="text-gray-500 text-sm italic">No documents available</p>
              )}
            </div>
          </div>

          {/* Payment Summary (if available) */}
          {lease.total_payments_received !== undefined && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Payment Summary
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Total Received</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(lease.total_payments_received)}
                    </p>
                  </div>
                  {lease.total_overdue_amount > 0 && (
                    <div>
                      <p className="font-medium text-gray-700">Overdue Amount</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(lease.total_overdue_amount)}
                      </p>
                    </div>
                  )}
                  {lease.last_payment_date && (
                    <div>
                      <p className="font-medium text-gray-700">Last Payment</p>
                      <p className="text-sm">{formatDate(lease.last_payment_date)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {showRenewalForm && <RenewalForm />}
        </div>
      </div>
    </div>
  );
};

// Helper function for ordinal numbers
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

export default LeaseDetailsModal;