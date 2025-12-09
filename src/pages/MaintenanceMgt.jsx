import Navbar from "../layout/navbar.jsx";
import React, { useState, useEffect } from "react";
import {
  WrenchIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Calendar,
  Users,
  User,
  ArrowUpRight,
  X,
  Camera,
  Paperclip,
  Clock,
  Settings,
  Loader,
} from "lucide-react";
import RequestCard from "../components/requestCard.jsx";
import { redirect } from "react-router";
import { formatCurrency } from "../utils/helperFunctions.jsx";

// API service functions
const maintenanceAPI = {
  // Fixed Base API URL - removed trailing slash and changed to HTTP
  baseURL: "/backend",

  // Helper method to get auth headers
  getAuthHeaders: () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },

  // Helper method to handle API responses
  handleResponse: async (response) => {
    const contentType = response.headers.get("content-type");

    // Check if response is JSON
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error(
        `Server returned ${response.status}: ${
          response.statusText
        }. Response: ${text.substring(0, 200)}`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return data;
  },

  // Get all maintenance requests
  getRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      // Fixed URL construction - no double slashes
      const url = `${maintenanceAPI.baseURL}/maintenance${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      console.log("Fetching maintenance requests from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: maintenanceAPI.getAuthHeaders(),
      });

      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      throw error;
    }
  },

  // Get single request
  getRequest: async (id) => {
    try {
      const response = await fetch(
        `${maintenanceAPI.baseURL}/maintenance/${id}`,
        {
          method: "GET",
          headers: maintenanceAPI.getAuthHeaders(),
        }
      );

      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error("Error fetching maintenance request:", error);
      throw error;
    }
  },

  // Create new request
  createRequest: async (requestData) => {
    try {
      console.log("Sending request to API:", requestData);

      const response = await fetch(`${maintenanceAPI.baseURL}/maintenance`, {
        method: "POST",
        headers: maintenanceAPI.getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      console.log("API Response status:", response.status);

      // Get response data
      const data = await maintenanceAPI.handleResponse(response);

      console.log("Parsed response data:", data);

      return data;
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      throw error;
    }
  },

  // Update request
  updateRequest: async (id, updateData) => {
    try {
      const response = await fetch(
        `${maintenanceAPI.baseURL}/maintenance/${id}`,
        {
          method: "PUT",
          headers: maintenanceAPI.getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );

      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      throw error;
    }
  },

  // Add update/comment
  addUpdate: async (id, updateData) => {
    try {
      console.log("📤 Sending update data:", updateData);

      const response = await fetch(
        `${maintenanceAPI.baseURL}/maintenance/${id}/updates`,
        {
          method: "POST",
          headers: maintenanceAPI.getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );

      console.log("📥 Update response status:", response.status);

      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error("❌ Error adding update:", error);
      throw error;
    }
  },

  // Get available units
  getAvailableUnits: async () => {
    try {
      const response = await fetch(
        `${maintenanceAPI.baseURL}/maintenance/units/available`,
        {
          method: "GET",
          headers: maintenanceAPI.getAuthHeaders(),
        }
      );

      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error("Error fetching units:", error);
      throw error;
    }
  },

  // Get metadata options
  getMetadata: async () => {
    try {
      const response = await fetch(
        `${maintenanceAPI.baseURL}/maintenance/metadata/options`,
        {
          method: "GET",
          headers: maintenanceAPI.getAuthHeaders(),
        }
      );

      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      throw error;
    }
  },

  // Test API connection
  testConnection: async () => {
    try {
      const response = await fetch(`${maintenanceAPI.baseURL}/health`, {
        method: "GET",
        headers: maintenanceAPI.getAuthHeaders(),
      });

      if (response.ok) {
        return { status: "connected" };
      } else {
        throw new Error(`API not responding: ${response.status}`);
      }
    } catch (error) {
      console.error("API connection test failed:", error);
      throw error;
    }
  },
};

const NewRequestModal = ({
  isOpen,
  onClose,
  onRequestCreated,
  availableUnits,
  metadata,
  userRole,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    unitId: "",
    tenantId: "",
    tenantNotes: "",
    managementNotes: "",
    estimatedCost: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitTenants, setUnitTenants] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // Load tenants for selected unit (for admin users)
  const loadTenantsForUnit = async (unitId) => {
    if (!unitId || userRole === "Tenant") return;

    try {
      const response = await fetch(
        `/backend/maintenance/units/${unitId}/tenants`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setUnitTenants(data.data || []);
      }
    } catch (error) {
      console.error("Error loading tenants for unit:", error);
      setUnitTenants([]);
    }
  };

  const handleUnitChange = (unitId) => {
    setFormData({ ...formData, unitId, tenantId: "" });
    const unit = availableUnits.find((u) => u.id == unitId);
    setSelectedUnit(unit);
    loadTenantsForUnit(unitId);
  };

  // Handle photo selection
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);

    // Limit to 10 photos
    if (files.length + selectedPhotos.length > 10) {
      alert("Maximum 10 photos allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a valid image type`);
        return false;
      }

      if (file.size > maxSize) {
        alert(`${file.name} exceeds 5MB size limit`);
        return false;
      }

      return true;
    });

    setSelectedPhotos([...selectedPhotos, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove photo
  const removePhoto = (index) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (
        !formData.title ||
        !formData.description ||
        !formData.category ||
        !formData.unitId
      ) {
        alert("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Prepare request data
      const requestData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        unitId: parseInt(formData.unitId),
        tenantNotes: formData.tenantNotes || "",
        managementNotes: formData.managementNotes || "",
        estimatedCost: formData.estimatedCost
          ? parseFloat(formData.estimatedCost)
          : null,
      };

      // ONLY add tenant ID if explicitly selected (not empty string)
      if (formData.tenantId && formData.tenantId !== "") {
        requestData.tenantId = parseInt(formData.tenantId);
        console.log(
          "✅ Using explicitly selected tenant:",
          requestData.tenantId
        );
      }
      // If tenant was not explicitly selected but we have auto-detected tenants, send the primary one
      else if (unitTenants.length > 0 && unitTenants[0]?.id) {
        // Auto-select the first (primary) tenant if available
        requestData.tenantId = parseInt(unitTenants[0].id);
        console.log(
          "✅ Auto-selecting primary tenant:",
          unitTenants[0].id,
          unitTenants[0].name
        );
      } else {
        console.log(
          "ℹ️ No tenant selected or available - backend will handle auto-detection"
        );
      }

      // ONLY add lease ID if available from selected unit
      if (selectedUnit?.currentLeaseId) {
        requestData.leaseId = parseInt(selectedUnit.currentLeaseId);
        console.log(
          "✅ Using lease ID from selected unit:",
          requestData.leaseId
        );
      }
      // If no lease from unit but we have tenants with lease info, try to get lease from first tenant
      else if (unitTenants.length > 0 && unitTenants[0]?.leaseId) {
        requestData.leaseId = parseInt(unitTenants[0].leaseId);
        console.log(
          "✅ Using lease ID from tenant data:",
          unitTenants[0].leaseId
        );
      }

      console.log("📤 Creating maintenance request with data:", requestData);

      // First create the maintenance request
      const requestResponse = await maintenanceAPI.createRequest(requestData);

      console.log("📥 Server response:", requestResponse);

      // Check for valid response
      if (!requestResponse || !requestResponse.data) {
        throw new Error("Invalid response from server");
      }

      // Extract the maintenance request ID
      const newRequestId =
        requestResponse.data.id ||
        requestResponse.data.requestId ||
        requestResponse.data.request?.id;

      if (!newRequestId) {
        console.error("❌ Response structure:", requestResponse);
        throw new Error("Server did not return a maintenance request ID");
      }

      console.log("✅ Maintenance request created with ID:", newRequestId);

      // Then upload photos if any
      if (selectedPhotos.length > 0) {
        console.log(`📸 Uploading ${selectedPhotos.length} photos...`);

        try {
          const photoFormData = new FormData();
          selectedPhotos.forEach((photo) => {
            photoFormData.append("photos", photo);
          });
          photoFormData.append("is_before_photo", "true");
          photoFormData.append("description", "Initial request photos");

          const token =
            localStorage.getItem("token") || sessionStorage.getItem("token");

          const photoResponse = await fetch(
            `/backend/maintenance/${newRequestId}/photos`,
            {
              method: "POST",
              headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
              },
              body: photoFormData,
            }
          );

          if (!photoResponse.ok) {
            console.error("⚠️ Photo upload failed but request was created");
            alert(
              "Request created successfully, but some photos failed to upload"
            );
          } else {
            const photoData = await photoResponse.json();
            console.log("✅ Photos uploaded successfully:", photoData);
          }
        } catch (photoError) {
          console.error("❌ Photo upload error:", photoError);
          alert(
            "Request created successfully, but photo upload encountered an error"
          );
        }
      }

      // Success notification
      alert("Maintenance request created successfully!");

      // Callback to refresh the list
      if (onRequestCreated) {
        onRequestCreated(requestResponse.data.request || requestResponse.data);
      }

      // Close modal
      onClose();

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        category: "",
        unitId: "",
        tenantId: "",
        tenantNotes: "",
        managementNotes: "",
        estimatedCost: "",
      });
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      setSelectedUnit(null);
      setUnitTenants([]);
    } catch (error) {
      console.error("❌ Error creating request:", error);
      alert(
        error.message ||
          "Failed to create maintenance request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = ["Super Admin", "Admin", "Manager", "Staff"].includes(
    userRole
  );

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-2/3 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">New Maintenance Request</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Unit</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.unitId}
                onChange={(e) => handleUnitChange(e.target.value)}
                required
              >
                <option value="">Select Unit</option>
                {availableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Tenant selection - only show for admin users and when unit is selected */}
            {isAdmin && formData.unitId && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tenant {unitTenants.length === 0 && "(No current tenant)"}
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.tenantId}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantId: e.target.value })
                  }
                >
                  <option value="">Select Tenant (Optional)</option>
                  {unitTenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} - {tenant.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank if creating for property maintenance (no specific
                  tenant)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Select Category</option>
                {metadata.categories?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                {metadata.priorities?.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded"
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedCost: e.target.value })
                  }
                  placeholder="Enter estimated cost (optional)"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Optional - Max 10, 5MB each)
            </label>

            <div className="space-y-3">
              {/* File Input */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WEBP (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={selectedPhotos.length >= 10}
                  />
                </label>
              </div>

              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Show different note fields based on user role */}
          {userRole === "Tenant" ? (
            <div>
              <label className="block text-sm font-medium mb-2">
                Additional Notes
              </label>
              <textarea
                className="w-full p-2 border rounded"
                rows={2}
                value={formData.tenantNotes}
                onChange={(e) =>
                  setFormData({ ...formData, tenantNotes: e.target.value })
                }
                placeholder="Any additional information..."
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tenant Notes
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={2}
                  value={formData.tenantNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantNotes: e.target.value })
                  }
                  placeholder="Notes from/for tenant..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Management Notes
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={2}
                  value={formData.managementNotes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      managementNotes: e.target.value,
                    })
                  }
                  placeholder="Internal management notes..."
                />
              </div>
            </div>
          )}

          <div className="border-t pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const StatusUpdateModal = ({ request, isOpen, onClose, onUpdate }) => {
  const [updateData, setUpdateData] = useState({
    status: request?.status || "",
    assignedTo: request?.assignedTo || "",
    notes: "",
    estimatedCost: request?.estimatedCost || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = ["open", "in_progress", "completed", "cancelled"];
  console.log(request);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await maintenanceAPI.updateRequest(request.id, {
        status: updateData.status,
        assignedTo: updateData.assignedTo,
        estimatedCost: updateData.estimatedCost,
      });

      if (updateData.notes) {
        await maintenanceAPI.addUpdate(request.id, {
          updateText: updateData.notes,
          updateType: "status_change",
          isInternal: false,
        });
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update maintenance request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Update Status</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              className="w-full p-2 border rounded"
              value={updateData.status}
              onChange={(e) =>
                setUpdateData({ ...updateData, status: e.target.value })
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Assigned To
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={updateData.assignedTo}
              onChange={(e) =>
                setUpdateData({ ...updateData, assignedTo: e.target.value })
              }
              placeholder="Name of assignee"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Estimated Cost (kes)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={updateData.estimatedCost}
              onChange={(e) =>
                setUpdateData({ ...updateData, estimatedCost: e.target.value })
              }
              placeholder="Enter estimated cost"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Update Notes
            </label>
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              value={updateData.notes}
              onChange={(e) =>
                setUpdateData({ ...updateData, notes: e.target.value })
              }
              placeholder="Add any relevant notes..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RequestDetailsModal = ({
  request,
  isOpen,
  onClose,
  onUpdate,
  getStatusColor,
  getPriorityColor,
  setSelectedRequest,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newUpdate, setNewUpdate] = useState("");
  const [updateType, setUpdateType] = useState("general");
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  console.log(request);

  // Handle additional photo uploads
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a valid image type`);
        return false;
      }

      if (file.size > maxSize) {
        alert(`${file.name} exceeds 5MB size limit`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingPhotos(true);

    try {
      const photoFormData = new FormData();
      validFiles.forEach((photo) => {
        photoFormData.append("photos", photo);
      });
      photoFormData.append("is_before_photo", "false");
      photoFormData.append("description", "Additional photos");

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(
        `/backend/maintenance/${request.id}/photos`,
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: photoFormData,
        }
      );

      if (response.ok) {
        alert(`${validFiles.length} photo(s) uploaded successfully!`);
        onUpdate(); // Refresh the request data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload photos");
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      alert(error.message || "Failed to upload photos");
    } finally {
      setUploadingPhotos(false);
    }
  };

  // Handle photo navigation in lightbox
  const handlePreviousPhoto = (e) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) =>
      prev > 0 ? prev - 1 : request.photos.length - 1
    );
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) =>
      prev < request.photos.length - 1 ? prev + 1 : 0
    );
  };

  // Handle add update
  const handleAddUpdate = async (e) => {
    e.preventDefault();

    // Validate that newUpdate is not empty
    if (!newUpdate || !newUpdate.trim()) {
      alert("Please enter an update message");
      return;
    }

    setIsAddingUpdate(true);

    try {
      console.log("📝 Adding update:", newUpdate);
      console.log("Request ID:", request.id);

      // Prepare update data - match backend expected format
      const updateData = {
        updateText: newUpdate.trim(),
        updateType: updateType || "general",
        isInternal: isInternalUpdate || false,
      };

      console.log("📤 Sending update data:", updateData);

      await maintenanceAPI.addUpdate(request.id, updateData);

      console.log("✅ Update added successfully");

      // Refresh the request details to show the new update
      const updatedRequest = await maintenanceAPI.getRequest(request.id);
      setSelectedRequest(updatedRequest.data);

      // Clear the form
      setNewUpdate("");
      setUpdateType("general");
      setIsInternalUpdate(false);

      alert("Update added successfully!");
    } catch (error) {
      console.error("❌ Error adding update:", error);
      alert(`Failed to add update: ${error.message}`);
    } finally {
      setIsAddingUpdate(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {request.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Request #{request.id} • {request.property?.name || request.property} - Unit {request.unit?.number || request.unit}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6 bg-white flex-shrink-0">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "photos"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Photos ({request.photos?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("updates")}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "updates"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Updates ({request.updates?.length || 0})
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Priority
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(
                        request.priority
                      )}`}
                    >
                      {request.priority.replace(/\b\w/g, (l) =>
                        l.toUpperCase()
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Category
                  </label>
                  <div className="mt-1">
                    <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {request.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Description
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
              </div>
              {/* Property & Unit Info */}
              {/* Property & Unit Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Property
                  </label>
                  <div className="mt-1">
                    <p className="text-gray-800 font-medium">
                      {(() => {
                        const prop = request.property;
                        if (!prop) return "N/A";
                        if (typeof prop === "string") return prop;
                        if (typeof prop === "object")
                          return prop.name || prop.property_name || "Unknown";
                        return String(prop);
                      })()}
                    </p>
                    {(() => {
                      const prop = request.property;
                      const address =
                        prop && typeof prop === "object"
                          ? prop.address
                          : request.property_address;
                      return address ? (
                        <p className="text-sm text-gray-500 mt-1">{address}</p>
                      ) : null;
                    })()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Unit
                  </label>
                  <p className="mt-1 text-gray-800 font-medium">
                    {(() => {
                      const unit = request.unit;
                      if (!unit) return "N/A";
                      if (typeof unit === "string") return unit;
                      if (typeof unit === "object")
                        return (
                          unit.number ||
                          unit.name ||
                          unit.unit_number ||
                          "Unknown"
                        );
                      return String(unit);
                    })()}
                  </p>
                </div>
              </div>
              {/* Tenant Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Tenant
                  </label>
                  <p className="mt-1 text-gray-800">{request.tenantName}</p>
                </div>
                {request.tenantContact && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Contact
                    </label>
                    <p className="mt-1 text-gray-800">
                      {request.tenantContact}
                    </p>
                  </div>
                )}
              </div>

              {/* Assignment Info */}
              {(request.assignedTo || request.assignedToName) && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Assigned To
                  </label>
                  <p className="mt-1 text-gray-800">
                    {request.assignedToName || request.assignedTo || 'Unassigned'}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Date Submitted
                  </label>
                  <p className="mt-1 text-gray-800">{request.dateSubmitted}</p>
                </div>
                {request.scheduledDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Scheduled Date
                    </label>
                    <p className="mt-1 text-gray-800">
                      {request.scheduledDate}
                    </p>
                  </div>
                )}
                {request.completedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Completed Date
                    </label>
                    <p className="mt-1 text-gray-800">
                      {request.completedDate}
                    </p>
                  </div>
                )}
              </div>

              {/* Costs */}
              {(request.estimatedCost > 0 || request.actualCost > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {request.estimatedCost > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Estimated Cost
                      </label>
                      <p className="mt-1 text-gray-800 text-lg font-semibold">
                        {formatCurrency(request.estimatedCost)}
                      </p>
                    </div>
                  )}
                  {request.actualCost > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Actual Cost
                      </label>
                      <p className="mt-1 text-gray-800 text-lg font-semibold">
                        {formatCurrency(request.actualCost)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Lease Info */}
              {request.leaseNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Lease Number
                  </label>
                  <p className="mt-1 text-gray-800">{request.leaseNumber}</p>
                </div>
              )}

              {/* Notes */}
              {request.tenantNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Tenant Notes
                  </label>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {request.tenantNotes}
                    </p>
                  </div>
                </div>
              )}

              {request.managementNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Management Notes
                  </label>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {request.managementNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Update Status
                </button>
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === "photos" && (
            <div className="space-y-6">
              {/* Upload Section */}
              <div>
                <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center">
                    {uploadingPhotos ? (
                      <>
                        <Loader className="w-8 h-8 mb-2 text-blue-500 animate-spin" />
                        <span className="text-sm text-gray-600 font-medium">
                          Uploading photos...
                        </span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600 font-medium">
                          Click to add more photos
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF, WEBP (MAX. 5MB)
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhotos}
                  />
                </label>
              </div>

              {/* Photo Gallery */}
              {request.photos && request.photos.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {request.photos.length}{" "}
                    {request.photos.length === 1 ? "Photo" : "Photos"}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {request.photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="relative group aspect-square"
                      >
                        <img
                          src={`/backend/maintenance/photos/${photo.id}/file`}
                          alt={photo.fileName}
                          className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                          onClick={() => setSelectedPhotoIndex(index)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-white text-xs truncate font-medium">
                              {photo.fileName}
                            </p>
                            <p className="text-white text-xs opacity-90">
                              {new Date(photo.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {photo.isBeforePhoto && (
                          <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg font-medium">
                            Before
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No photos uploaded yet
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Click the upload area above to add photos
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Updates Tab */}
          {activeTab === "updates" && (
            <div className="space-y-6">
              {/* Add Update Button */}
              <button
                onClick={() => setShowUpdateForm(!showUpdateForm)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {showUpdateForm ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Update
                  </>
                )}
              </button>

              {/* Update Form */}
              {showUpdateForm && (
                <form onSubmit={handleAddUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Update Type
                    </label>
                    <select
                      className="w-full p-2 border rounded"
                      value={updateType}
                      onChange={(e) => setUpdateType(e.target.value)}
                      disabled={isAddingUpdate}
                    >
                      <option value="general">General Update</option>
                      <option value="status_change">Status Change</option>
                      <option value="progress">Progress Update</option>
                      <option value="note">Note</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Update Message *
                    </label>
                    <textarea
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      value={newUpdate}
                      onChange={(e) => setNewUpdate(e.target.value)}
                      placeholder="Enter update details..."
                      disabled={isAddingUpdate}
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="internal-update"
                      checked={isInternalUpdate}
                      onChange={(e) => setIsInternalUpdate(e.target.checked)}
                      disabled={isAddingUpdate}
                      className="mr-2"
                    />
                    <label htmlFor="internal-update" className="text-sm">
                      Internal update (not visible to tenant)
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewUpdate("");
                        setUpdateType("general");
                        setIsInternalUpdate(false);
                      }}
                      className="px-4 py-2 border rounded hover:bg-gray-50"
                      disabled={isAddingUpdate}
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
                      disabled={isAddingUpdate || !newUpdate.trim()}
                    >
                      {isAddingUpdate && (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {isAddingUpdate ? "Adding..." : "Add Update"}
                    </button>
                  </div>
                </form>
              )}

              {/* Updates List */}
              <div className="space-y-3">
                {request.updates && request.updates.length > 0 ? (
                  request.updates.map((update) => (
                    <div
                      key={update.id}
                      className="bg-gray-50 border border-gray-200 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {update.createdByName
                              ? update.createdByName.charAt(0).toUpperCase()
                              : "S"}
                          </div>
                          <p className="font-medium text-gray-900">
                            {update.createdByName || "System"}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(update.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap ml-10">
                        {update.updateText}
                      </p>
                      {update.updateType && (
                        <div className="mt-2 ml-10">
                          <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                            {update.updateType}
                          </span>
                        </div>
                      )}
                      {update.isInternal && (
                        <div className="mt-2 ml-10">
                          <span className="inline-block text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">
                            Internal Note
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">
                      No updates yet
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Be the first to add an update
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhotoIndex !== null && request.photos && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous Button */}
          {request.photos.length > 1 && (
            <button
              onClick={handlePreviousPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 z-10"
            >
              <ArrowUpRight className="w-8 h-8 rotate-180" />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-5xl max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`/backend/maintenance/photos/${request.photos[selectedPhotoIndex].id}/file`}
              alt={request.photos[selectedPhotoIndex].fileName}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>

          {/* Next Button */}
          {request.photos.length > 1 && (
            <button
              onClick={handleNextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 z-10"
            >
              <ArrowUpRight className="w-8 h-8" />
            </button>
          )}

          {/* Photo Info */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center bg-black/50 px-4 py-2 rounded-lg">
            <p className="text-sm font-medium">
              {request.photos[selectedPhotoIndex].fileName}
            </p>
            <p className="text-xs opacity-90">
              {selectedPhotoIndex + 1} / {request.photos.length}
            </p>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <StatusUpdateModal
          request={request}
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onUpdate={() => {
            setShowStatusModal(false);
            onUpdate();
          }}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
};


const MaintenanceManagement = () => {
  const [activeModule, setActiveModule] = useState("Maintenance");
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [metadata, setMetadata] = useState({
    categories: [],
    priorities: [],
    statuses: [],
  });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter states
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter requests when filter or search changes
  useEffect(() => {
    filterRequests();
    setCurrentPage(1); // Reset to first page when filter changes
  }, [requests, filter, searchQuery]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [requestsResult, unitsResult, metadataResult] = await Promise.all([
        maintenanceAPI.getRequests(),
        maintenanceAPI.getAvailableUnits(),
        maintenanceAPI.getMetadata(),
      ]);

      setRequests(requestsResult.data.requests);
      setStats(requestsResult.data.stats);
      setAvailableUnits(unitsResult.data.units);
      setMetadata(metadataResult.data);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load maintenance data");
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((request) => {
        if (filter === "pending") return request.status === "open";
        if (filter === "in-progress") return request.status === "in_progress";
        if (filter === "completed") return request.status === "completed";
        return true;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.title.toLowerCase().includes(query) ||
          request.description.toLowerCase().includes(query) ||
          (request.property?.name || request.property || "").toLowerCase().includes(query) ||
          (request.unit?.number || request.unit || "").toString().toLowerCase().includes(query) ||
          request.tenantName?.toLowerCase().includes(query) ||
          (request.assignedTo || "").toLowerCase().includes(query) ||
          (request.assignedToName || "").toLowerCase().includes(query) ||
          request.category.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      on_hold: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "text-red-500 bg-red-100",
      emergency: "text-red-700 bg-red-200",
      medium: "text-yellow-500 bg-yellow-100",
      low: "text-green-500 bg-green-100",
    };
    return colors[priority] || "text-gray-500 bg-gray-100";
  };

  const handleRequestCreated = (newRequest) => {
    setRequests((prevRequests) => [newRequest, ...prevRequests]);
    loadInitialData(); // Refresh to get updated stats
  };

  const handleRequestUpdate = async () => {
    // Refresh the requests list
    await loadInitialData();

    // If we have a selected request, refresh its details
    if (selectedRequest) {
      try {
        const updatedRequest = await maintenanceAPI.getRequest(
          selectedRequest.id
        );
        setSelectedRequest(updatedRequest.data);
      } catch (error) {
        console.error("Error refreshing request details:", error);
      }
    }
  };

  // Handler to open details modal with fresh data
  const handleOpenDetails = async (request) => {
    try {
      // Fetch fresh data from API
      const freshRequest = await maintenanceAPI.getRequest(request.id);
      setSelectedRequest(freshRequest.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error loading request details:", error);
      // Fallback to cached data if API fails
      setSelectedRequest(request);
      setShowDetailsModal(true);
    }
  };

  if (loading) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-lg text-gray-600">
              Loading maintenance requests....
            </p>
          </div>
        </div>
      </Navbar>
    );
  }

  if (error) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Requests */}
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">
                  Total Requests
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {stats.totalRequests || 0}
                </p>
              </div>
              <WrenchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">
                  In Progress
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1 text-blue-600">
                  {stats.inProgressRequests || 0}
                </p>
              </div>
              <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>

          {/* High Priority */}
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">
                  High Priority
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1 text-red-600">
                  {stats.highPriorityRequests || 0}
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">Completed</p>
                <p className="text-xl sm:text-2xl font-bold mt-1 text-green-600">
                  {stats.completedRequests || 0}
                </p>
              </div>
              <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          {/* Left side - Action Button and Select */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center text-sm sm:text-base transition-colors"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>New Request</span>
            </button>

            <select
              className="border rounded px-2 sm:px-4 py-2 text-sm sm:text-base min-w-[120px] bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Right side - Search and Filter */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                placeholder="Search requests..."
                className="w-full sm:w-[200px] px-4 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors flex-shrink-0"
              aria-label="Filter"
              onClick={() => {
                /* Add advanced filter modal if needed */
              }}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <WrenchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No maintenance requests found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filter !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by creating your first maintenance request."}
            </p>
            {!searchQuery && filter === "all" && (
              <button
                onClick={() => setShowNewRequestModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create Request
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Pagination Controls - Top */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
              <div className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredRequests.length)} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of{" "}
                {filteredRequests.length} requests
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredRequests
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onStatusUpdate={handleRequestUpdate}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                    setSelectedRequest={setSelectedRequest}
                    setShowDetailsModal={setShowDetailsModal}
                    handleOpenDetails={handleOpenDetails}
                    setShowStatusModal={() => {}} // This is handled within RequestCard now
                  />
                ))}
            </div>

            {/* Pagination Controls - Bottom */}
            {filteredRequests.length > itemsPerPage && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {/* Page Numbers */}
                  {Array.from(
                    { length: Math.ceil(filteredRequests.length / itemsPerPage) },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {/* Show ellipsis if there's a gap */}
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? "bg-blue-500 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(filteredRequests.length / itemsPerPage))
                    )
                  }
                  disabled={currentPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === Math.ceil(filteredRequests.length / itemsPerPage)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <NewRequestModal
          isOpen={showNewRequestModal}
          onClose={() => setShowNewRequestModal(false)}
          onRequestCreated={handleRequestCreated}
          availableUnits={availableUnits}
          metadata={metadata}
        />

        {showDetailsModal && selectedRequest && (
          <RequestDetailsModal
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            request={selectedRequest}
            setSelectedRequest={setSelectedRequest}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedRequest(null);
            }}
            onUpdate={handleRequestUpdate}
          />
        )}
      </div>
    </Navbar>
  );
};

export default MaintenanceManagement;

export async function loader() {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/");
  }

  try {
    const response = await fetch("/backend/auth/verifyToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const userData = await response.json();

    if (userData.status !== 200) {
      const keysToRemove = ["token", "user", "name", "userRole", "userId"];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      return redirect("/");
    }

    // Check role permissions
    const allowedRoles = ["Super Admin", "Admin", "Manager", "Staff", "Building Manager", "Caretaker"];
    const userRole = userData.user?.role || localStorage.getItem("userRole");

    if (!userRole || !allowedRoles.includes(userRole)) {
      return redirect("/");
    }

    return {
      user: userData.user,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Auth check error:", error);
    const keysToRemove = ["token", "user", "name", "userRole", "userId"];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    return redirect("/");
  }
}