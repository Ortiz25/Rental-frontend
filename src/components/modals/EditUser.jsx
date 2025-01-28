import React, { useState } from "react";
import { Camera, X } from "lucide-react";







const EditUserModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [userData, setUserData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || '',
      status: user?.status || 'Active',
      permissions: user?.permissions || []
    });
  
    const [changePassword, setChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onUpdate({ ...userData, id: user.id });
      onClose();
    };
  
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">Edit User</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                className="w-full p-2 border rounded"
                value={userData.role}
                onChange={(e) => setUserData({...userData, role: e.target.value})}
              >
                <option value="admin">Admin</option>
                <option value="property_manager">Property Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={userData.status}
                onChange={(e) => setUserData({...userData, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
  
            <div className="border-t pt-4">
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="rounded text-blue-500"
                />
                <span className="ml-2 text-sm">Change Password</span>
              </label>
  
              {changePassword && (
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full p-2 border rounded"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              )}
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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default EditUserModal