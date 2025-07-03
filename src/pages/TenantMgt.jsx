import React, { useState, useEffect, useMemo } from "react";
import {
  UserPlus,
  UserMinus,
  AlertCircle,
  FileText,
  Check,
  X,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader,
  Home,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useLoaderData } from "react-router";
import { redirect } from "react-router";
import Navbar from "../layout/navbar.jsx";
import TenantDetailsModal from "../components/modals/TenantsDetailsModal.jsx";
import OffboardTenantModal from "../components/modals/offboardModal.jsx";
import EnhancedOnboardingForm from "../components/onboardingForm.jsx";
import EnhancedStats from "../components/EnhancedStats.jsx";

const TenantManagement = () => {
  const [activeModule, setActiveModule] = useState("Tenant Management");
  const [tenants, setTenants] = useState([]);
  const [blacklistedTenants, setBlacklistedTenants] = useState([]);
  const [tenantStats, setTenantStats] = useState({
    totalTenants: 0,
    activeLeases: 0,
    pendingPayments: 0,
    expiringLeases: 0,
  });

  // Modal states
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showOffboardModal, setShowOffboardModal] = useState(false);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loaderData = useLoaderData();

  // Fetch tenants from API
  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Fetching tenants...");
      const response = await fetch("http://localhost:5020/api/tenants", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const keysToRemove = ["token", "user", "name", "userRole", "userId"];
          keysToRemove.forEach((key) => localStorage.removeItem(key));
          window.location.href = "/";
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Tenants data received:", result);

      if (result.status === 200) {
        setTenants(result.data.tenants);
        setTenantStats(result.data.stats);
        setLastUpdated(new Date());
        console.log("Tenants updated successfully");
      } else {
        throw new Error(result.message || "Failed to fetch tenants");
      }
    } catch (error) {
      console.error("Tenants fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tenants on component mount
  useEffect(() => {
    fetchTenants();
  }, []);

  // Filter tenants based on search term
  const filteredTenants = useMemo(() => {
    return tenants.filter(
      (tenant) =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tenants, searchTerm]);

  // Pagination calculations
  const paginationData = useMemo(() => {
    const totalItems = filteredTenants.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredTenants.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentItems,
      showingStart: startIndex + 1,
      showingEnd: Math.min(endIndex, totalItems)
    };
  }, [filteredTenants, currentPage, itemsPerPage]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Pagination controls
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of tenant list
    document.getElementById('tenant-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { totalPages } = paginationData;
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Handle tenant offboarding
  const handleOffboard = async (offboardData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:5020/api/tenants/${selectedTenant.id}/offboard`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(offboardData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.status === 200) {
        console.log("Tenant offboarded successfully:", result.data);
        // Refresh tenants list
        await fetchTenants();
        return true;
      } else {
        throw new Error(result.message || "Failed to offboard tenant");
      }
    } catch (error) {
      console.error("Error offboarding tenant:", error);
      setError(`Failed to offboard tenant: ${error.message}`);
      return false;
    }
  };

  // Handle tenant onboarding
  const handleOnboard = async (tenantData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Use the enhanced onboarding endpoint with unit allocation
      const response = await fetch(
        "http://localhost:5020/api/tenants/onboard-with-unit",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tenantData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.status === 201) {
        console.log(
          "Tenant onboarded successfully with unit allocation:",
          result.data
        );
        // Refresh tenants list
        await fetchTenants();

        // Show success message with unit details
        setError(null);
        setLastUpdated(new Date());

        return true;
      } else {
        throw new Error(result.message || "Failed to onboard tenant");
      }
    } catch (error) {
      console.error("Error onboarding tenant:", error);
      setError(`Failed to onboard tenant: ${error.message}`);
      return false;
    }
  };

  const handleBlacklist = (tenant, reason) => {
    const blacklistedTenant = {
      ...tenant,
      blacklistDate: new Date().toISOString(),
      blacklistReason: reason,
      status: "Blacklisted",
    };

    setBlacklistedTenants([...blacklistedTenants, blacklistedTenant]);
    setTenants(tenants.filter((t) => t.id !== tenant.id));
    setShowBlacklistModal(false);
    setBlacklistReason("");
  };

  // Tenant Card Component
  const TenantCard = ({ tenant }) => {
    console.log("Tenant data:", tenant);
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
      console.log('Offboard button clicked for tenant:', tenant);
      console.log('Tenant status:', tenant.status);
      console.log('Should be disabled?', tenant.status === 'No Active Lease');
      
      setSelectedTenant(tenant);
      setShowOffboardModal(true);
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
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
          <div className="flex flex-col items-end space-y-2">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                tenant.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : tenant.status === "Warning"
                  ? "bg-yellow-100 text-yellow-800"
                  : tenant.status === "Expired"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {tenant.status}
            </span>
            {tenant.isPrimaryTenant && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Primary
              </span>
            )}
          </div>
        </div>

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

        <div className="flex justify-between border-t pt-4">
          <button
            onClick={() => {
              setSelectedTenant(tenant);
              setShowDetailsModal(true);
            }}
            className="text-blue-600 hover:underline text-sm flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </button>
          <button
            onClick={handleOffboardClick}
            className={`text-red-600 hover:underline text-sm flex items-center ${
              tenant.status === "No Active Lease"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            // disabled={tenant.status === "No Active Lease"}
          >
            <UserMinus className="w-4 h-4 mr-1" />
            Offboard
          </button>
        </div>
      </div>
    );
  };

  // Pagination Component
  const PaginationControls = () => {
    const { totalPages, totalItems, showingStart, showingEnd } = paginationData;
    const pageNumbers = getPageNumbers();

    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
        {/* Results info */}
        <div className="text-sm text-gray-700">
          Showing {showingStart} to {showingEnd} of {totalItems} tenants
        </div>

        {/* Page size selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center space-x-1">
          {/* First page */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-2 rounded-md border text-sm font-medium ${
                currentPage === pageNum
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next page */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // Enhanced Onboarding Form Component
  const OnboardingForm = () => {
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (formData) => {
      setSubmitting(true);
      try {
        const success = await handleOnboard(formData);
        if (success) {
          setShowOnboardingModal(false);
        }
        return success;
      } catch (error) {
        console.error("Onboarding error:", error);
        return false;
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <EnhancedOnboardingForm
        onSubmit={handleSubmit}
        onClose={() => setShowOnboardingModal(false)}
      />
    );
  };

  const BlacklistModal = ({ tenant }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={() => setShowBlacklistModal(false)}
      />
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          Blacklist Tenant
        </h2>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Tenant: {tenant?.name}</p>
            <p className="text-sm text-gray-600">
              Property: {tenant?.propertyName}
            </p>
          </div>
          <textarea
            placeholder="Reason for blacklisting..."
            className="w-full p-2 border rounded"
            rows={4}
            value={blacklistReason}
            onChange={(e) => setBlacklistReason(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowBlacklistModal(false)}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleBlacklist(tenant, blacklistReason)}
              className="bg-red-500 text-white px-4 py-2 rounded"
              disabled={!blacklistReason.trim()}
            >
              Confirm Blacklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const BlacklistedTenantsSection = () => (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Blacklisted Tenants</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {blacklistedTenants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No blacklisted tenants</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Previous Property
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Blacklist Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blacklistedTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{tenant.name}</td>
                  <td className="px-4 py-3">{tenant.propertyName}</td>
                  <td className="px-4 py-3">
                    {new Date(tenant.blacklistDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{tenant.blacklistReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  if (loading && tenants.length === 0) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-lg text-gray-600">Loading tenants...</p>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6 p-6">
        {/* Header with user info and refresh button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Tenant Management
            </h1>
            {loaderData?.user && (
              <p className="text-sm text-gray-600 mt-1">
                Managing tenants as {loaderData.user.role}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchTenants}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error loading tenants
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <EnhancedStats tenantStats={tenantStats} />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Onboard Tenant
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search tenants..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            Showing {paginationData.showingStart} to {paginationData.showingEnd} of {paginationData.totalItems} tenants
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Tenant Grid */}
        <div id="tenant-grid">
          {paginationData.currentItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tenants found
              </h3>
              <p className="text-gray-500 mb-4">
                {tenants.length === 0
                  ? "Get started by onboarding your first tenant."
                  : "Try adjusting your search criteria."}
              </p>
              {tenants.length === 0 && (
                <button
                  onClick={() => setShowOnboardingModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                >
                  Onboard Your First Tenant
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginationData.currentItems.map((tenant) => (
                  <TenantCard key={tenant.id} tenant={tenant} />
                ))}
              </div>
              
              {/* Pagination Controls */}
              <PaginationControls />
            </>
          )}
        </div>

        {/* Modals */}
        {selectedTenant && (
          <>
            <TenantDetailsModal
              tenant={selectedTenant}
              isOpen={showDetailsModal}
              onClose={() => {
                setShowDetailsModal(false);
                setSelectedTenant(null);
              }}
            />

            <OffboardTenantModal
              tenant={selectedTenant}
              isOpen={showOffboardModal}
              onClose={() => {
                setShowOffboardModal(false);
                setSelectedTenant(null);
              }}
              onOffboard={async (offboardData) => {
                const success = await handleOffboard(offboardData);
                if (success) {
                  setShowOffboardModal(false);
                  setSelectedTenant(null);
                }
              }}
            />
          </>
        )}

        {/* Onboarding Modal */}
        {showOnboardingModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() => setShowOnboardingModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl z-10">
              <OnboardingForm />
            </div>
          </div>
        )}

        {/* Blacklist Modal */}
        {showBlacklistModal && <BlacklistModal tenant={selectedTenant} />}

        {/* Blacklisted Tenants Section */}
        <BlacklistedTenantsSection />

        {/* Loading Overlay for refreshes */}
        {loading && tenants.length > 0 && (
          <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 z-50">
            <div className="flex items-center justify-center">
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Updating tenants...
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
};

export default TenantManagement;

export async function loader() {
  const token = localStorage.getItem("token");
  console.log(token)
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
     console.log(userData)
    if (userData.status !== 200) {
      const keysToRemove = ["token", "user", "name", "userRole", "userId"];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      return redirect("/");
    }

    // Check role permissions
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