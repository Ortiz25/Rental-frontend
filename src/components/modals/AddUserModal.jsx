import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";

const AddUserModal = ({ isOpen, onClose, onSubmit, roles = [] }) => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
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
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Fetch tenants when role is set to Tenant
  useEffect(() => {
    const selectedRole = roles.find(role => role.id === parseInt(userData.role_id));
    if (selectedRole && selectedRole.role_name === 'Tenant') {
      fetchAvailableTenants();
    } else {
      setTenants([]);
      setUserData(prev => ({ ...prev, tenant_id: '' }));
    }
  }, [userData.role_id, roles]);

  const fetchAvailableTenants = async () => {
    try {
      setLoadingTenants(true);
      const response = await fetch('/backend/tenants?has_active_lease=false&has_user_account=false', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setTenants(data.data.tenants|| []);
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
    if (!userData.password) newErrors.password = 'Password is required';
    if (!userData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!userData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!userData.role_id) newErrors.role_id = 'Role is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userData.email && !emailRegex.test(userData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (userData.password && userData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Password confirmation
    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Username validation (no spaces, special characters)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (userData.username && !usernameRegex.test(userData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
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

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submitData = { ...userData };
      delete submitData.confirmPassword; // Remove confirm password field
      
      // Convert role_id to number
      submitData.role_id = parseInt(submitData.role_id);
      
      // Convert tenant_id to number or null
      if (submitData.tenant_id) {
        submitData.tenant_id = parseInt(submitData.tenant_id);
      } else {
        submitData.tenant_id = null;
      }

      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
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

  // Check if form is valid for button state
  const isFormValid = () => {
    return userData.username.trim() && 
           userData.email.trim() && 
           userData.password && 
           userData.confirmPassword &&
           userData.first_name.trim() && 
           userData.last_name.trim() && 
           userData.role_id &&
           userData.password === userData.confirmPassword &&
           userData.password.length >= 8 &&
           Object.keys(errors).length === 0 &&
           (!isTenantRole || userData.tenant_id); // If tenant role, must have tenant selected
  };

  if (!isOpen) return null;

  const selectedRole = roles.find(role => role.id === parseInt(userData.role_id));
  const isTenantRole = selectedRole && selectedRole.role_name === 'Tenant';
  const formIsValid = isFormValid();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Add New User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Tenant Selection (only for Tenant role) */}
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
                    </option>
                  ))}
                </select>
                {errors.tenant_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.tenant_id}</p>
                )}
                {tenants.length === 0 && !loadingTenants && isTenantRole && (
                  <p className="text-yellow-600 text-sm mt-1">
                    No available tenants found. All tenants may already have user accounts or active leases.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Password Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 pr-10 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={userData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 pr-10 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={userData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
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
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded text-blue-500"
                checked={userData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
              />
              <span className="ml-2 text-sm">Account is active</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Unchecked accounts will be created in inactive state and cannot log in
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col space-y-2 pt-4 border-t">
            {/* Form validation feedback */}
            {!formIsValid && !isSubmitting && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Please complete the following:</p>
                <ul className="list-disc list-inside space-y-1">
                  {!userData.username.trim() && <li>Enter a username</li>}
                  {!userData.email.trim() && <li>Enter an email address</li>}
                  {!userData.first_name.trim() && <li>Enter first name</li>}
                  {!userData.last_name.trim() && <li>Enter last name</li>}
                  {!userData.role_id && <li>Select a role</li>}
                  {!userData.password && <li>Enter a password</li>}
                  {userData.password && userData.password.length < 8 && <li>Password must be at least 8 characters</li>}
                  {!userData.confirmPassword && userData.password && <li>Confirm your password</li>}
                  {userData.password && userData.confirmPassword && userData.password !== userData.confirmPassword && <li>Passwords must match</li>}
                  {isTenantRole && !userData.tenant_id && <li>Select a tenant for Tenant role</li>}
                </ul>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formIsValid || isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;