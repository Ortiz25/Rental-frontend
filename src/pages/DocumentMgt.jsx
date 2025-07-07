import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  FolderPlus, 
  Search, 
  Upload, 
  Download,
  Trash2,
  Eye,
  Share2,
  Filter,
  Clock,
  File,
  X,
  Plus,
  Tag,
  Edit,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import Navbar from '../layout/navbar.jsx';

// API Configuration
const API_BASE_URL = '/backend/api';

// API helper function
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  if (options.body && !(options.body instanceof FormData)) {
    defaultOptions.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// Document API functions
const documentAPI = {
  // Fetch documents with filters
  getDocuments: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All') {
        queryParams.append(key, value);
      }
    });

    return apiCall(`/documents?${queryParams.toString()}`);
  },

  // Get document categories
  getCategories: async () => {
    return apiCall('/documents/categories');
  },

  // Upload documents
  uploadDocuments: async (files, metadata) => {
    const formData = new FormData();
    
    // Append files
    files.forEach(file => {
      formData.append('files', file);
    });

    // Append metadata
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    return apiCall('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Download document
  downloadDocument: async (documentId) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Check if response is ok
      if (!response.ok) {
        // Try to get error message from JSON response
        let errorMessage = 'Download failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      // Check if response is actually a file (blob)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // This is an error response in JSON format
        const errorData = await response.json();
        throw new Error(errorData.message || 'Download failed');
      }

      // Get the blob
      return response.blob();
      
    } catch (error) {
      console.error('Download error details:', error);
      throw error;
    }
  },

  // View document
  viewDocument: async (documentId) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/view`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('View failed');
    }

    return response.blob();
  },

  // Update document
  updateDocument: async (documentId, updates) => {
    return apiCall(`/documents/${documentId}`, {
      method: 'PUT',
      body: updates,
    });
  },

  // Delete document
  deleteDocument: async (documentId) => {
    return apiCall(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  },

  // Get document statistics
  getStatistics: async () => {
    return apiCall('/documents/stats');
  },
};

// Custom hook for document management
const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const fetchDocuments = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await documentAPI.getDocuments(filters);
      setDocuments(response.data.documents);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await documentAPI.getCategories();
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await documentAPI.getStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const uploadDocuments = async (files, metadata) => {
    setLoading(true);
    setError(null);

    try {
      const response = await documentAPI.uploadDocuments(files, metadata);
      // Refresh documents list after upload
      await fetchDocuments();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (documentId, fileName) => {
    try {
      console.log('🔽 Starting download for document ID:', documentId);
      const blob = await documentAPI.downloadDocument(documentId);
      
      console.log('📦 Blob received, size:', blob.size, 'type:', blob.type);
      
      // Check if blob is valid
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `document_${documentId}`;
      
      // Add link to body, click it, then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ Download completed successfully');
      
    } catch (err) {
      console.error('❌ Download error:', err);
      setError(`Download failed: ${err.message}`);
      
      // Show user-friendly error message
      alert(`Download failed: ${err.message}`);
    }
  };

  const viewDocument = async (documentId, fileName) => {
    try {
      const blob = await documentAPI.viewDocument(documentId);
      
      // Create view link
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Cleanup after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (err) {
      setError(err.message);
      console.error('Error viewing document:', err);
    }
  };

  const updateDocument = async (documentId, updates) => {
    setLoading(true);
    setError(null);

    try {
      await documentAPI.updateDocument(documentId, updates);
      // Refresh documents list after update
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    setLoading(true);
    setError(null);

    try {
      await documentAPI.deleteDocument(documentId);
      // Refresh documents list after deletion
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchDocuments();
    fetchStatistics();
  }, []);

  return {
    documents,
    categories,
    statistics,
    loading,
    error,
    fetchDocuments,
    uploadDocuments,
    downloadDocument,
    viewDocument,
    updateDocument,
    deleteDocument,
  };
};

// Upload Modal Component
const UploadModal = ({ isOpen, onClose, onUpload, categories, loading }) => {
  const [uploadData, setUploadData] = useState({
    name: '',
    category: '',
    tags: '',
    description: '',
    is_important: false,
    is_shared: false,
    expires_at: '',
    association_type: 'property', // property, unit, tenant, lease
    property_id: '1', // Default to first property
    unit_id: '',
    tenant_id: '',
    lease_id: ''
  });
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoadingAssociations, setIsLoadingAssociations] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch association data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAssociationData();
    }
  }, [isOpen]);

  const fetchAssociationData = async () => {
    setIsLoadingAssociations(true);
    
    try {
      // Fetch all association data in parallel
      const [propertiesRes, unitsRes, tenantsRes, leasesRes] = await Promise.allSettled([
        apiCall('/properties'),
        apiCall('/units'),
        apiCall('/tenants'),
        apiCall('/leases')
      ]);

      // Handle properties
      if (propertiesRes.status === 'fulfilled') {
        setProperties(propertiesRes.value.data || []);
      } else {
        console.warn('Failed to fetch properties:', propertiesRes.reason);
        setProperties([
          { id: 1, property_name: 'Default Property' }
        ]);
      }

      // Handle units
      if (unitsRes.status === 'fulfilled') {
        setUnits(unitsRes.value.data || []);
      } else {
        console.warn('Failed to fetch units:', unitsRes.reason);
        setUnits([
          { id: 1, unit_number: 'Main', property_name: 'Default Property' }
        ]);
      }

      // Handle tenants
      if (tenantsRes.status === 'fulfilled') {
        setTenants(tenantsRes.value.data || []);
      } else {
        console.warn('Failed to fetch tenants:', tenantsRes.reason);
        setTenants([
          { id: 1, first_name: 'Default', last_name: 'Tenant', email: 'tenant@example.com' }
        ]);
      }

      // Handle leases
      if (leasesRes.status === 'fulfilled') {
        setLeases(leasesRes.value.data || []);
      } else {
        console.warn('Failed to fetch leases:', leasesRes.reason);
        setLeases([
          { id: 1, lease_number: 'LEASE-001', property_name: 'Default Property', unit_number: 'Main' }
        ]);
      }

    } catch (error) {
      console.error('Error fetching association data:', error);
      
      // Set fallback data on complete failure
      setProperties([{ id: 1, property_name: 'Default Property' }]);
      setUnits([{ id: 1, unit_number: 'Main', property_name: 'Default Property' }]);
      setTenants([{ id: 1, first_name: 'Default', last_name: 'Tenant', email: 'tenant@example.com' }]);
      setLeases([{ id: 1, lease_number: 'LEASE-001', property_name: 'Default Property', unit_number: 'Main' }]);
    } finally {
      setIsLoadingAssociations(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      setSelectedFiles(files);
      if (files.length === 1) {
        setUploadData(prev => ({
          ...prev,
          name: files[0].name
        }));
      }
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelect(files);
  };

  const resetForm = () => {
    setUploadData({
      name: '',
      category: '',
      tags: '',
      description: '',
      is_important: false,
      is_shared: false,
      expires_at: '',
      association_type: 'property',
      property_id: '1', // Default to first property
      unit_id: '',
      tenant_id: '',
      lease_id: ''
    });
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }

    // Validate association
    const associationFields = {
      property: 'property_id',
      unit: 'unit_id', 
      tenant: 'tenant_id',
      lease: 'lease_id'
    };

    const requiredField = associationFields[uploadData.association_type];
    if (!uploadData[requiredField]) {
      alert(`Please select a ${uploadData.association_type}`);
      return;
    }

    try {
      const metadata = {
        document_name: uploadData.name,
        category: uploadData.category,
        tags: uploadData.tags,
        description: uploadData.description,
        is_important: uploadData.is_important,
        is_shared: uploadData.is_shared,
        expires_at: uploadData.expires_at || null,
        // Only include the selected association type
        [requiredField]: uploadData[requiredField]
      };

      await onUpload(selectedFiles, metadata);
      
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Upload Document(s)</h2>
          <button onClick={onClose} disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={uploadData.name}
                onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={uploadData.category}
                onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.filter(cat => cat !== 'All').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={uploadData.tags}
              onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
              placeholder="e.g., important, legal, active"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={uploadData.description}
              onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
              placeholder="Brief description of the document..."
            />
          </div>

          {/* Document Association Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-3">Document Association</h3>
            <p className="text-sm text-gray-600 mb-4">Documents must be associated with a property, unit, tenant, or lease.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Associate with</label>
                <select 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={uploadData.association_type}
                  onChange={(e) => {
                    setUploadData({
                      ...uploadData, 
                      association_type: e.target.value,
                      property_id: '',
                      unit_id: '',
                      tenant_id: '',
                      lease_id: ''
                    });
                  }}
                  required
                >
                  <option value="property">Property</option>
                  <option value="unit">Unit</option>
                  <option value="tenant">Tenant</option>
                  <option value="lease">Lease</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select {uploadData.association_type}
                </label>
                
                {uploadData.association_type === 'property' && (
                  <select 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={uploadData.property_id}
                    onChange={(e) => setUploadData({...uploadData, property_id: e.target.value})}
                    required
                    disabled={isLoadingAssociations}
                  >
                    <option value="">
                      {isLoadingAssociations ? 'Loading...' : 'Select Property'}
                    </option>
                    {Array.isArray(properties) && properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.property_name}
                      </option>
                    ))}
                  </select>
                )}

                {uploadData.association_type === 'unit' && (
                  <select 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={uploadData.unit_id}
                    onChange={(e) => setUploadData({...uploadData, unit_id: e.target.value})}
                    required
                    disabled={isLoadingAssociations}
                  >
                    <option value="">
                      {isLoadingAssociations ? 'Loading...' : 'Select Unit'}
                    </option>
                    {Array.isArray(units) && units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.property_name} - Unit {unit.unit_number}
                      </option>
                    ))}
                  </select>
                )}

                {uploadData.association_type === 'tenant' && (
                  <select 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={uploadData.tenant_id}
                    onChange={(e) => setUploadData({...uploadData, tenant_id: e.target.value})}
                    required
                    disabled={isLoadingAssociations}
                  >
                    <option value="">
                      {isLoadingAssociations ? 'Loading...' : 'Select Tenant'}
                    </option>
                    {Array.isArray(tenants) && tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.first_name} {tenant.last_name} ({tenant.email})
                      </option>
                    ))}
                  </select>
                )}

                {uploadData.association_type === 'lease' && (
                  <select 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={uploadData.lease_id}
                    onChange={(e) => setUploadData({...uploadData, lease_id: e.target.value})}
                    required
                    disabled={isLoadingAssociations}
                  >
                    <option value="">
                      {isLoadingAssociations ? 'Loading...' : 'Select Lease'}
                    </option>
                    {Array.isArray(leases) && leases.map(lease => (
                      <option key={lease.id} value={lease.id}>
                        {lease.lease_number} - {lease.property_name} Unit {lease.unit_number}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date (optional)</label>
              <input
                type="date"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={uploadData.expires_at}
                onChange={(e) => setUploadData({...uploadData, expires_at: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={uploadData.is_important}
                  onChange={(e) => setUploadData({...uploadData, is_important: e.target.checked})}
                  className="mr-2"
                />
                Important
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={uploadData.is_shared}
                  onChange={(e) => setUploadData({...uploadData, is_shared: e.target.checked})}
                  className="mr-2"
                />
                Shared
              </label>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${selectedFiles.length > 0 ? 'bg-green-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
            />
            
            {selectedFiles.length > 0 ? (
              <div className="space-y-2">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                <p className="text-green-600">{selectedFiles.length} file(s) selected</p>
                <div className="max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-gray-600">
                  Drag and drop your files here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supported files: PDF, DOC, DOCX, XLS, XLSX, Images (up to 50MB each)
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedFiles.length === 0 || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Document Card Component
const DocumentCard = ({ document, onDownload, onView, onDelete, onUpdate }) => {
  const [showActions, setShowActions] = useState(false);

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-8 h-8 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="w-8 h-8 text-purple-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      onDelete(document.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          {getFileIcon(document.type)}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate" title={document.name}>
              {document.name}
            </h3>
            <p className="text-sm text-gray-500">{document.size} • {document.type}</p>
            {document.associatedWith && (
              <p className="text-xs text-gray-400 mt-1">{document.associatedWith}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {document.important && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
              Important
            </span>
          )}
          {document.shared && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              Shared
            </span>
          )}
        </div>
      </div>

      {document.tags && document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {document.tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          <p>Modified: {document.lastModified}</p>
          {document.accessCount > 0 && (
            <p className="text-xs">Views: {document.accessCount}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onView(document.id, document.name)}
            className="hover:text-blue-600 p-1"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDownload(document.id, document.name)}
            className="hover:text-blue-600 p-1"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            className="hover:text-blue-600 p-1"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="hover:text-red-600 p-1"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Statistics Panel Component
const StatisticsPanel = ({ statistics }) => {
  if (!statistics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900">Total Documents</h3>
        <p className="text-2xl font-bold text-blue-700">{statistics.totalDocuments}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-green-900">Recent Uploads</h3>
        <p className="text-2xl font-bold text-green-700">{statistics.recentUploads}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-purple-900">Total Size</h3>
        <p className="text-2xl font-bold text-purple-700">{statistics.totalSize}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-900">Important</h3>
        <p className="text-2xl font-bold text-yellow-700">{statistics.importantDocuments}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-red-900">Expiring Soon</h3>
        <p className="text-2xl font-bold text-red-700">{statistics.expiringSoon}</p>
      </div>
    </div>
  );
};

// Main Document Management Component
const DocumentManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeModule, setActiveModule] = useState('Document Management');
  const [filters, setFilters] = useState({});

  const {
    documents,
    categories,
    statistics,
    loading,
    error,
    fetchDocuments,
    uploadDocuments,
    downloadDocument,
    viewDocument,
    updateDocument,
    deleteDocument,
  } = useDocuments();

  // Apply filters when search term or category changes
  useEffect(() => {
    const newFilters = {};
    
    if (selectedCategory !== 'All') {
      newFilters.category = selectedCategory;
    }
    
    if (searchTerm.trim()) {
      newFilters.search = searchTerm.trim();
    }

    setFilters(newFilters);
    fetchDocuments(newFilters);
  }, [selectedCategory, searchTerm]);

  const handleUpload = async (files, metadata) => {
    try {
      await uploadDocuments(files, metadata);
      // Show success message
      alert('Documents uploaded successfully!');
    } catch (error) {
      // Error is already handled in the hook
      throw error;
    }
  };

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Statistics Panel */}
        <StatisticsPanel statistics={statistics} />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center flex-shrink-0 text-sm sm:text-base transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>Upload Document</span>
            </button>
            <button 
              className="bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-2 rounded flex items-center flex-shrink-0 text-sm sm:text-base transition-colors"
            >
              <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>New Folder</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full sm:w-[250px] pl-9 pr-4 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button 
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors flex-shrink-0"
              aria-label="Filter"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="relative">
          <div className="border-b">
            <div className="flex flex-wrap -mb-px">
              {categories.map(category => (
                <button
                  key={category}
                  className={`inline-flex items-center px-4 py-2 text-sm border-b-2 transition-colors
                    ${selectedCategory === category
                      ? 'border-blue-500 text-blue-500 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                    mr-2 mb-2 sm:mb-0
                  `}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading documents...</span>
          </div>
        )}

        {/* Documents Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.length > 0 ? (
              documents.map(document => (
                <DocumentCard 
                  key={document.id} 
                  document={document}
                  onDownload={downloadDocument}
                  onView={viewDocument}
                  onDelete={deleteDocument}
                  onUpdate={updateDocument}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== 'All' 
                    ? 'Try adjusting your search or filters'
                    : 'Upload your first document to get started'
                  }
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Modal */}
        <UploadModal 
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          categories={categories}
          loading={loading}
        />
      </div>
    </Navbar>
  );
};

export default DocumentManagement;

export async function loader() {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/");
  }

  try {
    const response = await fetch("/backend/api/auth/verifyToken", {
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