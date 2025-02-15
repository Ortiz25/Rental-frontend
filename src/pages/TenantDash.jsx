import React, { useState } from "react";
import {
  Home,
  DollarSign,
  FileText,
  Bell,
  MessageSquare,
  WrenchIcon,
  Calendar,
  ChevronRight,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Paperclip,
  X,
} from "lucide-react";
import Navbar from "../layout/navbar";
import maleImage from "../assets/images/male.jpg";
import femaleImage from "../assets/images/female.jpg";

const initialTenantData = {
  tenant: {
    name: "John Doe",
    unit: "Unit 304",
    leaseStart: "2023-06-01",
    leaseEnd: "2024-05-31",
    rentAmount: 2750,
    securityDeposit: 4125,
    balance: 0,
    profileImage: "/api/placeholder/100/100",
  },
  rentHistory: [
    { id: 1, date: "2024-01-01", amount: 2750, status: "Paid", type: "Rent" },
    { id: 2, date: "2023-12-01", amount: 2750, status: "Paid", type: "Rent" },
  ],
  maintenanceRequests: [
    {
      id: 1,
      title: "Leaking Faucet",
      status: "In Progress",
      priority: "Medium",
      submitted: "2024-01-25",
      scheduled: "2024-01-28",
    },
  ],
  notifications: [
    {
      id: 1,
      title: "Rent Due Reminder",
      content: "Your rent payment of $2,750 is due in 5 days",
      type: "payment",
      date: "2024-01-26",
    },
    {
      id: 2,
      title: "Building Maintenance",
      content: "Water shutdown scheduled for Feb 1st, 9 AM - 2 PM",
      type: "maintenance",
      date: "2024-01-25",
    },
  ],
  documents: [
    {
      id: 1,
      name: "Lease Agreement",
      type: "PDF",
      date: "2023-06-01",
    },
    {
      id: 2,
      name: "Move-in Inspection",
      type: "PDF",
      date: "2023-06-01",
    },
  ],
};

const ContactManagerModal = ({ isOpen, onClose }) => {
  const [messageData, setMessageData] = useState({
    subject: "",
    message: "",
    priority: "normal",
    attachments: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle message submission
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Contact Property Manager</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={messageData.subject}
              onChange={(e) =>
                setMessageData({ ...messageData, subject: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              className="w-full p-2 border rounded"
              value={messageData.priority}
              onChange={(e) =>
                setMessageData({ ...messageData, priority: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              value={messageData.message}
              onChange={(e) =>
                setMessageData({ ...messageData, message: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) =>
                  setMessageData({
                    ...messageData,
                    attachments: Array.from(e.target.files || []),
                  })
                }
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-500 hover:text-blue-600"
              >
                <Paperclip className="w-5 h-5 mx-auto mb-2" />
                <span>Add Attachments</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UploadDocumentModal = ({ isOpen, onClose }) => {
  const [uploadData, setUploadData] = useState({
    title: "",
    category: "",
    file: null,
    description: "",
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle document upload
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Title
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={uploadData.title}
              onChange={(e) =>
                setUploadData({ ...uploadData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="w-full p-2 border rounded"
              value={uploadData.category}
              onChange={(e) =>
                setUploadData({ ...uploadData, category: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              <option value="lease">Lease Documents</option>
              <option value="identification">Identification</option>
              <option value="insurance">Insurance</option>
              <option value="maintenance">Maintenance Records</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={uploadData.description}
              onChange={(e) =>
                setUploadData({ ...uploadData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">File</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
              onClick={() => document.getElementById("document-upload").click()}
            >
              {uploadData.file ? (
                <div className="text-green-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>{uploadData.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p>Click to upload or drag and drop</p>
                  <p className="text-sm">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                </div>
              )}
              <input
                id="document-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
              disabled={!uploadData.file}
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TenantDashboard = () => {
  const [tenantData, setTenantData] = useState(initialTenantData);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeModule, setActiveModule] = useState("Tenant Dashboard");

  const PaymentModal = ({ isOpen, onClose }) => (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Make Payment</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Amount
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              defaultValue={tenantData.tenant.rentAmount}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Method
            </label>
            <select className="w-full p-2 border rounded">
              <option>Credit Card</option>
              <option>Bank Transfer</option>
              <option>PayPal</option>
            </select>
          </div>

          <button className="w-full bg-blue-500 text-white py-2 rounded">
            Process Payment
          </button>
        </div>
      </div>
    </div>
  );

  const MaintenanceRequestModal = ({ isOpen, onClose }) => (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">New Maintenance Request</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Issue Title
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Detailed description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select className="w-full p-2 border rounded">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <button className="w-full bg-blue-500 text-white py-2 rounded">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <Navbar module={activeModule}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Tenant Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 text-center sm:text-left">
              <img
                src={maleImage}
                alt="Profile"
                className="w-20 h-20 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-0"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {tenantData.tenant.name}
                </h1>
                <p className="font-semibold">123 Urban Loft, Downtown</p>
                <p className="text-gray-600">{tenantData.tenant.unit}</p>
              </div>
            </div>
            <div className="text-center sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0">
              <p className="text-sm text-gray-600">Lease Period</p>
              <p className="font-medium">
                <span className="block sm:inline">
                  {new Date(tenantData.tenant.leaseStart).toLocaleDateString()}
                </span>
                <span className="hidden sm:inline"> - </span>
                <span className="block sm:inline">
                  {new Date(tenantData.tenant.leaseEnd).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mb-2 mx-auto" />
            <h3 className="font-medium text-sm sm:text-base">Make Payment</h3>
          </button>

          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <WrenchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mb-2 mx-auto" />
            <h3 className="font-medium text-sm sm:text-base">
              Request Maintenance
            </h3>
          </button>

          <button
            onClick={() => setShowContactModal(true)}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <MessageSquare className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="font-medium">Contact Manager</h3>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Upload className="w-8 h-8 text-orange-500 mb-2" />
            <h3 className="font-medium">Upload Document</h3>
          </button>

          {/* Add modals to the dashboard */}
          <ContactManagerModal
            isOpen={showContactModal}
            onClose={() => setShowContactModal(false)}
          />

          <UploadDocumentModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Rent & Payments Card */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-bold">
                Rent & Payments
              </h2>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-gray-600">Monthly Rent</span>
                <span className="font-medium">
                  ${tenantData.tenant.rentAmount}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-gray-600">Current Balance</span>
                <span className="font-medium">
                  ${tenantData.tenant.balance}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-gray-600">Next Due Date</span>
                <span className="font-medium">Feb 1, 2024</span>
              </div>

              <div className="pt-3 sm:pt-4">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors duration-200"
                >
                  Make Payment
                </button>
              </div>
            </div>
          </div>

          {/* Maintenance Requests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Maintenance Requests</h2>
              <WrenchIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-4">
              {tenantData.maintenanceRequests.map((request) => (
                <div key={request.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{request.title}</h3>
                      <p className="text-sm text-gray-600">
                        Submitted:{" "}
                        {new Date(request.submitted).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        request.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : request.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowMaintenanceModal(true)}
                className="w-full bg-blue-500 text-white py-2 rounded"
              >
                New Request
              </button>
            </div>
          </div>

          {/* Important Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Notifications</h2>
              <Bell className="w-5 h-5 text-purple-500" />
            </div>
            <div className="space-y-4">
              {tenantData.notifications.map((notification) => (
                <div key={notification.id} className="border-b pb-4">
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600">
                    {notification.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Important Documents</h2>
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {tenantData.documents.map((document) => (
              <div
                key={document.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded"
              >
                <div>
                  <h3 className="font-medium">{document.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(document.date).toLocaleDateString()}
                  </p>
                </div>
                <button className="text-blue-500 hover:text-blue-700">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
        <MaintenanceRequestModal
          isOpen={showMaintenanceModal}
          onClose={() => setShowMaintenanceModal(false)}
        />
      </div>
    </Navbar>
  );
};

export default TenantDashboard;
