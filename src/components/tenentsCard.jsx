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

const TenantCard = ({
  tenant,
  onUpdate, // Add this prop
  setSelectedTenant, // Add this prop
  setShowDetailsModal, // Add this prop
  setShowOffboardModal, // Add this prop
}) => {
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showBlacklistHistory, setShowBlacklistHistory] = useState(false);
  const [isRemovingBlacklist, setIsRemovingBlacklist] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleBlacklistTenant = async (tenantId, blacklistData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/backend/api/tenants/${tenantId}/blacklist`,
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
        // Refresh tenant data
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
        `/backend/api/tenants/${tenantId}/remove-blacklist`,
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
        // Refresh tenant data
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

  // Parse property name to extract unit information if available
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
    console.log("Offboard button clicked for tenant:", tenant);
    console.log("Tenant status:", tenant.status);
    console.log("Should be disabled?", tenant.status === "No Active Lease");

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* Header with Status and Actions - FIXED LAYOUT */}
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
                {/* MAIN BLACKLIST BUTTON - Red warning triangle */}
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

                {/* Edit Tenant Button */}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                  title="Edit tenant information"
                >
                  <Edit className="h-4 w-4" />
                </button>

                {/* View Details Button */}
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
              ? `KSh ${tenant.rentAmount.toLocaleString()}`
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
          <button
            onClick={() => setShowEditModal(true)}
            className="text-green-600 hover:underline text-sm flex items-center"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <button
          onClick={handleOffboardClick}
          className={`text-red-600 hover:underline text-sm flex items-center ${
            tenant.status === "No Active Lease"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={tenant.status === "No Active Lease"}
        >
          <UserMinus className="w-4 h-4 mr-1" />
          Offboard
        </button>
      </div>

      {/* Blacklist Modal */}
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

      {/* Blacklist History Modal */}
      <BlacklistHistory
        tenantId={tenant.id}
        isOpen={showBlacklistHistory}
        onClose={() => setShowBlacklistHistory(false)}
      />
      <EditTenantModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        tenant={tenant}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default TenantCard;
