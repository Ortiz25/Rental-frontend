import React, { useState, useEffect } from "react";
import {
  SearchIcon,
  FilterIcon,
  RefreshCw,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  MessageSquare,
  Eye,
  CheckCheck,
  Ban,
  MoreHorizontal,
  Download,
  TrendingUp,
  Users,
  Building2,
} from "lucide-react";
import { useLoaderData, redirect } from "react-router";
import Navbar from "../layout/navbar.jsx";
import InquiryCard from "../components/inquiryCard.jsx";
import InquiryDetailModal from "../components/modals/InquiryDetailModal.jsx";
import UpdateInquiryModal from "../components/modals/UpdateInquiryModal.jsx";
import { formatDate } from "../utils/helperFunctions.jsx";

const InquiriesManagement = () => {
  const userRole = localStorage.getItem("userRole");
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    propertyType: "",
    contactMethod: "",
    assignedTo: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    scheduled: 0,
    completed: 0,
    rejected: 0,
  });

  // Fetch inquiries from API
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/backend/inquiries", {
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

      if (result.status === 200) {
        setInquiries(result.data.inquiries);
        setFilteredInquiries(result.data.inquiries);
        setStats(result.data.stats);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.message || "Failed to fetch inquiries");
      }
    } catch (error) {
      console.error("Inquiries fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Filter inquiries
  useEffect(() => {
    let results = inquiries.filter((inquiry) => {
      // Search term matching
      const matchesSearch =
        inquiry.inquirer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.inquirer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.inquirer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        filters.status === "" || inquiry.inquiry_status === filters.status;

      // Date range filter
      const inquiryDate = new Date(inquiry.created_at);
      const matchesDateFrom =
        filters.dateFrom === "" ||
        inquiryDate >= new Date(filters.dateFrom);
      const matchesDateTo =
        filters.dateTo === "" ||
        inquiryDate <= new Date(filters.dateTo + "T23:59:59");

      // Contact method filter
      const matchesContactMethod =
        filters.contactMethod === "" ||
        inquiry.preferred_contact_method === filters.contactMethod;

      // Property type filter
      const matchesPropertyType =
        filters.propertyType === "" ||
        inquiry.property_type === filters.propertyType;

      // Assigned to filter
      const matchesAssignedTo =
        filters.assignedTo === "" ||
        (filters.assignedTo === "unassigned" && !inquiry.assigned_to) ||
        (filters.assignedTo === "assigned" && inquiry.assigned_to);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesContactMethod &&
        matchesPropertyType &&
        matchesAssignedTo
      );
    });

    setFilteredInquiries(results);
  }, [searchTerm, inquiries, filters]);

  const handleViewDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  const handleUpdateInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowUpdateModal(true);
  };

  const handleQuickStatusUpdate = async (inquiryId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/backend/inquiries/${inquiryId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (result.status === 200) {
        await fetchInquiries();
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status: " + error.message);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
      propertyType: "",
      contactMethod: "",
      assignedTo: "",
    });
    setSearchTerm("");
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "ID",
      "Date",
      "Name",
      "Email",
      "Phone",
      "Property",
      "Unit",
      "Status",
      "Contact Method",
      "Move-in Date",
      "Message",
    ];

    const rows = filteredInquiries.map((inquiry) => [
      inquiry.id,
      formatDate(inquiry.created_at),
      inquiry.inquirer_name,
      inquiry.inquirer_email,
      inquiry.inquirer_phone,
      inquiry.property_name,
      inquiry.unit_number || "N/A",
      inquiry.inquiry_status,
      inquiry.preferred_contact_method,
      inquiry.preferred_move_in_date || "N/A",
      `"${inquiry.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get unique property types
  const uniquePropertyTypes = [
    ...new Set(inquiries.map((i) => i.property_type)),
  ];

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      contacted: "bg-blue-100 text-blue-800 border-blue-200",
      scheduled: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading && inquiries.length === 0) {
    return (
      <Navbar activeModule="Inquiries Management">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading inquiries...</p>
          </div>
        </div>
      </Navbar>
    );
  }

  if (error) {
    return (
      <Navbar activeModule="Inquiries Management">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Inquiries
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchInquiries}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar activeModule="Inquiries Management">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Property Inquiries
              </h1>
              <p className="text-gray-600">
                Manage and respond to tenant inquiries
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 md:mt-0 flex gap-3">
              <button
                onClick={fetchInquiries}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                title="Export to CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <div className="flex bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Grid View"
                >
                  <Building2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  title="List View"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Total</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {stats.total}
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-700">Pending</span>
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {stats.pending}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Contacted</span>
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {stats.contacted}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">Scheduled</span>
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {stats.scheduled}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Completed</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">
                {stats.completed}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700">Rejected</span>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-900">
                {stats.rejected}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, phone, property, or message..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FilterIcon className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Property Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.propertyType}
                  onChange={(e) =>
                    setFilters({ ...filters, propertyType: e.target.value })
                  }
                >
                  <option value="">All Types</option>
                  {uniquePropertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Method
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.contactMethod}
                  onChange={(e) =>
                    setFilters({ ...filters, contactMethod: e.target.value })
                  }
                >
                  <option value="">All Methods</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              {/* Assignment Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.assignedTo}
                  onChange={(e) =>
                    setFilters({ ...filters, assignedTo: e.target.value })
                  }
                >
                  <option value="">All</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || Object.values(filters).some((f) => f !== "")) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-700 font-medium">
            Showing {filteredInquiries.length} of {inquiries.length} inquiries
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Inquiries Display */}
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-gray-400 mb-4">
              <MessageSquare className="mx-auto h-16 w-16" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Inquiries Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {inquiries.length === 0
                ? "There are currently no property inquiries."
                : "Try adjusting your search criteria or filters."}
            </p>
            {inquiries.length > 0 && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                onViewDetails={handleViewDetails}
                onUpdate={handleUpdateInquiry}
                onQuickStatusUpdate={handleQuickStatusUpdate}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Inquirer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {inquiry.inquirer_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {inquiry.inquirer_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {inquiry.property_name}
                          </div>
                          {inquiry.unit_number && (
                            <div className="text-sm text-gray-600">
                              Unit {inquiry.unit_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {inquiry.preferred_contact_method === "email" && (
                            <Mail className="w-4 h-4 text-gray-500" />
                          )}
                          {inquiry.preferred_contact_method === "phone" && (
                            <Phone className="w-4 h-4 text-gray-500" />
                          )}
                          {inquiry.preferred_contact_method === "whatsapp" && (
                            <Phone className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-sm text-gray-700 capitalize">
                            {inquiry.preferred_contact_method}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(inquiry.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            inquiry.inquiry_status
                          )}`}
                        >
                          {inquiry.inquiry_status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(inquiry)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateInquiry(inquiry)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Update"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        <InquiryDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInquiry(null);
          }}
          inquiry={selectedInquiry}
          onUpdate={() => {
            setShowDetailModal(false);
            handleUpdateInquiry(selectedInquiry);
          }}
          getStatusColor={getStatusColor}
        />

        <UpdateInquiryModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedInquiry(null);
          }}
          inquiry={selectedInquiry}
          onSuccess={() => {
            setShowUpdateModal(false);
            setSelectedInquiry(null);
            fetchInquiries();
          }}
        />
      </div>
    </Navbar>
  );
};

export default InquiriesManagement;

// Loader function for authentication
export async function loader() {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/");
  }

  try {
    const response = await fetch("/backend/auth/verifyToken", {
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

    // Check role permissions - only admin and staff
    const allowedRoles = ["Super Admin", "Admin", "Manager", "Staff", "Building Manager", "Caretaker"];
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