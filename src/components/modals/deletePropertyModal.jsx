import React, { useState } from "react";
import { X, Trash2, AlertTriangle, Loader, AlertCircle } from "lucide-react";

const DeletePropertyModal = ({ isOpen, onClose, onDelete, property }) => {
  const [deleteStep, setDeleteStep] = useState(1); // 1: confirmation, 2: verification
  const [confirmationText, setConfirmationText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const expectedConfirmationText = `DELETE ${property?.propertyName}`;

  // Reset modal state when it opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setDeleteStep(1);
      setConfirmationText("");
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleStepOne = () => {
    if (property.occupiedUnits > 0) {
      setError("Cannot delete property with occupied units. Please move or terminate all tenants first.");
      return;
    }
    setDeleteStep(2);
    setError(null);
  };

  const isConfirmationValid = () => {
    return confirmationText.trim().toUpperCase() === expectedConfirmationText.toUpperCase();
  };

  const handleDelete = async () => {
    if (!isConfirmationValid()) {
      setError("Please type the exact confirmation text to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/backend/api/properties/${property.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.status === 200) {
        // Call the parent onDelete callback
        if (onDelete) {
          await onDelete(property.id);
        }
        
        // Close modal
        onClose();
      } else {
        throw new Error(result.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={!loading ? onClose : undefined} />
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mr-3">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delete Property</h2>
          </div>
          <button 
            onClick={!loading ? onClose : undefined} 
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Initial Confirmation */}
          {deleteStep === 1 && (
            <div>
              {/* Warning Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              {/* Property Information */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Are you sure you want to delete this property?
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="font-medium text-gray-900">{property.propertyName}</p>
                  <p className="text-sm text-gray-600">{property.address}</p>
                  <p className="text-sm text-gray-600 mt-1">{property.type} • {property.totalUnits} units</p>
                </div>
              </div>

              {/* Warning Messages */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                    <div className="text-sm text-yellow-700 mt-1">
                      <p>This action cannot be undone. Deleting this property will:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Permanently remove all property data</li>
                        <li>Delete all associated units</li>
                        <li>Remove property documents and images</li>
                        <li>Clear maintenance request history</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Occupancy Check */}
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-900">{property.totalUnits}</p>
                    <p className="text-xs text-gray-600">Total Units</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">{property.occupiedUnits}</p>
                    <p className="text-xs text-gray-600">Occupied</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-red-600">{property.vacantUnits}</p>
                    <p className="text-xs text-gray-600">Vacant</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStepOne}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Final Confirmation with Text Input */}
          {deleteStep === 2 && (
            <div>
              {/* Final Warning */}
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Final Confirmation Required
                </h3>
                <p className="text-sm text-gray-600">
                  This is your last chance to prevent permanent data loss.
                </p>
              </div>

              {/* Property Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      You are about to permanently delete:
                    </h4>
                    <div className="text-sm text-red-700">
                      <p className="font-medium">{property.propertyName}</p>
                      <p>{property.address}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <span>• {property.totalUnits} total units</span>
                        <span>• {property.vacantUnits} vacant units</span>
                        <span>• Property type: {property.type}</span>
                        <span>• Monthly rent: KSh {property.monthlyRent?.toLocaleString() || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To confirm deletion, type the following text exactly:
                </label>
                <div className="bg-gray-100 border rounded-lg p-3 mb-3">
                  <code className="text-sm font-mono text-gray-900">
                    {expectedConfirmationText}
                  </code>
                </div>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type confirmation text here..."
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:bg-gray-50"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This must match exactly (case insensitive)
                </p>
              </div>

              {/* Data Loss Warning */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Data that will be permanently lost:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    Property information
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    Unit details
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    Lease history
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    Payment records
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    Maintenance requests
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    Document attachments
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setDeleteStep(1)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading || !isConfirmationValid()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>

              {/* Additional Warning */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  This action is irreversible and will immediately remove all data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeletePropertyModal;