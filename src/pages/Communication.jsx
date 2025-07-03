import React, { useState, useEffect } from "react";
import Navbar from "../layout/navbar";

import {
  MessageSquare,
  Bell,
  Send,
  Users,
  Search,
  Plus,
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
  MoreHorizontal
} from "lucide-react";
import NewMessageModal from "../components/modals/NewMessageModal";
import AnnouncementModal from "../components/modals/AnnouncementModal";

const CommunicationTools = () => {
  const [activeModule, setActiveModule] = useState("Communication");
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");
  
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
    priority: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    messages: { total: 0, unread: 0 },
    notifications: { total: 0, unread: 0 }
  });

  // Load data on component mount and tab change
  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
    } else {
      fetchAnnouncements();
    }
    fetchStats();
  }, [activeTab, currentPage, filters]);

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
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...filters
      });

      const response = await fetch(`/backend/api/communications/messages?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages || []);
        setTotalPages(data.data.pagination.totalPages);
        setHasNextPage(data.data.pagination.hasNextPage);
        setHasPreviousPage(data.data.pagination.hasPreviousPage);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        priority: filters.priority
      });

      const response = await fetch(`/backend/api/communications/announcements?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.data.announcements || []);
        setTotalPages(data.data.pagination.totalPages);
        setHasNextPage(data.data.pagination.hasNextPage);
        setHasPreviousPage(data.data.pagination.hasPreviousPage);
      } else {
        throw new Error('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/backend/api/communications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
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
      const token = localStorage.getItem('token');
      await fetch(`/backend/api/communications/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh announcements to show updated read status
      fetchAnnouncements();
      fetchStats();
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
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
              ${message.priority === "high" ? "border-t-2 border-red-500" : ""}`}
            onClick={() => setSelectedMessage(message)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{message.sender}</h3>
                  {getStatusIcon(message.status)}
                </div>
                <p className="text-sm text-gray-600">{message.property}</p>
                {message.subject && (
                  <p className="text-sm font-medium text-gray-800 mt-1">{message.subject}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(message.priority)}`}>
                  {message.priority}
                </span>
                <span className="text-sm text-gray-500">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
            <p className="text-gray-700 line-clamp-2">{message.content}</p>
            {message.followUp?.required && (
              <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600">
                <Clock className="w-3 h-3" />
                <span>Follow-up: {new Date(message.followUp.date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const AnnouncementList = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading announcements...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No announcements found</p>
        </div>
      ) : (
        announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`bg-white rounded-lg shadow-md p-4 ${
              !announcement.isRead ? "border-l-4 border-blue-500" : ""
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{announcement.title}</h3>
                  {!announcement.isRead && (
                    <button
                      onClick={() => markNotificationAsRead(announcement.id)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Mark as read"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  announcement.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {announcement.priority}
              </span>
            </div>
            <p className="text-gray-700 mb-2">{announcement.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{announcement.recipients}</span>
              <span>{announcement.date}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const Pagination = () => (
    <div className="flex justify-between items-center mt-6">
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex space-x-2">
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
      </div>
    </div>
  );

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6">
        {/* Stats Bar */}
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
                <p className="text-2xl font-bold text-orange-600">{stats.messages.unread || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Announcements</p>
                <p className="text-2xl font-bold">{stats.notifications.announcements || 0}</p>
              </div>
              <Bell className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Notifications</p>
                <p className="text-2xl font-bold text-red-600">{stats.notifications.unread || 0}</p>
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
                onClick={() => activeTab === "messages" ? fetchMessages() : fetchAnnouncements()}
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
              onClick={() => activeTab === "messages" ? fetchMessages() : fetchAnnouncements()}
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
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
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
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      className="w-full p-2 border rounded text-sm"
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="Email">Email</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="In-Person">In-Person</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      className="w-full p-2 border rounded text-sm"
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
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
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  className="w-full p-2 border rounded text-sm"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
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
            {stats.notifications.unread > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.notifications.unread}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === "messages" ? <MessageList /> : <AnnouncementList />}
          {totalPages > 1 && <Pagination />}
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