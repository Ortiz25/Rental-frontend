import React, { useState, useEffect } from "react";
import {
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  Users,
  Building,
  Globe
} from "lucide-react";

const AnnouncementModal = ({ isOpen, onClose, onAnnouncementSent }) => {
  const [announcementData, setAnnouncementData] = useState({
    title: "",
    content: "",
    priority: "normal",
    recipients: "all",
    propertyId: "",
    scheduledFor: ""
  });

  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recipientCount, setRecipientCount] = useState(0);

  // Fetch properties when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      // Reset form when modal opens
      setAnnouncementData({
        title: "",
        content: "",
        priority: "normal",
        recipients: "all",
        propertyId: "",
        scheduledFor: ""
      });
      setError("");
      setSuccess("");
      setRecipientCount(0);
    }
  }, [isOpen]);

  // Update recipient count when selection changes
  useEffect(() => {
    calculateRecipientCount();
  }, [announcementData.recipients, announcementData.propertyId, properties]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/backend/api/communications/properties', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.data.properties || []);
      } else {
        throw new Error('Failed to fetch properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRecipientCount = () => {
    if (announcementData.recipients === "all") {
      const totalTenants = properties.reduce((sum, property) => sum + property.activeTenants, 0);
      setRecipientCount(totalTenants);
    } else if (announcementData.recipients === "property" && announcementData.propertyId) {
      const selectedProperty = properties.find(p => p.id.toString() === announcementData.propertyId);
      setRecipientCount(selectedProperty ? selectedProperty.activeTenants : 0);
    } else {
      setRecipientCount(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!announcementData.title.trim() || !announcementData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    if (announcementData.recipients === "property" && !announcementData.propertyId) {
      setError("Please select a property");
      return;
    }

    if (recipientCount === 0) {
      setError("No recipients found for this announcement");
      return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: announcementData.title.trim(),
        content: announcementData.content.trim(),
        priority: announcementData.priority,
        recipients: announcementData.recipients
      };

      // Add property ID if targeting specific property
      if (announcementData.recipients === "property" && announcementData.propertyId) {
        payload.property_id = parseInt(announcementData.propertyId);
      }

      const response = await fetch('/backend/api/communications/announcements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Announcement sent successfully to ${result.data.recipientCount} recipients!`);
        
        // Call parent callback if provided
        if (onAnnouncementSent) {
          onAnnouncementSent(result.data);
        }

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to send announcement');
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      setError(error.message || 'Failed to send announcement');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      onClose();
    }
  };

  const getRecipientIcon = () => {
    switch (announcementData.recipients) {
      case "all":
        return <Globe className="w-4 h-4" />;
      case "property":
        return <Building className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRecipientText = () => {
    if (announcementData.recipients === "all") {
      return "All tenants across all properties";
    } else if (announcementData.recipients === "property" && announcementData.propertyId) {
      const selectedProperty = properties.find(p => p.id.toString() === announcementData.propertyId);
      return selectedProperty ? `All tenants in ${selectedProperty.name}` : "Select a property";
    }
    return "Select recipients";
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">New Announcement</h2>
          <button onClick={handleClose} disabled={isSending}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Announcement Title
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter announcement title"
              value={announcementData.title}
              onChange={(e) =>
                setAnnouncementData({
                  ...announcementData,
                  title: e.target.value,
                })
              }
              disabled={isSending}
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={5}
              placeholder="Enter announcement content"
              value={announcementData.content}
              onChange={(e) =>
                setAnnouncementData({
                  ...announcementData,
                  content: e.target.value,
                })
              }
              disabled={isSending}
              required
            />
          </div>

          {/* Recipients Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Recipients</label>
            <div className="space-y-3">
              {/* All Tenants Option */}
              <label className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="recipients"
                  value="all"
                  checked={announcementData.recipients === "all"}
                  onChange={(e) =>
                    setAnnouncementData({
                      ...announcementData,
                      recipients: e.target.value,
                      propertyId: ""
                    })
                  }
                  disabled={isSending}
                  className="text-blue-500"
                />
                <Globe className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium">All Tenants</div>
                  <div className="text-sm text-gray-500">
                    Send to all active tenants across all properties
                  </div>
                </div>
              </label>

              {/* Specific Property Option */}
              <label className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="recipients"
                  value="property"
                  checked={announcementData.recipients === "property"}
                  onChange={(e) =>
                    setAnnouncementData({
                      ...announcementData,
                      recipients: e.target.value
                    })
                  }
                  disabled={isSending}
                  className="text-blue-500"
                />
                <Building className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <div className="font-medium">Specific Property</div>
                  <div className="text-sm text-gray-500">
                    Send to tenants in a specific property
                  </div>
                </div>
              </label>

              {/* Property Selection Dropdown */}
              {announcementData.recipients === "property" && (
                <div className="ml-8">
                  <select
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={announcementData.propertyId}
                    onChange={(e) =>
                      setAnnouncementData({
                        ...announcementData,
                        propertyId: e.target.value
                      })
                    }
                    disabled={isSending || isLoading}
                    required={announcementData.recipients === "property"}
                  >
                    <option value="">Select a property</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name} ({property.activeTenants} active tenants)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Recipient Summary */}
            {recipientCount > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-2 text-blue-700">
                  {getRecipientIcon()}
                  <span className="text-sm">
                    <strong>{recipientCount}</strong> recipient{recipientCount !== 1 ? 's' : ''} - {getRecipientText()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={announcementData.priority}
              onChange={(e) =>
                setAnnouncementData({
                  ...announcementData,
                  priority: e.target.value,
                })
              }
              disabled={isSending}
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority (Urgent)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              High priority announcements will be marked as urgent for recipients
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              disabled={isSending || recipientCount === 0}
            >
              {isSending && <Loader className="w-4 h-4 animate-spin" />}
              <span>
                {isSending 
                  ? "Sending..." 
                  : `Send to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;