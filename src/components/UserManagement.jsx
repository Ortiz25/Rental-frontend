import React, { useState, useEffect } from "react";
import { UserPlus, Search, Filter, Eye, MoreVertical } from "lucide-react";
import AddUserModal from "./modals/AddUserModal.jsx";
import EditUserModal from "./modals/EditUser.jsx";
import ViewUserModal from "./modals/viewUserModal.jsx";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roles, setRoles] = useState([]);
  const url = "http://localhost:5020/api/usermgt/"

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`${url}users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles for filter dropdown
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${url}user-roles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Reload users when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, statusFilter]);

  // Handler for adding new user
  const handleAddUser = async (userData) => {
    try {
      const response = await fetch(`${url}users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      
      const result = await response.json();
      
      // Refresh the user list
      await fetchUsers();
      
      // Show success message (you might want to add a toast notification here)
      alert(result.message || 'User created successfully');
      
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Error creating user: ' + err.message);
    }
  };

  // Handler for editing user
  const handleEditUser = async (updatedUserData) => {
    try {
      const response = await fetch(`${url}users/${updatedUserData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUserData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      
      const result = await response.json();
      
      // Refresh the user list
      await fetchUsers();
      
      // Show success message
      alert(result.message || 'User updated successfully');
      
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Error updating user: ' + err.message);
    }
  };

  // Handler for deactivating/activating user
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await fetch(`${url}users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }
      
      const result = await response.json();
      
      // Refresh the user list
      await fetchUsers();
      
      // Show success message
      alert(result.message || `User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Error updating user status: ' + err.message);
    }
  };

  // Handler for viewing user details
  const handleViewUser = async (userId) => {
    try {
      const response = await fetch(`${url}users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const data = await response.json();
      setSelectedUser(data.data);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      alert('Error fetching user details: ' + err.message);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  // Get status badge color
  const getStatusBadgeColor = (isActive, isVerified) => {
    if (!isActive) return "bg-red-100 text-red-800";
    if (!isVerified) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  // Get status text
  const getStatusText = (isActive, isVerified) => {
    if (!isActive) return "Inactive";
    if (!isVerified) return "Unverified";
    return "Active";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading users: {error}</p>
        <button 
          onClick={() => fetchUsers()}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600 transition-colors"
        >
          <UserPlus className="w-5 h-5 mr-2" /> Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        
        <select 
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role.id} value={role.role_name}>
              {role.role_name}
            </option>
          ))}
        </select>
        
        <select 
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table - Desktop and Tablet View */}
      <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Notifications
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.is_active, user.is_verified)}`}
                  >
                    {getStatusText(user.is_active, user.is_verified)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.last_login)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.unread_notifications > 0 && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                      {user.unread_notifications} unread
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewUser(user.id)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                      className={`px-2 py-1 text-xs ${
                        user.is_active 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching your criteria.
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="sm:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="font-medium">{user.first_name} {user.last_name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.is_active, user.is_verified)}`}
              >
                {getStatusText(user.is_active, user.is_verified)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Role</span>
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  {user.role_name}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Last Login</span>
                <span>{formatDate(user.last_login)}</span>
              </div>
              {user.unread_notifications > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Notifications</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                    {user.unread_notifications} unread
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-end space-x-4">
              <button
                onClick={() => handleViewUser(user.id)}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                View
              </button>
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowEditModal(true);
                }}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                className={`text-sm font-medium ${
                  user.is_active 
                    ? 'text-red-600 hover:text-red-900' 
                    : 'text-green-600 hover:text-green-900'
                }`}
              >
                {user.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{users.length}</span> users
          </div>
          {/* Add pagination controls here if needed */}
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        roles={roles}
      />

      {selectedUser && (
        <>
          <EditUserModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onSubmit={handleEditUser}
            roles={roles}
          />
          
          <ViewUserModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
          />
        </>
      )}
    </div>
  );
};

export default UserManagement;