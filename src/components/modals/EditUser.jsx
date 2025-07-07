import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, AlertTriangle } from "lucide-react";

const EditUserModal = ({ isOpen, onClose, user, onSubmit, roles = [] }) => {
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role_id: '',
    tenant_id: '',
    is_active: true,
    timezone: 'Africa/Nairobi',
    language: 'en',
    notification_preferences: {
      email: true,
      sms: false,
      push: true
    }
  });

  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user && isOpen) {
      setUserData({
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        role_id: user.role_id || '',
        tenant_id: user.tenant_id || '',
        is_active: user.is_active !== undefined ? user.is_active : true,
        timezone: user.timezone || 'Africa/Nairobi',
        language: user.language || 'en',
        notification_preferences: user.notification_preferences || {
          email: true,
          sms: false,
          push: true
        }
      });
      setChangePassword(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setErrors({});
    }
  }, [user, isOpen]);

  // Fetch tenants when role is set to Tenant
  useEffect(() => {
    if (!userData.role_id) return;
    
    const selectedRole = roles.find(role => role.id === parseInt(userData.role_id));
    if (selectedRole && selectedRole.role_name === 'Tenant') {
      fetchAvailableTenants();
    } else {
      setTenants([]);
      if (userData.tenant_id && selectedRole?.role_name !== 'Tenant') {
        setUserData(prev => ({ ...prev, tenant_id: '' }));
      }
    }
  }, [userData.role_id, roles]);

  const fetchAvailableTenants = async () => {
    try {
      setLoadingTenants(true);
      const response = await fetch('http://localhost:5020/api/usermgt/tenants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTenants(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoadingTenants(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!userData.username.trim()) newErrors.username = 'Username is required';
    if (!userData.email.trim()) newErrors.email = 'Email is required';
    if (!userData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!userData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!userData.role_id) newErrors.role_id = 'Role is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userData.email && !emailRegex.test(userData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation (no spaces, special characters)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (userData.username && !usernameRegex.test(userData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation (if changing password)
    if (changePassword) {
      if (!newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long';
      }

      if (newPassword !== confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match';
      }
    }

    // Tenant validation for Tenant role
    const selectedRole = roles.find(role => role.id === parseInt(userData.role_id));
    if (selectedRole && selectedRole.role_name === 'Tenant' && !userData.tenant_id) {
      newErrors.tenant_id = 'Please select a tenant for Tenant role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data for submission
      const submitData = { ...userData };
      
      // Convert role_id to number
      submitData.role_id = parseInt(submitData.role_id);
      
      // Convert tenant_id to number or null
      if (submitData.tenant_id) {
        submitData.tenant_id = parseInt(submitData.tenant_id);
      } else {
        submitData.tenant_id = null;
      }

      // Add password if changing
      if (changePassword && newPassword) {
        submitData.password = newPassword;
      }

      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNotificationChange = (type, value) => {
    setUserData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: value
      }
    }));
  };

  // Handler for manual email verification
  const handleEmailVerification = async (verify = true) => {
    try {
      const response = await fetch(`http://localhost:5020/api/usermgt/users/${user.id}/verify-email`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_verified: verify })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update email verification');
      }
      
      const result = await response.json();
      alert(result.message || `Email ${verify ? 'verified' : 'unverified'} successfully`);
      
      // Refresh parent component to show updated status
      window.location.reload(); // You might want to use a more elegant refresh method
      
    } catch (err) {
      console.error('Error updating email verification:', err);
      alert('Error updating email verification: ' + err.message);
    }
  };

  const selectedRole = roles.find(role => role.id === parseInt(userData.role_id));
  const isTenantRole = selectedRole && selectedRole.role_name === 'Tenant';
  const currentTenant = tenants.find(tenant => tenant.id === parseInt(userData.tenant_id));

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Edit User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Status Warning */}
          {!userData.is_active && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-yellow-800 font-medium">Account Inactive</h4>
                <p className="text-yellow-700 text-sm">
                  This user account is currently inactive and cannot log in.
                </p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={userData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={userData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={userData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={userData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    errors.role_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={userData.role_id}
                  onChange={(e) => handleInputChange('role_id', e.target.value)}
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.role_name} - {role.description}
                    </option>
                  ))}
                </select>
                {errors.role_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.role_id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tenant Association (only for Tenant role) */}
          {isTenantRole && (
            <div>
              <h3 className="text-lg font-medium mb-4">Tenant Association</h3>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Tenant <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    errors.tenant_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={userData.tenant_id}
                  onChange={(e) => handleInputChange('tenant_id', e.target.value)}
                  disabled={loadingTenants}
                >
                  <option value="">
                    {loadingTenants ? 'Loading tenants...' : 'Select Tenant'}
                  </option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.first_name} {tenant.last_name} - {tenant.email}
                      {tenant.has_active_lease ? ' (Active Lease)' : ''}
                    </option>
                  ))}
                </select>
                {errors.tenant_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.tenant_id}</p>
                )}
                {currentTenant && (
                  <p className="text-sm text-gray-600 mt-1">
                    Currently linked to: {currentTenant.first_name} {currentTenant.last_name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Password Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Security</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="rounded text-blue-500"
                />
                <span className="ml-2 text-sm">Change Password</span>
              </label>

              {changePassword && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 pr-10 ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (errors.newPassword) {
                            setErrors(prev => ({ ...prev, newPassword: '' }));
                          }
                        }}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 pr-10 ${
                          errors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          if (errors.confirmNewPassword) {
                            setErrors(prev => ({ ...prev, confirmNewPassword: '' }));
                          }
                        }}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmNewPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-4">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={userData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                >
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={userData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Notification Preferences</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-blue-500"
                    checked={userData.notification_preferences.email}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  />
                  <span className="ml-2 text-sm">Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-blue-500"
                    checked={userData.notification_preferences.sms}
                    onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                  />
                  <span className="ml-2 text-sm">SMS notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-blue-500"
                    checked={userData.notification_preferences.push}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  />
                  <span className="ml-2 text-sm">Push notifications</span>
                </label>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <h3 className="text-lg font-medium mb-4">Account Status</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded text-blue-500"
                  checked={userData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                />
                <span className="ml-2 text-sm">Account is active</span>
              </label>
              <p className="text-sm text-gray-500">
                Unchecked accounts cannot log in to the system
              </p>
              
              {user.is_verified !== undefined && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Email Verification:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.is_verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  
                  {!user.is_verified ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">
                        User needs to verify their email address or admin can verify manually
                      </p>
                      <button
                        type="button"
                        onClick={() => handleEmailVerification(true)}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        Manually Verify Email
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">
                        Email has been verified. Admin can unverify if needed.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to unverify this user\'s email? They will need to verify it again.')) {
                            handleEmailVerification(false);
                          }
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                      >
                        Unverify Email
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2">{new Date(user.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2">{new Date(user.updated_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Login:</span>
                <span className="ml-2">
                  {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </span>
              </div>
              {user.unread_notifications !== undefined && (
                <div>
                  <span className="text-gray-500">Unread Notifications:</span>
                  <span className="ml-2">{user.unread_notifications}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;