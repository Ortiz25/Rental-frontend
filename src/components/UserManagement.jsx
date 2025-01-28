import React, { useState } from "react";
import { UserPlus, Search } from "lucide-react";
import AddUserModal from "./modals/AddUserModal";
import EditUserModal from "./modals/EditUser";
import femaleImage from "../assets/images/female.jpg"

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
      lastActive: "2024-01-28T10:30:00",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Property Manager",
      status: "Active",
      lastActive: "2024-01-28T09:15:00",
      avatar: "/api/placeholder/40/40",
    },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);

  // Handler for adding new user
  const handleAddUser = (userData) => {
    // Add new user logic
    setUsers([...users, { id: Date.now(), ...userData }]);
  };

  // Handler for editing user
  const handleEditUser = (updatedUserData) => {
    setUsers(
      users.map((user) =>
        user.id === updatedUserData.id ? updatedUserData : user
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" /> Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <select className="border rounded-lg px-4 py-2">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Property Manager</option>
          <option value="staff">Staff</option>
        </select>
        <select className="border rounded-lg px-4 py-2">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      {/* Desktop and Tablet View */}
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
                Last Active
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
                    <img
                      className="h-10 w-10 rounded-full"
                      src={femaleImage}
                      alt=""
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.lastActive).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditUserModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img
                  className="h-10 w-10 rounded-full"
                  src={user.avatar}
                  alt=""
                />
                <div className="ml-3">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {user.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Role</span>
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Last Active</span>
                <span>{new Date(user.lastActive).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowEditUserModal(true);
                }}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                Edit
              </button>
              <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">10</span> of{" "}
          <span className="font-medium">20</span> results
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSubmit={handleAddUser}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={showEditUserModal}
          onClose={() => {
            setShowEditUserModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSubmit={handleEditUser}
        />
      )}
    </div>
  );
};

export default UserManagement;
