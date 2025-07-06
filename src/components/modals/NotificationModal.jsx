import React, { useState } from "react";
import {
  X,
  Bell,
  Eye,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const NotificationsModal = ({ isOpen, onClose, notifications, onMarkAsRead, loading }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'urgent'

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'urgent') return notification.isUrgent;
    return true;
  });

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

  const getPriorityColor = (notification) => {
    if (notification.isUrgent) return "border-red-200 bg-red-50";
    if (!notification.isRead) return "border-blue-200 bg-blue-50";
    return "border-gray-200 bg-white";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">All Notifications</h2>
            <p className="text-sm text-gray-600">
              {notifications.filter(n => !n.isRead).length} unread of {notifications.length} total
            </p>
          </div>
          <button onClick={onClose} disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 p-4 border-b bg-gray-50">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Unread ({notifications.filter(n => !n.isRead).length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'urgent'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Urgent ({notifications.filter(n => n.isUrgent).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    !notification.isRead 
                      ? "border-l-4 border-l-blue-500" 
                      : ""
                  } ${getPriorityColor(notification)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        {notification.isUrgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Urgent
                          </span>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Mark as read"
                            disabled={loading}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{notification.content}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span className="capitalize">
                          {notification.type?.replace('_', ' ') || 'Notification'}
                        </span>
                        <span>{formatTimestamp(notification.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;