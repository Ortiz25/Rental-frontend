import React, { useState } from "react";
import { Users, Plus, Edit, Trash2, Shield } from "lucide-react";
import AddRoleModal from "./modals/AddRolesModal";
import EditRoleModal from "./modals/EditRoleModal";

const RolesManagement = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Admin",
      description: "Full system access",
      users: 3,
      permissions: ["all"],
      isDefault: true,
    },
    {
      id: 2,
      name: "Property Manager",
      description: "Manage properties and tenants",
      users: 5,
      permissions: [
        "view_properties",
        "edit_properties",
        "view_tenants",
        "edit_tenants",
      ],
      isDefault: false,
    },
    {
      id: 3,
      name: "Staff",
      description: "Basic system access",
      users: 8,
      permissions: ["view_properties", "view_tenants"],
      isDefault: false,
    },
  ]);

  const [showAddRole, setShowAddRole] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleAddRole = (roleData) => {
    setRoles([...roles, { id: Date.now(), ...roleData }]);
  };

  const handleEditRole = (updatedRoleData) => {
    setRoles(
      roles.map((role) =>
        role.id === updatedRoleData.id ? updatedRoleData : role
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Roles & Permissions</h2>
        <button
          onClick={() => setShowAddRoleModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Role
        </button>
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{role.name}</h3>
                <p className="text-gray-600">{role.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                {role.isDefault && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Default
                  </span>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setShowEditRoleModal(true);
                    }}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {!role.isDefault && (
                    <button className="text-gray-600 hover:text-red-600">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {role.users} Users
              </span>
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                {role.permissions.length} Permissions
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <AddRoleModal
        isOpen={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        onSubmit={handleAddRole}
      />

      {selectedRole && (
        <EditRoleModal
          isOpen={showEditRoleModal}
          onClose={() => {
            setShowEditRoleModal(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
          onSubmit={handleEditRole}
        />
      )}
    </div>
  );
};

export default RolesManagement;
