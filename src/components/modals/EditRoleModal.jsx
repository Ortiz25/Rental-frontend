import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const EditRoleModal = ({ isOpen, onClose, role, onSubmit }) => {
  const [roleData, setRoleData] = useState({
    name: role?.name || "",
    description: role?.description || "",
    permissions: role?.permissions || [],
    isDefault: role?.isDefault || false,
  });

  const permissionGroups = {
    "Property Management": [
      "view_properties",
      "create_properties",
      "edit_properties",
      "delete_properties",
      "manage_maintenance",
    ],
    "Tenant Management": [
      "view_tenants",
      "create_tenants",
      "edit_tenants",
      "delete_tenants",
      "manage_leases",
    ],
    "Financial Management": [
      "view_finances",
      "process_payments",
      "manage_invoices",
      "view_reports",
      "manage_expenses",
    ],
    "System Administration": [
      "manage_users",
      "manage_roles",
      "view_audit_logs",
      "manage_settings",
      "manage_backups",
    ],
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...roleData, id: role.id });
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Edit Role: {role?.name}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Role Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Role Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={roleData.name}
                onChange={(e) =>
                  setRoleData({ ...roleData, name: e.target.value })
                }
                disabled={role.isDefault}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={roleData.description}
                onChange={(e) =>
                  setRoleData({ ...roleData, description: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Permissions Section */}
          <div>
            <h3 className="text-sm font-medium mb-4">Role Permissions</h3>
            <div className="space-y-6">
              {Object.entries(permissionGroups).map(([group, permissions]) => (
                <div key={group} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{group}</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded text-blue-500"
                        checked={permissions.every((p) =>
                          roleData.permissions.includes(p)
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRoleData({
                              ...roleData,
                              permissions: [
                                ...new Set([
                                  ...roleData.permissions,
                                  ...permissions,
                                ]),
                              ],
                            });
                          } else {
                            setRoleData({
                              ...roleData,
                              permissions: roleData.permissions.filter(
                                (p) => !permissions.includes(p)
                              ),
                            });
                          }
                        }}
                      />
                      <span className="ml-2 text-sm">Select All</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-blue-500"
                          checked={roleData.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleData({
                                ...roleData,
                                permissions: [
                                  ...roleData.permissions,
                                  permission,
                                ],
                              });
                            } else {
                              setRoleData({
                                ...roleData,
                                permissions: roleData.permissions.filter(
                                  (p) => p !== permission
                                ),
                              });
                            }
                          }}
                        />
                        <span className="ml-2 text-sm">
                          {permission
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning for Default Role */}
          {role.isDefault && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-700">
                  This is a default system role. Some settings cannot be
                  modified.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
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
              disabled={role.isDefault && ["admin", "user"].includes(role.name)}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;
