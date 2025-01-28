import React, { useState } from "react";
import { X } from "lucide-react";









const AddUserModal = ({ isOpen, onClose, onAdd }) => {
    const [userData, setUserData] = useState({
      name: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: '',
      permissions: [],
    });
  
    const availablePermissions = [
      'View Properties',
      'Edit Properties',
      'View Tenants',
      'Edit Tenants',
      'View Reports',
      'Manage Users',
      'Financial Access'
    ];
  
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">Add New User</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <form className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                className="w-full p-2 border rounded"
                value={userData.role}
                onChange={(e) => setUserData({...userData, role: e.target.value})}
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="property_manager">Property Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={userData.password}
                  onChange={(e) => setUserData({...userData, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={userData.confirmPassword}
                  onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <div className="border rounded p-3 max-h-40 overflow-y-auto">
                {availablePermissions.map(permission => (
                  <label key={permission} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      className="rounded text-blue-500"
                      checked={userData.permissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setUserData({
                            ...userData,
                            permissions: [...userData.permissions, permission]
                          });
                        } else {
                          setUserData({
                            ...userData,
                            permissions: userData.permissions.filter(p => p !== permission)
                          });
                        }
                      }}
                    />
                    <span className="ml-2 text-sm">{permission}</span>
                  </label>
                ))}
              </div>
            </div>
  
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default AddUserModal