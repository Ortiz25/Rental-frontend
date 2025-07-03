import React, { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const LeaseActivationModal = ({ lease, isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data for activation
  const [activationData, setActivationData] = useState({
    signed_date: new Date().toISOString().split('T')[0], // Default to today
    move_in_date: lease?.start_date || '',
    activation_notes: ''
  });

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setActivationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate activation data
  const validateActivation = () => {
    const errors = [];
    
    if (!activationData.signed_date) {
      errors.push('Signed date is required for lease activation');
    }
    
    if (activationData.signed_date && lease?.start_date) {
      if (new Date(activationData.signed_date) > new Date(lease.start_date)) {
        errors.push('Signed date cannot be after lease start date');
      }
    }
    
    if (activationData.move_in_date && lease?.start_date) {
      if (new Date(activationData.move_in_date) < new Date(lease.start_date)) {
        errors.push('Move-in date cannot be before lease start date');
      }
    }
    
    if (lease?.lease_type === 'Fixed Term' && !lease?.end_date) {
      errors.push('End date must be set before activating a Fixed Term lease');
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateActivation();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare update data
      const updateData = {
        lease_status: 'active',
        signed_date: activationData.signed_date,
        ...(activationData.move_in_date && { move_in_date: activationData.move_in_date }),
        ...(activationData.activation_notes && { 
          special_conditions: lease.special_conditions 
            ? `${lease.special_conditions}\n\nActivated on ${new Date().toISOString().split('T')[0]}: ${activationData.activation_notes}`
            : `Activated on ${new Date().toISOString().split('T')[0]}: ${activationData.activation_notes}`
        })
      };
      
      await onSubmit(updateData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setActivationData({
        signed_date: new Date().toISOString().split('T')[0],
        move_in_date: lease?.start_date || '',
        activation_notes: ''
      });
      setError(null);
    }
  }, [isOpen, lease]);

  if (!isOpen || !lease) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activate Lease</h2>
            <p className="text-sm text-gray-600 mt-1">
              Lease #{lease.lease_number} - {lease.property_name} Unit {lease.unit_number}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Lease Info */}
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Current Lease Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Primary Tenant:</span>
              <p className="font-medium">{lease.primary_tenant_name || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600">Monthly Rent:</span>
              <p className="font-medium">${lease.monthly_rent?.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Start Date:</span>
              <p className="font-medium">{new Date(lease.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-600">End Date:</span>
              <p className="font-medium">
                {lease.end_date ? new Date(lease.end_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>
          
          {/* Warning if no end date for Fixed Term */}
          {lease.lease_type === 'Fixed Term' && !lease.end_date && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This Fixed Term lease requires an end date before activation. 
                    Please edit the lease to add an end date first.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Activation Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Activation Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signed Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={activationData.signed_date}
                  onChange={(e) => handleInputChange('signed_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Date when the lease was signed by all parties
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Move-in Date
                </label>
                <input
                  type="date"
                  value={activationData.move_in_date}
                  onChange={(e) => handleInputChange('move_in_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Planned or actual move-in date (optional)
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activation Notes
              </label>
              <textarea
                value={activationData.activation_notes}
                onChange={(e) => handleInputChange('activation_notes', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes about the lease activation..."
              />
            </div>
          </div>

          {/* Activation Impact */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="flex">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">What happens when you activate this lease:</h4>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Unit will be marked as occupied</li>
                  <li>• Lease status changes to "Active"</li>
                  <li>• Security deposit record will be created (if applicable)</li>
                  <li>• Rent payment schedule becomes active</li>
                  <li>• Unit will no longer appear in available units list</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (lease?.lease_type === 'Fixed Term' && !lease?.end_date)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:bg-gray-400 flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {loading ? 'Activating...' : 'Activate Lease'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaseActivationModal;