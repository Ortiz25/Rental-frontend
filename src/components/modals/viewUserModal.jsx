import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, Calendar, Shield, Bell, Globe, Clock, Activity } from "lucide-react";

const ViewUserModal = ({ isOpen, onClose, user }) => {
  const [userActivity, setUserActivity] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const url = "http://localhost:5020/api/usermgt"
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
    return new Date(dateString).toLocaleString();
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

  if (!isOpen || !user) return null;

  const status = getStatusBadge(user.is_active, user.is_verified);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">User Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Header */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
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

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
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
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Username</label>
                      <p className="text-gray-900">{user.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <p className="text-gray-900">{user.role_name}</p>
                      {user.role_description && (
                        <p className="text-sm text-gray-600">{user.role_description}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Status</label>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                          {status.text}
                        </span>
                        {user.is_verified && (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">
                            Email Verified
                          </span>
                        )}
                      </div>
                    </div>
                    {user.linked_tenant_name && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Linked Tenant</label>
                        <p className="text-gray-900">{user.linked_tenant_name}</p>
                        {user.current_unit && (
                          <p className="text-sm text-gray-600">{user.current_unit}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="text-lg font-medium mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-gray-900">{formatDate(user.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900">{formatDate(user.updated_at)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Login</label>
                      <p className="text-gray-900">{formatDate(user.last_login)}</p>
                    </div>
                    {user.unread_notifications !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Unread Notifications</label>
                        <p className="text-gray-900">{user.unread_notifications}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h4 className="text-lg font-medium mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Preferences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Timezone</label>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{user.timezone || 'Africa/Nairobi'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Language</label>
                      <p className="text-gray-900">{user.language || 'English'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">
                      <Bell className="w-4 h-4 inline mr-1" />
                      Notification Preferences
                    </label>
                    <div className="space-y-1">
                      {user.notification_preferences ? (
                        Object.entries(user.notification_preferences).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-sm capitalize">{key}</span>
                            <span className="text-xs text-gray-500">
                              {value ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Not configured</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h4 className="text-lg font-medium mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </h4>
              {loadingActivity ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : userActivity.length > 0 ? (
                <div className="space-y-3">
                  {userActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg">{getActivityIcon(activity.activity_type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.activity_description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.activity_timestamp)}
                          </span>
                          {activity.ip_address && (
                            <span className="text-xs text-gray-500">
                              IP: {activity.ip_address}
                            </span>
                          )}
                          {activity.affected_resource_type && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {activity.affected_resource_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No activity recorded</p>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <h4 className="text-lg font-medium mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Active Sessions
              </h4>
              {loadingSessions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : userSessions.length > 0 ? (
                <div className="space-y-3">
                  {userSessions.map((session, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${
                            session.is_active && !session.is_expired ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className="font-medium">
                            {session.is_active && !session.is_expired ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(session.last_activity)}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><strong>IP:</strong> {session.ip_address}</p>
                        <p><strong>Created:</strong> {formatDate(session.created_at)}</p>
                        <p><strong>Expires:</strong> {formatDate(session.expires_at)}</p>
                        {session.device_info && (
                          <p><strong>Device:</strong> {session.device_info}</p>
                        )}
                        {session.user_agent && (
                          <p className="text-xs"><strong>User Agent:</strong> {session.user_agent}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No sessions found</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;