import React, { useState, useEffect } from "react";
import Navbar from "../layout/navbar";

import {
  MessageSquare,
  Bell,
  Send,
  Users,
  Search,
  Briefcase,
  Settings,
  X,
  Filter,
  Star,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader,
  RefreshCw,
  Eye,
  MoreHorizontal,
  User,
  ArrowUp,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Calendar,
  Info,ArrowDown
} from "lucide-react";
import NewMessageModal from "../components/modals/NewMessageModal";
import AnnouncementModal from "../components/modals/AnnouncementModal";
import { redirect } from "react-router";

const CommunicationTools = () => {
  const [activeModule, setActiveModule] = useState("Communication");
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  // Loading and pagination states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);


  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    priority: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    messages: { total: 0, unread: 0 },
    notifications: { total: 0, unread: 0 },
  });

  // Load data on component mount and tab change
  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
    } else {
      fetchAnnouncements();
    }
    fetchStats();
  }, [activeTab, currentPage, filters, itemsPerPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        if (activeTab === "messages") {
          fetchMessages();
        } else {
          fetchAnnouncements();
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(), // Use state variable
        ...filters,
      });
      const response = await fetch(
        `/backend/api/communications/messages?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log(data);

      if (response.status === 200) {
        setMessages(data.data.messages || []);
        setTotalPages(data.data.pagination.totalPages);
        setHasNextPage(data.data.pagination.hasNextPage);
        setHasPreviousPage(data.data.pagination.hasPreviousPage);

        setTotalItems(data.data.pagination.totalAnnouncements); // or totalMessages
      } else {
        throw new Error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        priority: filters.priority,
      });

      const response = await fetch(
        `/backend/api/communications/announcements?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(data)
        setAnnouncements(data.data.announcements || []);
        setTotalPages(data.data.pagination.totalPages);
        setHasNextPage(data.data.pagination.hasNextPage);
        setHasPreviousPage(data.data.pagination.hasPreviousPage);

        setTotalItems(data.data.pagination.totalAnnouncements); // or totalMessages
      } else {
        throw new Error("Failed to fetch announcements");
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setError("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "/backend/api/communications/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleMessageSent = () => {
    fetchMessages();
    fetchStats();
  };

  const handleAnnouncementSent = () => {
    fetchAnnouncements();
    fetchStats();
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `/backend/api/communications/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh announcements to show updated read status
      fetchAnnouncements();
      fetchStats();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "text-red-600 bg-red-50",
      normal: "text-blue-600 bg-blue-50",
      low: "text-gray-600 bg-gray-50",
    };
    return colors[priority] || colors.normal;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "unread":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "read":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const MessageList = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading messages...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No messages found</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow
              ${message.status === "unread" ? "border-l-4 border-blue-500" : ""}
              ${
                message.priority === "high" ? "border-t-2 border-red-500" : ""
              }`}
            onClick={() => setSelectedMessage(message)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                {/* Sender/Recipient Section */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm
                      ${
                        message.direction === "outbound"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-green-50 text-green-700 border border-green-200"
                      }`}
                    >
                      {message.direction === "outbound" ? (
                        <>
                          <ArrowUp className="w-4 h-4" />
                          <span>To: {message.tenant?.name || "Unknown"}</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-4 h-4" />
                          <span>From: {message.sender}</span>
                        </>
                      )}
                    </div>
                    {getStatusIcon(message.status)}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">{message.property}</p>

                {/* Tenant Details */}
                {message.tenant && (
                  <div className="mt-2 bg-gray-50 rounded-md p-3 border-l-4 border-gray-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-800">
                        {message.tenant.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{message.tenant.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{message.tenant.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {message.subject && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-md border-l-3 border-blue-400">
                    <p className="text-sm font-semibold text-blue-800">
                      Subject: {message.subject}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-right">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                    message.priority
                  )}`}
                >
                  {message.priority}
                </span>
                <span className="text-sm text-gray-500">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border">
              <p className="text-gray-800 text-sm leading-relaxed">
                {message.content}
              </p>
            </div>
            {message.followUp?.required && (
              <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600">
                <Clock className="w-3 h-3" />
                <span>
                  Follow-up:{" "}
                  {new Date(message.followUp.date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const AnnouncementList = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-16">
          <div className="relative">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <div className="absolute inset-0 w-8 h-8 border-2 border-blue-100 rounded-full"></div>
          </div>
          <span className="mt-4 text-gray-600 font-medium">
            Loading announcements...
          </span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No announcements yet
          </h3>
          <p className="text-gray-500">
            Stay tuned for important updates and notifications
          </p>
        </div>
      ) : (
        announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border ${
              !announcement.isRead
                ? "border-l-4 border-l-blue-500 border-gray-200 bg-gradient-to-r from-blue-50/30 to-white"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Priority Badge - Floating */}
            <div className="absolute top-4 right-4 z-10">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                  announcement.priority === "high"
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                }`}
              >
                {announcement.priority === "high" ? (
                  <AlertCircle className="w-3 h-3 mr-1" />
                ) : (
                  <Info className="w-3 h-3 mr-1" />
                )}
                {announcement.priority}
              </span>
            </div>

            <div className="p-6">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-4 pr-24">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                      {announcement.title}
                    </h3>
                    {!announcement.isRead && (
                      <button
                        onClick={() => markNotificationAsRead(announcement.id)}
                        className="group/btn p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {announcement.content}
                </p>
              </div>

              {/* User & Property Info */}
              {announcement.user && (
                <div className="mb-4 space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {announcement.user.fullName}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {announcement.user.role}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600 truncate">
                            {announcement.user.userEmail}
                          </span>
                        </div>
                        {announcement.user.userPhone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {announcement.user.userPhone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Property Info - Only for Tenants */}
                  {announcement.property && (
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Home className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {announcement.property.propertyName}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Unit {announcement.property.unitNumber}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="truncate">
                              {announcement.property.propertyAddress}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 text-gray-400" />
                            <span>
                              KSh{" "}
                              {announcement.property.monthlyRent?.toLocaleString()}
                              /mo
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Bed className="w-3 h-3 text-gray-400" />
                            <span>
                              {announcement.property.bedrooms} bed,{" "}
                              {announcement.property.bathrooms} bath
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="truncate">
                              {announcement.property.leaseNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 font-medium">
                    {announcement.recipients}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {announcement.date}
                  </span>
                </div>
              </div>
            </div>

            {/* Unread Indicator */}
            {!announcement.isRead && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full m-3 shadow-lg animate-pulse"></div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mt-6">
      {/* Page Info and Items Per Page Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">per page</span>
        </div>
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
          items
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          title="First page"
        >
          First
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          title="Last page"
        >
          Last
        </button>
      </div>
    </div>
  );

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6">
        {/* Stats Bar - Updated */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{stats.messages.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.messages.unread || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Announcements</p>
                <p className="text-2xl font-bold">
                  {stats.notifications.announcements || 0}
                </p>
              </div>
              <Bell className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Announcements</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.notifications.unreadAnnouncements || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={() =>
                  activeTab === "messages"
                    ? fetchMessages()
                    : fetchAnnouncements()
                }
                className="text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center flex-shrink-0 text-sm sm:text-base transition-colors"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>New Message</span>
            </button>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded flex items-center flex-shrink-0 text-sm sm:text-base transition-colors"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>New Announcement</span>
            </button>
            <button
              onClick={() =>
                activeTab === "messages"
                  ? fetchMessages()
                  : fetchAnnouncements()
              }
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search..."
                className="w-full sm:w-[200px] pl-9 pr-4 py-2 border rounded text-sm"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded transition-colors ${
                showFilters
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeTab === "messages" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Type
                    </label>
                    <select
                      className="w-full p-2 border rounded text-sm"
                      value={filters.type}
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value)
                      }
                    >
                      <option value="all">All Types</option>
                      <option value="Email">Email</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="In-Person">In-Person</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      className="w-full p-2 border rounded text-sm"
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                    >
                      <option value="all">All Status</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="pending">Pending Follow-up</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  className="w-full p-2 border rounded text-sm"
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          <button
            className={`pb-2 px-4 ${
              activeTab === "messages"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            Messages
            {stats.messages.unread > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.messages.unread}
              </span>
            )}
          </button>
          <button
            className={`pb-2 px-4 ${
              activeTab === "announcements"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("announcements")}
          >
            Announcements
            {(stats.notifications.unreadAnnouncements || 0) > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.notifications.unreadAnnouncements}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {activeTab === "messages" ? <MessageList /> : <AnnouncementList />}
          </div>

          {/* Fixed pagination at bottom */}
          {totalPages > 1 && (
            <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-200 bg-white">
              <Pagination />
            </div>
          )}
        </div>

        {/* Modals */}
        <NewMessageModal
          isOpen={showNewMessageModal}
          onClose={() => setShowNewMessageModal(false)}
          onMessageSent={handleMessageSent}
        />
        <AnnouncementModal
          isOpen={showAnnouncementModal}
          onClose={() => setShowAnnouncementModal(false)}
          onAnnouncementSent={handleAnnouncementSent}
        />
      </div>
    </Navbar>
  );
};

export default CommunicationTools;

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
