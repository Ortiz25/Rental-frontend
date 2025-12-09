import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, Calendar, Shield, Bell, Globe, Clock, Activity, ChevronDown } from "lucide-react";

const ViewUserModal = ({ isOpen, onClose, user }) => {
  const [userActivity, setUserActivity] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const url = "/backend/usermgt"
  
  useEffect(() => {
    if (isOpen && user) {
      if (activeTab === 'activity') {
        fetchUserActivity();
      } else if (activeTab === 'sessions') {
        fetchUserSessions();
      }
    }
  }, [isOpen, user, activeTab]);

  const fetchUserActivity = async () => {
    try {
      setLoadingActivity(true);
      const response = await fetch(`${url}/users/${user.id}/activity?limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserActivity(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching user activity:', err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchUserSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await fetch(`${url}/users/${user.id}/sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserSessions(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching user sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    
    // Check if on mobile for shorter format
    if (window.innerWidth < 640) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
    return date.toLocaleString();
  };

  const getStatusBadge = (isActive, isVerified) => {
    if (!isActive) return { text: 'Inactive', color: 'bg-red-100 text-red-800' };
    if (!isVerified) return { text: 'Unverified', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Active', color: 'bg-green-100 text-green-800' };
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'USER_LOGIN':
        return '🔐';
      case 'USER_LOGOUT':
        return '🚪';
      case 'USER_CREATED':
        return '👤';
      case 'USER_UPDATED':
        return '✏️';
      case 'PASSWORD_RESET':
        return '🔑';
      default:
        return '📝';
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  const status = getStatusBadge(user.is_active, user.is_verified);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[60] p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-modal-enter">
        
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b bg-white z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">User Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* User Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b z-10">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-xl sm:text-2xl">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                  {status.text}
                </span>
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  {user.role_name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Compact and fit to screen */}
        <div className="border-b bg-white z-10">
          <nav className="flex px-3 sm:px-6">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'activity', label: 'Activity', icon: Activity },
              { id: 'sessions', label: 'Sessions', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center space-x-1 sm:space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-gray-900">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Username</label>
                      <p className="text-sm sm:text-base text-gray-900 font-medium">{user.username}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm sm:text-base text-gray-900 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm sm:text-base text-gray-900">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">First Name</label>
                      <p className="text-sm sm:text-base text-gray-900 font-medium">{user.first_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Last Name</label>
                      <p className="text-sm sm:text-base text-gray-900 font-medium">{user.last_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Role</label>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-semibold">
                          {user.role_name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-gray-900">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Account Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Created</label>
                    <p className="text-sm sm:text-base text-gray-900">{formatDate(user.created_at)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Last Updated</label>
                    <p className="text-sm sm:text-base text-gray-900">{formatDate(user.updated_at)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Last Login</label>
                    <p className="text-sm sm:text-base text-gray-900">{formatDate(user.last_login)}</p>
                  </div>
                  {user.unread_notifications !== undefined && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Unread Notifications</label>
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-orange-500" />
                        <span className={`text-sm sm:text-base font-semibold ${
                          user.unread_notifications > 0 ? 'text-orange-600' : 'text-gray-900'
                        }`}>
                          {user.unread_notifications}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-gray-900">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Preferences
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Timezone</label>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm sm:text-base text-gray-900">{user.timezone || 'Africa/Nairobi'}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">Language</label>
                      <p className="text-sm sm:text-base text-gray-900">{user.language || 'English'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs sm:text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Bell className="w-4 h-4 mr-1" />
                      Notification Preferences
                    </label>
                    <div className="space-y-2">
                      {user.notification_preferences ? (
                        Object.entries(user.notification_preferences).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className="text-xs sm:text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {value ? 'On' : 'Off'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-xs sm:text-sm">Not configured</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-gray-900">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                Recent Activity
              </h4>
              {loadingActivity ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  <p className="mt-3 text-sm text-gray-500">Loading activity...</p>
                </div>
              ) : userActivity.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {userActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{getActivityIcon(activity.activity_type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{activity.activity_description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.activity_timestamp)}
                          </span>
                          {activity.ip_address && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <span className="hidden sm:inline">IP: </span>{activity.ip_address}
                            </span>
                          )}
                          {activity.affected_resource_type && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                              {activity.affected_resource_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No activity recorded</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-gray-900">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                Active Sessions
              </h4>
              {loadingSessions ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  <p className="mt-3 text-sm text-gray-500">Loading sessions...</p>
                </div>
              ) : userSessions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {userSessions.map((session, index) => (
                    <div key={index} className="p-3 sm:p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                            session.is_active && !session.is_expired ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                          }`} />
                          <span className="text-xs sm:text-sm font-semibold">
                            {session.is_active && !session.is_expired ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(session.last_activity)}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex items-start sm:items-center">
                          <span className="text-gray-500 font-medium w-20 sm:w-24 flex-shrink-0">IP:</span>
                          <span className="text-gray-900">{session.ip_address}</span>
                        </div>
                        <div className="flex items-start sm:items-center">
                          <span className="text-gray-500 font-medium w-20 sm:w-24 flex-shrink-0">Created:</span>
                          <span className="text-gray-900">{formatDate(session.created_at)}</span>
                        </div>
                        <div className="flex items-start sm:items-center">
                          <span className="text-gray-500 font-medium w-20 sm:w-24 flex-shrink-0">Expires:</span>
                          <span className="text-gray-900">{formatDate(session.expires_at)}</span>
                        </div>
                        {session.device_info && (
                          <div className="flex items-start sm:items-center">
                            <span className="text-gray-500 font-medium w-20 sm:w-24 flex-shrink-0">Device:</span>
                            <span className="text-gray-900 break-all">{session.device_info}</span>
                          </div>
                        )}
                        {session.user_agent && (
                          <div className="flex items-start">
                            <span className="text-gray-500 font-medium w-20 sm:w-24 flex-shrink-0">Agent:</span>
                            <span className="text-gray-600 text-xs break-all">{session.user_agent}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No sessions found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm sm:text-base rounded-lg transition-colors font-medium shadow-sm"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out;
        }

        /* Custom scrollbar for webkit browsers */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
};

export default ViewUserModal;