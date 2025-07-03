import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  Loader
} from "lucide-react";

const NewMessageModal = ({ isOpen, onClose, onMessageSent }) => {
  const [messageData, setMessageData] = useState({
    recipient: "",
    recipientType: "tenant", // "tenant" or "staff"
    subject: "",
    content: "",
    priority: "normal",
    followUpRequired: false,
    followUpDate: ""
  });

  const [recipients, setRecipients] = useState([]);
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch recipients when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRecipients();
      // Reset form when modal opens
      setMessageData({
        recipient: "",
        recipientType: "tenant",
        subject: "",
        content: "",
        priority: "normal",
        followUpRequired: false,
        followUpDate: ""
      });
      setSelectedRecipient(null);
      setSearchTerm("");
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  // Filter recipients based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRecipients(recipients);
    } else {
      const filtered = recipients.filter(recipient =>
        recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipient.property?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecipients(filtered);
    }
  }, [searchTerm, recipients]);

  const fetchRecipients = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/backend/api/communications/recipients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecipients(data.data.recipients || []);
        setFilteredRecipients(data.data.recipients || []);
      } else {
        throw new Error('Failed to fetch recipients');
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
      setError('Failed to load recipients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    setMessageData(prev => ({
      ...prev,
      recipient: recipient.name,
      recipientType: recipient.type
    }));
    setSearchTerm(recipient.name);
    setShowRecipientDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!selectedRecipient && messageData.recipientType === "tenant") {
      setError("Please select a recipient");
      return;
    }

    if (!messageData.subject.trim() || !messageData.content.trim()) {
      setError("Subject and message content are required");
      return;
    }

    if (messageData.followUpRequired && !messageData.followUpDate) {
      setError("Please select a follow-up date");
      return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        subject: messageData.subject.trim(),
        message_content: messageData.content.trim(),
        communication_type: "Email",
        follow_up_required: messageData.followUpRequired,
        follow_up_date: messageData.followUpDate || null
      };

      // Add recipient info based on type
      if (messageData.recipientType === "tenant" && selectedRecipient) {
        payload.tenant_id = selectedRecipient.id;
      }

      const response = await fetch('/api/communications/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Message sent successfully!");
        
        // Call parent callback if provided
        if (onMessageSent) {
          onMessageSent(result.data);
        }

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">New Message</h2>
          <button onClick={handleClose} disabled={isSending}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 pl-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isLoading ? "Loading recipients..." : "Search for recipient..."}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowRecipientDropdown(true);
                  }}
                  onFocus={() => setShowRecipientDropdown(true)}
                  disabled={isLoading || isSending}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {isLoading && (
                  <Loader className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                )}
              </div>

              {/* Recipient Dropdown */}
              {showRecipientDropdown && !isLoading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredRecipients.length > 0 ? (
                    filteredRecipients.map((recipient) => (
                      <div
                        key={`${recipient.type}-${recipient.id}`}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleRecipientSelect(recipient)}
                      >
                        <div className="flex items-center space-x-3">
                          {recipient.type === 'staff' ? (
                            <User className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Building className="w-5 h-5 text-green-500" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{recipient.name}</div>
                            {recipient.property && (
                              <div className="text-sm text-gray-500">{recipient.property}</div>
                            )}
                            {recipient.email && (
                              <div className="text-sm text-gray-500">{recipient.email}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500 text-center">
                      No recipients found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter message subject"
              value={messageData.subject}
              onChange={(e) =>
                setMessageData({ ...messageData, subject: e.target.value })
              }
              disabled={isSending}
              required
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              placeholder="Enter your message"
              value={messageData.content}
              onChange={(e) =>
                setMessageData({ ...messageData, content: e.target.value })
              }
              disabled={isSending}
              required
            />
          </div>

          {/* Priority and Follow-up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={messageData.priority}
                onChange={(e) =>
                  setMessageData({ ...messageData, priority: e.target.value })
                }
                disabled={isSending}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                <input
                  type="checkbox"
                  checked={messageData.followUpRequired}
                  onChange={(e) =>
                    setMessageData({ ...messageData, followUpRequired: e.target.checked })
                  }
                  disabled={isSending}
                  className="rounded"
                />
                <span>Requires Follow-up</span>
              </label>
              {messageData.followUpRequired && (
                <input
                  type="date"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={messageData.followUpDate}
                  onChange={(e) =>
                    setMessageData({ ...messageData, followUpDate: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isSending}
                />
              )}
            </div>
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
              disabled={isSending}
            >
              {isSending && <Loader className="w-4 h-4 animate-spin" />}
              <span>{isSending ? "Sending..." : "Send Message"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMessageModal;