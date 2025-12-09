import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader,
  CheckCircle,
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const UpdateInquiryModal = ({ isOpen, onClose, inquiry, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: "",
    assignedTo: "",
    responseNotes: "",
    contactedAt: "",
    scheduledViewingAt: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (inquiry && isOpen) {
      setFormData({
        status: inquiry.inquiry_status || "",
        assignedTo: inquiry.assigned_to || "",
        responseNotes: inquiry.response_notes || "",
        contactedAt: inquiry.contacted_at
          ? new Date(inquiry.contacted_at).toISOString().slice(0, 16)
          : "",
        scheduledViewingAt: inquiry.scheduled_viewing_at
          ? new Date(inquiry.scheduled_viewing_at).toISOString().slice(0, 16)
          : "",
      });
      fetchUsers();
    }
  }, [inquiry, isOpen]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/backend/api/inquiries/users/staff", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result)
        if (result.status === 200) {
          setUsers(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/backend/api/inquiries/${inquiry.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: formData.status,
            assignedTo: formData.assignedTo || null,
            responseNotes: formData.responseNotes,
            contactedAt: formData.contactedAt || null,
            scheduledViewingAt: formData.scheduledViewingAt || null,
          }),
        }
      );

      const result = await response.json();

      if (result.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to update inquiry");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Failed to update inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-set contacted_at when status changes to contacted
    if (name === "status" && value === "contacted" && !formData.contactedAt) {
      setFormData((prev) => ({
        ...prev,
        contactedAt: new Date().toISOString().slice(0, 16),
      }));
    }
  };

  if (!isOpen || !inquiry) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Inquiry Updated!
            </h3>
            <p className="text-gray-600">
              The inquiry has been successfully updated.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Update Inquiry
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage inquiry status and assignment
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Inquiry Reference */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Inquirer</div>
                <div className="font-semibold text-gray-900 text-lg">
                  {inquiry.inquirer_name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {inquiry.property_name}
                  {inquiry.unit_number && ` - Unit ${inquiry.unit_number}`}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.role_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contacted At */}
              {(formData.status === "contacted" ||
                formData.status === "scheduled" ||
                formData.status === "completed") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contacted Date & Time
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      name="contactedAt"
                      value={formData.contactedAt}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Scheduled Viewing At */}
              {(formData.status === "scheduled" ||
                formData.status === "completed") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Viewing Date & Time
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      name="scheduledViewingAt"
                      value={formData.scheduledViewingAt}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Response Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Notes
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="responseNotes"
                    value={formData.responseNotes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add notes about your response, conversation details, or next steps..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Inquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateInquiryModal;