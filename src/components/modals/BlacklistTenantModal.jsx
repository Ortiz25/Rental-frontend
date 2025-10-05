import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, FileText, Calendar, User } from 'lucide-react';

const BlacklistTenantModal = ({ 
  isOpen, 
  onClose, 
  tenant, 
  onBlacklist, 
  onRemoveBlacklist,
  isRemoving = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    reason: '',
    severity: 'medium',
    notes: '',
    evidenceDocuments: [],
    categoryId: '',
    removalReason: ''
  });

  useEffect(() => {
    if (isOpen && !isRemoving) {
      fetchBlacklistCategories();
    }
  }, [isOpen, isRemoving]);

  const fetchBlacklistCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5020/api/tenants/blacklist-categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 200) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = isRemoving 
        ? await onRemoveBlacklist(tenant.id, formData.removalReason, formData.notes)
        : await onBlacklist(tenant.id, formData);
      
      if (success) {
        setFormData({
          reason: '',
          severity: 'medium',
          notes: '',
          evidenceDocuments: [],
          categoryId: '',
          removalReason: ''
        });
        onClose();
      }
    } catch (error) {
      console.error('Error processing blacklist action:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-yellow-600 bg-yellow-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'high': return 'text-red-600 bg-red-50';
      case 'severe': return 'text-red-800 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
       <div className=' fixed inset-0 bg-black opacity-50'></div>
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto z-60">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            {isRemoving ? 'Remove from Blacklist' : 'Blacklist Tenant'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tenant Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center mb-2">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium">{tenant?.name}</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>Email: {tenant?.email}</p>
            <p>Phone: {tenant?.phone}</p>
            {tenant?.propertyName && <p>Property: {tenant.propertyName}</p>}
          </div>
          
          {/* Current Blacklist Status */}
          {tenant?.isBlacklisted && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-800">Currently Blacklisted</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(tenant.blacklistSeverity)}`}>
                  {tenant.blacklistSeverity?.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-red-700 mt-1">{tenant.blacklistReason}</p>
              {tenant.blacklistedDate && (
                <p className="text-xs text-red-600 mt-1">
                  Blacklisted: {new Date(tenant.blacklistedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {isRemoving ? (
            /* Removal Form */
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Removal *
                </label>
                <textarea
                  value={formData.removalReason}
                  onChange={(e) => setFormData({...formData, removalReason: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Explain why this tenant is being removed from the blacklist..."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  placeholder="Any additional context or conditions..."
                />
              </div>
            </>
          ) : (
            /* Blacklist Form */
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    const category = categories.find(c => c.id.toString() === e.target.value);
                    setFormData({
                      ...formData,
                      categoryId: e.target.value,
                      reason: category?.category_name || '',
                      severity: category?.default_severity || 'medium'
                    });
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Reason *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Provide specific details about why this tenant is being blacklisted..."
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low - Minor issues</option>
                  <option value="medium">Medium - Moderate concerns</option>
                  <option value="high">High - Serious violations</option>
                  <option value="severe">Severe - Critical issues</option>
                </select>
                <div className={`mt-2 p-2 rounded text-sm ${getSeverityColor(formData.severity)}`}>
                  {formData.severity === 'low' && 'Minor lease violations or occasional late payments'}
                  {formData.severity === 'medium' && 'Repeated violations or significant payment issues'}
                  {formData.severity === 'high' && 'Serious property damage or chronic problems'}
                  {formData.severity === 'severe' && 'Criminal activity or extreme violations'}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Any additional context, evidence, or special considerations..."
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                isRemoving 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
              disabled={loading || (!isRemoving && !formData.reason) || (isRemoving && !formData.removalReason)}
            >
              {loading ? 'Processing...' : (isRemoving ? 'Remove from Blacklist' : 'Blacklist Tenant')}
            </button>
          </div>
        </form>

        {/* Warning Message */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Warning:</strong> {isRemoving 
                ? 'Removing a tenant from the blacklist will allow them to apply for future rentals.'
                : 'Blacklisting will prevent this tenant from applying for future rentals and will be recorded permanently.'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlacklistTenantModal;