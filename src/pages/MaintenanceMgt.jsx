import Navbar from '../layout/navbar.jsx';
import React, { useState, useEffect } from 'react';
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
  ArrowUpRight,
  X,
  Camera,
  Paperclip,
  Clock,
  Settings
} from 'lucide-react';
import { redirect } from 'react-router';

// API service functions
const maintenanceAPI = {
  // Fixed Base API URL - removed trailing slash and changed to HTTP
  baseURL: "http://localhost:5020/api",

  // Helper method to get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // Helper method to handle API responses
  handleResponse: async (response) => {
    const contentType = response.headers.get('content-type');
    
    // Check if response is JSON
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server returned ${response.status}: ${response.statusText}. Response: ${text.substring(0, 200)}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  },

  // Get all maintenance requests
  getRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      // Fixed URL construction - no double slashes
      const url = `${maintenanceAPI.baseURL}/maintenance${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Fetching maintenance requests from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: maintenanceAPI.getAuthHeaders()
      });
      
      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      throw error;
    }
  },

  // Get single request
  getRequest: async (id) => {
    try {
      const response = await fetch(`${maintenanceAPI.baseURL}/maintenance/${id}`, {
        method: 'GET',
        headers: maintenanceAPI.getAuthHeaders()
      });
      
      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error('Error fetching maintenance request:', error);
      throw error;
    }
  },

  // Create new request
  createRequest: async (requestData) => {
    try {
      const response = await fetch(`${maintenanceAPI.baseURL}/maintenance`, {
        method: 'POST',
        headers: maintenanceAPI.getAuthHeaders(),
        body: JSON.stringify(requestData)
      });
      
      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      throw error;
    }
  },

  // Update request
  updateRequest: async (id, updateData) => {
    try {
      const response = await fetch(`${maintenanceAPI.baseURL}/maintenance/${id}`, {
        method: 'PUT',
        headers: maintenanceAPI.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      
      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      throw error;
    }
  },

  // Add update/comment
  addUpdate: async (id, updateData) => {
    try {
      const response = await fetch(`${maintenanceAPI.baseURL}/maintenance/${id}/updates`, {
        method: 'POST',
        headers: maintenanceAPI.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      
      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error('Error adding update:', error);
      throw error;
    }
  },

  // Get available units
  getAvailableUnits: async () => {
    try {
      const response = await fetch(`${maintenanceAPI.baseURL}/maintenance/units/available`, {
        method: 'GET',
        headers: maintenanceAPI.getAuthHeaders()
      });
      
      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error('Error fetching units:', error);
      throw error;
    }
  },

  // Get metadata options
  getMetadata: async () => {
    try {
      const response = await fetch(`${maintenanceAPI.baseURL}/maintenance/metadata/options`, {
        method: 'GET',
        headers: maintenanceAPI.getAuthHeaders()
      });
      
      return await maintenanceAPI.handleResponse(response);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  },

  // Test API connection
  testConnection: async () => {
    try {
      const response = await fetch(`${maintenanceAPI.baseURL}/health`, {
        method: 'GET',
        headers: maintenanceAPI.getAuthHeaders()
      });
      
      if (response.ok) {
        return { status: 'connected' };
      } else {
        throw new Error(`API not responding: ${response.status}`);
      }
    } catch (error) {
      console.error('API connection test failed:', error);
      throw error;
    }
  }
};


const NewRequestModal = ({ isOpen, onClose, onRequestCreated, availableUnits, metadata, userRole }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    unitId: '',
    tenantId: '', // Admin can select tenant
    tenantNotes: '',
    managementNotes: '',
    estimatedCost: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitTenants, setUnitTenants] = useState([]);

  // Load tenants for selected unit (for admin users)
  const loadTenantsForUnit = async (unitId) => {
    if (!unitId || userRole === 'Tenant') return;
    
    try {
      const response = await fetch(`http://localhost:5020/api/maintenance/units/${unitId}/tenants`);
      if (response.ok) {
        const data = await response.json();
        setUnitTenants(data.data || []);
      }
    } catch (error) {
      console.error('Error loading tenants for unit:', error);
      setUnitTenants([]);
    }
  };

  const handleUnitChange = (unitId) => {
    setFormData({...formData, unitId, tenantId: ''});
    const unit = availableUnits.find(u => u.id == unitId);
    setSelectedUnit(unit);
    loadTenantsForUnit(unitId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Clean the form data - remove empty strings and convert to proper types
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        category: formData.category,
        unitId: parseInt(formData.unitId),
        ...(formData.tenantId && formData.tenantId !== '' && { tenantId: parseInt(formData.tenantId) }),
        ...(formData.tenantNotes && formData.tenantNotes.trim() !== '' && { tenantNotes: formData.tenantNotes.trim() }),
        ...(formData.managementNotes && formData.managementNotes.trim() !== '' && { managementNotes: formData.managementNotes.trim() }),
        ...(formData.estimatedCost && formData.estimatedCost !== '' && { estimatedCost: parseFloat(formData.estimatedCost) })
      };

      console.log('Sending request data:', requestData);
      
      const result = await maintenanceAPI.createRequest(requestData);
      onRequestCreated(result.data);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        unitId: '',
        tenantId: '',
        tenantNotes: '',
        managementNotes: '',
        estimatedCost: ''
      });
      setSelectedUnit(null);
      setUnitTenants([]);
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create maintenance request: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = ['Super Admin', 'Admin', 'Manager', 'Staff'].includes(userRole);

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
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
                onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                {availableUnits.map(unit => (
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
                  onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                >
                  <option value="">Select Tenant (Optional)</option>
                  {unitTenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} - {tenant.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank if creating for property maintenance (no specific tenant)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {metadata.categories?.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                {metadata.priorities?.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                  placeholder="Enter estimated cost (optional)"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          {/* Show different note fields based on user role */}
          {userRole === 'Tenant' ? (
            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={2}
                value={formData.tenantNotes}
                onChange={(e) => setFormData({...formData, tenantNotes: e.target.value})}
                placeholder="Any additional information..."
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tenant Notes</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={2}
                  value={formData.tenantNotes}
                  onChange={(e) => setFormData({...formData, tenantNotes: e.target.value})}
                  placeholder="Notes from/for tenant..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Management Notes</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={2}
                  value={formData.managementNotes}
                  onChange={(e) => setFormData({...formData, managementNotes: e.target.value})}
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
              {isSubmitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusUpdateModal = ({ request, isOpen, onClose, onUpdate }) => {
  const [updateData, setUpdateData] = useState({
    status: request?.status || '',
    assignedTo: request?.assignedTo || '',
    notes: '',
    estimatedCost: request?.estimatedCost || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = ['open', 'in_progress', 'completed', 'cancelled'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await maintenanceAPI.updateRequest(request.id, {
        status: updateData.status,
        assignedTo: updateData.assignedTo,
        estimatedCost: updateData.estimatedCost
      });

      if (updateData.notes) {
        await maintenanceAPI.addUpdate(request.id, {
          updateContent: updateData.notes,
          updateType: 'update'
        });
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update maintenance request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
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
              onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Assigned To</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={updateData.assignedTo}
              onChange={(e) => setUpdateData({...updateData, assignedTo: e.target.value})}
              placeholder="Name of assignee"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estimated Cost ($)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={updateData.estimatedCost}
              onChange={(e) => setUpdateData({...updateData, estimatedCost: e.target.value})}
              placeholder="Enter estimated cost"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Update Notes</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              value={updateData.notes}
              onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
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
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RequestDetailsModal = ({ request, isOpen, onClose, getStatusColor, getPriorityColor, onUpdate }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);

  const addUpdate = async () => {
    if (!newUpdate.trim()) return;
    setIsAddingUpdate(true);

    try {
      await maintenanceAPI.addUpdate(request.id, {
        updateContent: newUpdate,
        updateType: 'update'
      });

      setNewUpdate('');
      onUpdate(); // Refresh the request data
    } catch (error) {
      console.error('Error adding update:', error);
      alert('Failed to add update');
    } finally {
      setIsAddingUpdate(false);
    }
  };

  if (!request) return null;

  // Helper function to safely get property name
  const getPropertyName = (property) => {
    if (typeof property === 'string') return property;
    if (typeof property === 'object' && property?.name) return property.name;
    return 'Unknown Property';
  };

  // Helper function to safely get unit number
  const getUnitNumber = (unit) => {
    if (typeof unit === 'string') return unit;
    if (typeof unit === 'object' && unit?.number) return unit.number;
    return 'Unknown Unit';
  };

  // Helper function to safely get tenant name
  const getTenantName = (tenant, tenantName) => {
    if (tenantName && typeof tenantName === 'string') return tenantName;
    if (typeof tenant === 'string') return tenant;
    if (typeof tenant === 'object' && tenant?.name) return tenant.name;
    return 'No Tenant Assigned';
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-3/4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Maintenance Request Details</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Request Information</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Title:</span> {request.title}</p>
                <p><span className="text-gray-600">Property:</span> {getPropertyName(request.property || request.propertyName)}</p>
                <p><span className="text-gray-600">Unit:</span> {getUnitNumber(request.unit || request.unitNumber)}</p>
                <p><span className="text-gray-600">Tenant:</span> {getTenantName(request.tenant, request.tenantName)}</p>
                <p><span className="text-gray-600">Category:</span> {request.category}</p>
                <p><span className="text-gray-600">Submitted:</span> {new Date(request.createdAt || request.requestedDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Status & Assignment</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Priority:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${getPriorityColor(request.priority)}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                </div>
                {request.assignedTo && (
                  <p><span className="text-gray-600">Assigned To:</span> {request.assignedTo}</p>
                )}
                {request.scheduledDate && (
                  <p><span className="text-gray-600">Scheduled:</span> {new Date(request.scheduledDate).toLocaleDateString()}</p>
                )}
                {request.estimatedCost > 0 && (
                  <p><span className="text-gray-600">Estimated Cost:</span> ${request.estimatedCost}</p>
                )}
                {request.actualCost > 0 && (
                  <p><span className="text-gray-600">Actual Cost:</span> ${request.actualCost}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="bg-gray-50 p-4 rounded">{request.description}</p>
          </div>

          {request.tenantNotes && (
            <div>
              <h3 className="font-semibold mb-2">Tenant Notes</h3>
              <p className="bg-blue-50 p-4 rounded">{request.tenantNotes}</p>
            </div>
          )}

          {request.managementNotes && (
            <div>
              <h3 className="font-semibold mb-2">Management Notes</h3>
              <div className="bg-yellow-50 p-4 rounded">
                {request.managementNotes.split('\n').map((line, index) => (
                  <p key={index} className={line.startsWith('[') ? 'font-medium' : ''}>{line}</p>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Updates & Communications</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {request.updates && request.updates.length > 0 ? (
                request.updates.map((update, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{update.author}</span>
                        {update.source && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            update.source === 'communication' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {update.source === 'communication' ? 'Communication' : 'Internal Note'}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-600">
                        {new Date(update.date).toLocaleDateString()} {new Date(update.date).toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{update.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No updates yet</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Add Update</h3>
            <div className="flex space-x-2">
              <textarea
                className="flex-1 p-2 border rounded"
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                placeholder="Enter update details..."
                disabled={isAddingUpdate}
              />
              <button
                onClick={addUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
                disabled={isAddingUpdate || !newUpdate.trim()}
              >
                {isAddingUpdate ? 'Adding...' : 'Add Update'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestCard = ({ 
  request, 
  getPriorityColor, 
  getStatusColor, 
  onStatusUpdate, 
  setSelectedRequest, 
  setShowDetailsModal, 
  setShowStatusModal 
}) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Helper functions to safely handle data
  const getPropertyName = (property, propertyName) => {
    if (propertyName && typeof propertyName === 'string') return propertyName;
    if (typeof property === 'string') return property;
    if (typeof property === 'object' && property?.name) return property.name;
    return 'Unknown Property';
  };

  const getUnitNumber = (unit, unitNumber) => {
    if (unitNumber && typeof unitNumber === 'string') return unitNumber;
    if (typeof unit === 'string') return unit;
    if (typeof unit === 'object' && unit?.number) return unit.number;
    return 'N/A';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">{request.title}</h3>
          <p className="text-gray-600">{getPropertyName(request.property, request.propertyName)}</p>
          {getUnitNumber(request.unit, request.unitNumber) !== 'N/A' && (
            <p className="text-sm text-gray-500">Unit {getUnitNumber(request.unit, request.unitNumber)}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(request.priority)}`}>
            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
            {request.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Category</p>
          <p className="font-semibold">{request.category}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Submitted</p>
          <p className="font-semibold">{new Date(request.createdAt || request.requestedDate).toLocaleDateString()}</p>
        </div>
        {request.assignedTo && (
          <div>
            <p className="text-sm text-gray-600">Assigned To</p>
            <p className="font-semibold">{request.assignedTo}</p>
          </div>
        )}
        {request.estimatedCost > 0 && (
          <div>
            <p className="text-sm text-gray-600">Estimated Cost</p>
            <p className="font-semibold">${request.estimatedCost}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between border-t pt-4">
        <button 
          onClick={() => {
            setSelectedRequest(request);
            setShowDetailsModal(true);
          }}
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          View Details
          {request.updates && request.updates.length > 0 && (
            <span className="ml-1 bg-blue-100 text-blue-800 px-2 rounded-full">
              {request.updates.length}
            </span>
          )}
        </button>
        {request.status !== 'completed' && request.status !== 'cancelled' && (
          <button 
            onClick={() => {
              setSelectedRequest(request);
              setShowUpdateModal(true);
            }}
            className="text-green-600 hover:underline text-sm flex items-center"
          >
            <Settings className="w-4 h-4 mr-1" />
            Update Status
          </button>
        )}
      </div>

      <StatusUpdateModal 
        request={request}
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={onStatusUpdate}
      />
    </div>
  );
};

const MaintenanceManagement = () => {
  const [activeModule, setActiveModule] = useState('Maintenance');
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [metadata, setMetadata] = useState({ categories: [], priorities: [], statuses: [] });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter states
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter requests when filter or search changes
  useEffect(() => {
    filterRequests();
  }, [requests, filter, searchQuery]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [requestsResult, unitsResult, metadataResult] = await Promise.all([
        maintenanceAPI.getRequests(),
        maintenanceAPI.getAvailableUnits(),
        maintenanceAPI.getMetadata()
      ]);

      setRequests(requestsResult.data.requests);
      setStats(requestsResult.data.stats);
      setAvailableUnits(unitsResult.data.units);
      setMetadata(metadataResult.data);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(request => {
        if (filter === 'pending') return request.status === 'open';
        if (filter === 'in-progress') return request.status === 'in_progress';
        if (filter === 'completed') return request.status === 'completed';
        return true;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query) ||
        request.property.toLowerCase().includes(query) ||
        request.tenantName?.toLowerCase().includes(query) ||
        request.category.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'on_hold': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-500 bg-red-100',
      'emergency': 'text-red-700 bg-red-200',
      'medium': 'text-yellow-500 bg-yellow-100',
      'low': 'text-green-500 bg-green-100'
    };
    return colors[priority] || 'text-gray-500 bg-gray-100';
  };

  const handleRequestCreated = (newRequest) => {
    setRequests(prevRequests => [newRequest, ...prevRequests]);
    loadInitialData(); // Refresh to get updated stats
  };

  const handleRequestUpdate = async () => {
    // Refresh the requests list
    await loadInitialData();
    
    // If we have a selected request, refresh its details
    if (selectedRequest) {
      try {
        const updatedRequest = await maintenanceAPI.getRequest(selectedRequest.id);
        setSelectedRequest(updatedRequest.data);
      } catch (error) {
        console.error('Error refreshing request details:', error);
      }
    }
  };

  if (loading) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading maintenance requests...</div>
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
                <p className="text-gray-600 text-sm sm:text-base">Total Requests</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stats.totalRequests || 0}</p>
              </div>
              <WrenchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base">In Progress</p>
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
                <p className="text-gray-600 text-sm sm:text-base">High Priority</p>
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
              onClick={() => {/* Add advanced filter modal if needed */}}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <WrenchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Get started by creating your first maintenance request.'
              }
            </p>
            {(!searchQuery && filter === 'all') && (
              <button
                onClick={() => setShowNewRequestModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create Request
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request}
                onStatusUpdate={handleRequestUpdate}
                getPriorityColor={getPriorityColor} 
                getStatusColor={getStatusColor} 
                setSelectedRequest={setSelectedRequest}
                setShowDetailsModal={setShowDetailsModal}
                setShowStatusModal={() => {}} // This is handled within RequestCard now
              />
            ))}
          </div>
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
    const response = await fetch("http://localhost:5020/api/auth/verifyToken", {
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
    const allowedRoles = ["Super Admin", "Admin", "Manager", "Staff"];
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