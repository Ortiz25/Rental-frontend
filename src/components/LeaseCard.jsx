import React, { useState } from "react";
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
  Play,
  User,
  MapPin,
} from "lucide-react";

import LeaseDetailsModal from "./modals/LeaseDetailModal";
import EditLeaseModal from "./modals/EditLeaseModal";

const LeaseCard = ({ lease, onRenewal, onCancel, onActivate, onUpdate }) => {
  console.log(lease);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Handle both old and new status formats
  const getStatusColor = (status) => {
    // Normalize status - handle both lease_status and status fields
    const normalizedStatus = (lease.lease_status || lease.status || '').toLowerCase();
    
    const colors = {
      'active': "bg-green-100 text-green-800",
      'pending renewal': "bg-yellow-100 text-yellow-800",
      'pending': "bg-yellow-100 text-yellow-800",
      'expired': "bg-red-100 text-red-800",
      'terminated': "bg-gray-100 text-gray-800",
      'draft': "bg-blue-100 text-blue-800",
      'renewed': "bg-purple-100 text-purple-800",
    };
    return colors[normalizedStatus] || "bg-gray-100 text-gray-800";
  };

  // Get display status
  const getDisplayStatus = () => {
    if (lease.lease_status) {
      return lease.lease_status.charAt(0).toUpperCase() + lease.lease_status.slice(1);
    }
    return lease.status || 'Unknown';
  };

  // Format currency - handle both KES and USD
  const formatCurrency = (amount) => {
    if (!amount) return 'KES 0';
    
    // If amount is already a string with currency, return as is
    if (typeof amount === 'string' && (amount.includes('KES') || amount.includes('$'))) {
      return amount;
    }
    
    // Otherwise format as number
    const numAmount = parseFloat(amount);
    return `KES ${numAmount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Check if lease is expiring soon (within 30 days)
  const isExpiringSoon = () => {
    if (!lease.end_date) return false;
    const endDate = new Date(lease.end_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const currentStatus = (lease.lease_status || lease.status || '').toLowerCase();
    return endDate <= thirtyDaysFromNow && currentStatus === 'active';
  };

  // Determine current lease status
  const currentStatus = (lease.lease_status || lease.status || '').toLowerCase();
  const isDraft = currentStatus === 'draft';
  const isActive = currentStatus === 'active';
  const isPendingRenewal = currentStatus === 'pending renewal' || lease.status === 'Pending Renewal';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      {/* Header Section */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              {lease.property_name}
            </h2>
            <h3 className="text-md font-semibold text-gray-700">
              {lease.property_address || lease.address}
            </h3>
            
            {/* Tenant Information */}
            <div className="flex items-center mt-2 text-gray-600">
              <User className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {lease.primary_tenant_name || lease.tenant_name || lease.all_tenant_names || 'No tenant assigned'}
              </span>
            </div>
            
            {/* Unit Information */}
            {(lease.unit_number || lease.bedrooms) && (
              <div className="flex items-center mt-1 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  {lease.unit_number && `Unit ${lease.unit_number}`}
                  {lease.bedrooms && ` • ${lease.bedrooms}BR`}
                  {lease.bathrooms && `/${lease.bathrooms}BA`}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
              {getDisplayStatus()}
            </span>
            
            {isExpiringSoon() && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                EXPIRING SOON
              </span>
            )}
          </div>
        </div>

        {/* Lease Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Lease Period</p>
            <p className="font-semibold text-sm">
              {formatDate(lease.start_date)} - {formatDate(lease.end_date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Rent</p>
            <p className="font-semibold text-sm">
              {formatCurrency(lease.monthly_rent)}
            </p>
          </div>
          
          {/* Additional details for new lease format */}
          {lease.lease_number && (
            <div>
              <p className="text-sm text-gray-600">Lease Number</p>
              <p className="font-semibold text-sm">#{lease.lease_number}</p>
            </div>
          )}
          
          {lease.security_deposit && (
            <div>
              <p className="text-sm text-gray-600">Security Deposit</p>
              <p className="font-semibold text-sm">
                {formatCurrency(lease.security_deposit)}
              </p>
            </div>
          )}
        </div>

        {/* Special Status Indicators */}
        {isDraft && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Draft Lease</p>
                <p className="text-xs text-blue-700">
                  This lease is in draft status. Activate it to mark the unit as occupied.
                </p>
              </div>
            </div>
          </div>
        )}

        {isExpiringSoon() && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-orange-900">Expiring Soon</p>
                <p className="text-xs text-orange-700">
                  This lease expires on {formatDate(lease.end_date)}. Consider renewal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status (for active leases) */}
        {isActive && (lease.total_payments_received || lease.total_overdue_amount) && (
          <div className="bg-gray-50 rounded p-3 mb-4">
            <div className="flex justify-between text-sm">
              {lease.total_payments_received > 0 && (
                <span className="text-green-600">
                  Paid: {formatCurrency(lease.total_payments_received)}
                </span>
              )}
              {lease.total_overdue_amount > 0 && (
                <span className="text-red-600">
                  Overdue: {formatCurrency(lease.total_overdue_amount)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="border-t px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            {/* View Details - Always available */}
            <button
              onClick={() => setShowDetails(true)}
              className="text-blue-600 hover:underline text-sm flex items-center"
            >
              <FileText className="w-4 h-4 mr-1" />
              View Details
            </button>

            {/* Process Renewal - For pending renewal status */}
            {isPendingRenewal && (
              <button
                onClick={() => setShowDetails(true)}
                className="text-green-600 hover:underline text-sm flex items-center"
              >
                <ArrowRight className="w-4 h-4 mr-1" />
                Process Renewal
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {/* Draft Lease Actions */}
            {isDraft && onActivate && (
              <button
                onClick={() => onActivate(lease)}
                className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Activate</span>
              </button>
            )}

            {/* Active Lease Actions */}
            {isActive && (
              <>
                {onRenewal && (
                  <button
                    onClick={() => onRenewal(lease)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Renew</span>
                  </button>
                )}

                {onCancel && (
                  <button
                    onClick={() => onCancel(lease)}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </>
            )}

            {/* Edit button for draft leases */}
            {isDraft && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}

            {/* Edit button for all lease statuses if onUpdate is provided */}
            {!isDraft && onUpdate && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lease Details Modal */}
      <LeaseDetailsModal
        lease={lease}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onRenewal={onRenewal}
      />

      {/* Edit Lease Modal */}
      <EditLeaseModal
        lease={lease}
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={onUpdate}
      />
    </div>
  );
};

export default LeaseCard;