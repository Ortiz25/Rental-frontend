import React, { useState } from "react";
import {
  UserPlus,
  UserMinus,
  AlertCircle,
  FileText,
  Check,
  X,
  Eye,
  Home,
  Edit,
} from "lucide-react";
import BlacklistBadge from "./blacklistBadge.jsx";
import BlacklistTenantModal from "./modals/BlacklistTenantModal.jsx";
import BlacklistHistory from "./blacklistHistory.jsx";
import { Shield, History, AlertTriangle } from "lucide-react";
import EditTenantModal from "./modals/EditTenantModal.jsx";
import OffboardingDetailsModal from "./modals/offBoardingDetailModal.jsx";
import { formatCurrency } from "../utils/helperFunctions.jsx";

const TenantCard = ({
  tenant,
  onUpdate,
  setSelectedTenant,
  setShowDetailsModal,
  setShowOffboardModal,
}) => {
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showBlacklistHistory, setShowBlacklistHistory] = useState(false);
  const [isRemovingBlacklist, setIsRemovingBlacklist] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOffboardingDetails, setShowOffboardingDetails] = useState(false);
  const [offboardingData, setOffboardingData] = useState(null);

  const handleBlacklistTenant = async (tenantId, blacklistData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/backend/tenants/${tenantId}/blacklist`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(blacklistData),
        }
      );

      const result = await response.json();
      if (result.status === 200) {
        if (onUpdate) onUpdate();
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error blacklisting tenant:", error);
      alert("Failed to blacklist tenant: " + error.message);
      return false;
    }
  };

  const handleRemoveBlacklist = async (tenantId, removalReason, notes) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/backend/tenants/${tenantId}/remove-blacklist`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ removalReason, notes }),
        }
      );

      const result = await response.json();
      if (result.status === 200) {
        if (onUpdate) onUpdate();
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error removing blacklist:", error);
      alert("Failed to remove blacklist: " + error.message);
      return false;
    }
  };

  const fetchOffboardingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/backend/tenants/${tenant.id}/offboarding-info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      const result = await response.json();
      if (result.status === 200) {
        setOffboardingData(result.data);
        setShowOffboardingDetails(true);
      } else {
        alert('No offboarding information found');
      }
    } catch (error) {
      console.error('Error fetching offboarding details:', error);
      alert('Failed to fetch offboarding details');
    }
  };

  const parsePropertyInfo = (propertyName) => {
    if (!propertyName || propertyName === "No Active Lease") {
      return { property: "No Active Lease", unit: null };
    }

    const parts = propertyName.split(", Unit ");
    return {
      property: parts[0],
      unit: parts[1] || null,
    };
  };

  const { property: propertyName, unit: unitNumber } = parsePropertyInfo(
    tenant.propertyName
  );

  const handleOffboardClick = () => {
    if (setSelectedTenant && setShowOffboardModal) {
      setSelectedTenant(tenant);
      setShowOffboardModal(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Warning":
        return "bg-yellow-100 text-yellow-800";
      case "Expired":
        return "bg-red-100 text-red-800";
      case "Blacklisted":
        return "bg-red-200 text-red-900";
      case "No Active Lease":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOffboarded = tenant.status === "No Active Lease";

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
      isOffboarded ? 'border-2 border-orange-200' : ''
    }`}>
      {/* Offboarded Badge */}
      {isOffboarded && (
        <div className="mb-3 bg-orange-50 border border-orange-200 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Tenant Offboarded
              </span>
            </div>
            <button
              onClick={fetchOffboardingDetails}
              className="text-xs text-orange-600 hover:text-orange-800 underline"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Header with Status and Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold">{tenant.name}</h3>
          <div className="space-y-1">
            <p className="text-gray-600 text-sm">{propertyName}</p>
            {unitNumber && (
              <div className="flex items-center text-sm">
                <Home className="w-3 h-3 mr-1 text-gray-400" />
                <span className="text-gray-500">Unit {unitNumber}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">{tenant.email}</p>
          </div>
        </div>

        {/* Status and Action Buttons Section */}
        <div className="flex flex-col items-end space-y-2">
          {/* Status and Blacklist Badge */}
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                tenant.status
              )}`}
            >
              {tenant.status}
            </span>
            <BlacklistBadge tenant={tenant} />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-1">
            {tenant.isBlacklisted ? (
              <>
                <button
                  onClick={() => setShowBlacklistHistory(true)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="View blacklist history"
                >
                  <History className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIsRemovingBlacklist(true);
                    setShowBlacklistModal(true);
                  }}
                  className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                  title="Remove from blacklist"
                >
                  <Shield className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsRemovingBlacklist(false);
                    setShowBlacklistModal(true);
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                  title="Blacklist tenant"
                >
                  <AlertTriangle className="h-4 w-4" />
                </button>

                {!isOffboarded && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                    title="Edit tenant information"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    if (setSelectedTenant && setShowDetailsModal) {
                      setSelectedTenant(tenant);
                      setShowDetailsModal(true);
                    }
                  }}
                  className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lease Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Lease Period</p>
          <p className="font-semibold text-sm">
            {tenant.leaseStart ? (
              <>
                {new Date(tenant.leaseStart).toLocaleDateString()} -{" "}
                {tenant.leaseEnd
                  ? new Date(tenant.leaseEnd).toLocaleDateString()
                  : "Ongoing"}
              </>
            ) : (
              "No Active Lease"
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Monthly Rent</p>
          <p className="font-semibold">
            {tenant.rentAmount
              ? `${formatCurrency(tenant.rentAmount)}`
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Payment Information */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Payment Status</p>
          <span
            className={`px-2 py-1 rounded text-xs ${
              tenant.paymentStatus === "Paid"
                ? "bg-green-100 text-green-800"
                : tenant.paymentStatus === "Late"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {tenant.paymentStatus}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600">Last Payment</p>
          <p className="text-sm">
            {tenant.lastPaymentDate
              ? new Date(tenant.lastPaymentDate).toLocaleDateString()
              : "No payments"}
          </p>
        </div>
      </div>

      {/* Additional tenant info */}
      {tenant.tenantType && tenant.tenantType !== "Tenant" && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Role</p>
          <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
            {tenant.tenantType}
          </span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-between border-t pt-4">
        <div className="flex space-x-3">
          <button
            onClick={() => {
              if (setSelectedTenant && setShowDetailsModal) {
                setSelectedTenant(tenant);
                setShowDetailsModal(true);
              }
            }}
            className="text-blue-600 hover:underline text-sm flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </button>
          {!isOffboarded && (
            <button
              onClick={() => setShowEditModal(true)}
              className="text-green-600 hover:underline text-sm flex items-center"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
        {!isOffboarded && (
          <button
            onClick={handleOffboardClick}
            className="text-red-600 hover:underline text-sm flex items-center"
          >
            <UserMinus className="w-4 h-4 mr-1" />
            Offboard
          </button>
        )}
      </div>

      {/* Modals */}
      <BlacklistTenantModal
        isOpen={showBlacklistModal}
        onClose={() => {
          setShowBlacklistModal(false);
          setIsRemovingBlacklist(false);
        }}
        tenant={tenant}
        onBlacklist={handleBlacklistTenant}
        onRemoveBlacklist={handleRemoveBlacklist}
        isRemoving={isRemovingBlacklist}
      />

      <BlacklistHistory
        tenantId={tenant.id}
        isOpen={showBlacklistHistory}
        onClose={() => setShowBlacklistHistory(false)}
      />

      {!isOffboarded && (
        <EditTenantModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          tenant={tenant}
          onUpdate={onUpdate}
        />
      )}

      {showOffboardingDetails && offboardingData && (
        <OffboardingDetailsModal
          details={offboardingData}
          tenant={tenant}
          onClose={() => setShowOffboardingDetails(false)}
        />
      )}
    </div>
  );
};

export default TenantCard;