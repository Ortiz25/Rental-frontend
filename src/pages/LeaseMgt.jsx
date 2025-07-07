import React, { useState, useEffect } from "react";
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
  RefreshCw,
  Loader2,
} from "lucide-react";
import NewLeaseModal from "../components/modals/NewLeaseModal.jsx";
import Navbar from "../layout/navbar.jsx";
import LeaseCard from "../components/LeaseCard.jsx";
import LeaseCancelModal from "../components/modals/LeaseCancelModal.jsx";
import LeaseRenewalModal from "../components/modals/LeaseRenewalModal.jsx";
import LeaseActivationModal from "../components/modals/LeaveActivationModal.jsx"; // New import
import { redirect } from "react-router";

// Updated API service for lease operations with authentication
const leaseAPI = {
  baseURL: "/backend/api",

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  async getLeases(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key]) searchParams.append(key, params[key]);
    });

    const response = await fetch(`${this.baseURL}/leases?${searchParams}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error("Failed to fetch leases");
    }
    return response.json();
  },

  async getLeaseStats() {
    const response = await fetch(`${this.baseURL}/leases/stats/summary`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error("Failed to fetch lease statistics");
    }
    return response.json();
  },

  async createLease(leaseData) {
    const response = await fetch(`${this.baseURL}/leases`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(leaseData),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error("Failed to create lease");
    }
    return response.json();
  },

  async updateLease(id, updates) {
    const response = await fetch(`${this.baseURL}/leases/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error("Failed to update lease");
    }
    return response.json();
  },

  async deleteLease(id) {
    const response = await fetch(`${this.baseURL}/leases/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error("Failed to delete lease");
    }
    return response.json();
  },

  async renewLease(id, renewalData) {
    const response = await fetch(`${this.baseURL}/leases/${id}/renew`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(renewalData),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error("Failed to renew lease");
    }
    return response.json();
  },

  async cancelLease(id, cancelData) {
    const response = await fetch(`${this.baseURL}/leases/${id}/cancel`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(cancelData),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error("Failed to cancel lease");
    }
    return response.json();
  },
};

const LeaseManagement = () => {
  const [activeModule] = useState("Lease Management");
  const [leases, setLeases] = useState([]);
  const [leaseStats, setLeaseStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewLeaseModal, setShowNewLeaseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  
  // Modal states
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false); // New state
  const [selectedLeaseForAction, setSelectedLeaseForAction] = useState(null);

  // Handler functions
  const handleRenewal = (lease) => {
    setSelectedLeaseForAction(lease);
    setShowRenewalModal(true);
  };

  const handleCancel = (lease) => {
    setSelectedLeaseForAction(lease);
    setShowCancelModal(true);
  };

  // New activation handler
  const handleActivation = (lease) => {
    setSelectedLeaseForAction(lease);
    setShowActivationModal(true);
  };

  const handleRenewalSubmit = async (renewalData) => {
    try {
      const response = await leaseAPI.renewLease(
        selectedLeaseForAction.id,
        renewalData
      );
      if (response.success) {
        await fetchLeases();
        await fetchLeaseStats();
        setShowRenewalModal(false);
        setSelectedLeaseForAction(null);
        alert("Lease renewed successfully!");
      }
    } catch (err) {
      alert(`Error renewing lease: ${err.message}`);
    }
  };

  const handleCancelSubmit = async (cancelData) => {
    try {
      const response = await leaseAPI.cancelLease(
        selectedLeaseForAction.id,
        cancelData
      );
      if (response.success) {
        await fetchLeases();
        await fetchLeaseStats();
        setShowCancelModal(false);
        setSelectedLeaseForAction(null);
        alert("Lease cancelled successfully!");
      }
    } catch (err) {
      alert(`Error cancelling lease: ${err.message}`);
    }
  };

  // New activation submit handler
  const handleActivationSubmit = async (activationData) => {
    try {
      const response = await leaseAPI.updateLease(
        selectedLeaseForAction.id,
        activationData
      );
      if (response.success) {
        await fetchLeases();
        await fetchLeaseStats();
        setShowActivationModal(false);
        setSelectedLeaseForAction(null);
        alert("Lease activated successfully!");
      }
    } catch (err) {
      alert(`Error activating lease: ${err.message}`);
    }
  };

  // Fetch leases from API
  const fetchLeases = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await leaseAPI.getLeases({
        search: searchTerm,
        status: statusFilter,
        page: pagination.currentPage,
        limit: pagination.limit,
        ...params,
      });

      if (response.success) {
        setLeases(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error(response.message || "Failed to fetch leases");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching leases:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lease statistics
  const fetchLeaseStats = async () => {
    try {
      const response = await leaseAPI.getLeaseStats();
      if (response.success) {
        setLeaseStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching lease stats:", err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLeases();
    fetchLeaseStats();
  }, []);

  // Fetch leases when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLeases({ page: 1 });
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  // Handle new lease creation
  const handleNewLease = async (leaseData) => {
    try {
      setLoading(true);
      const response = await leaseAPI.createLease(leaseData);

      if (response.success) {
        await fetchLeases();
        await fetchLeaseStats();
        setShowNewLeaseModal(false);
        alert("Lease created successfully!");
      } else {
        throw new Error(response.message || "Failed to create lease");
      }
    } catch (err) {
      setError(err.message);
      alert(`Error creating lease: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle lease update
  const handleLeaseUpdate = async (leaseId, updates) => {
    try {
      const response = await leaseAPI.updateLease(leaseId, updates);

      if (response.success) {
        setLeases((prevLeases) =>
          prevLeases.map((lease) =>
            lease.id === leaseId ? { ...lease, ...response.data } : lease
          )
        );
        await fetchLeaseStats();
        alert("Lease updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update lease");
      }
    } catch (err) {
      alert(`Error updating lease: ${err.message}`);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    fetchLeases({ page: newPage });
  };

  // Refresh data
  const handleRefresh = () => {
    fetchLeases();
    fetchLeaseStats();
  };

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Active Leases */}
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">
                  Active Leases
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    leaseStats.active_leases || 0
                  )}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>

          {/* Draft Leases */}
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">Draft Leases</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    leases.filter(lease => lease.lease_status === 'draft').length
                  )}
                </p>
              </div>
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">
                  Expiring Soon
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    leaseStats.expiring_soon || 0
                  )}
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">
                  Monthly Revenue
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    `${(
                      leaseStats.total_monthly_revenue || 0
                    ).toLocaleString()}`
                  )}
                </p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          {/* New Lease Button */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewLeaseModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center text-sm sm:text-base transition-colors"
              disabled={loading}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>New Lease</span>
            </button>

            <button
              onClick={handleRefresh}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors"
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search leases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-[250px] pl-9 pr-4 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>

            <button
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors flex-shrink-0"
              aria-label="Filter"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modals */}
        <NewLeaseModal
          isOpen={showNewLeaseModal}
          onClose={() => setShowNewLeaseModal(false)}
          onSubmit={handleNewLease}
        />

        {/* Loading State */}
        {loading && leases.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading leases...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && leases.length === 0 && !error && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No leases found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter
                ? "No leases match your current filters."
                : "Get started by creating your first lease agreement."}
            </p>
            {!searchTerm && !statusFilter && (
              <button
                onClick={() => setShowNewLeaseModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create First Lease
              </button>
            )}
          </div>
        )}

        {/* Lease Grid */}
        {!loading && leases.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {leases.map((lease) => (
                <LeaseCard
                  key={lease.id}
                  lease={lease}
                  onUpdate={handleLeaseUpdate} // Pass the update handler
                  onRenewal={handleRenewal}
                  onCancel={handleCancel}
                  onActivate={handleActivation} // Pass the activation handler
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border rounded ${
                        page === pagination.currentPage
                          ? "bg-blue-500 text-white border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results Info */}
            <div className="text-center text-sm text-gray-500">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalCount
              )}{" "}
              of {pagination.totalCount} leases
            </div>
          </>
        )}

        {/* Action Modals */}
        {showRenewalModal && (
          <LeaseRenewalModal
            lease={selectedLeaseForAction}
            isOpen={showRenewalModal}
            onClose={() => {
              setShowRenewalModal(false);
              setSelectedLeaseForAction(null);
            }}
            onSubmit={handleRenewalSubmit}
          />
        )}

        {showCancelModal && (
          <LeaseCancelModal
            lease={selectedLeaseForAction}
            isOpen={showCancelModal}
            onClose={() => {
              setShowCancelModal(false);
              setSelectedLeaseForAction(null);
            }}
            onSubmit={handleCancelSubmit}
          />
        )}

        {/* New Activation Modal */}
        {showActivationModal && (
          <LeaseActivationModal
            lease={selectedLeaseForAction}
            isOpen={showActivationModal}
            onClose={() => {
              setShowActivationModal(false);
              setSelectedLeaseForAction(null);
            }}
            onSubmit={handleActivationSubmit}
          />
        )}
      </div>
    </Navbar>
  );
};

export default LeaseManagement;

export async function loader() {
  const token = localStorage.getItem("token");
  if (!token) {
    return redirect("/");
  }
 
  try {
    const response = await fetch("/backend/api/auth/verifyToken", {
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