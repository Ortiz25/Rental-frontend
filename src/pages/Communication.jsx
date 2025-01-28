import React, { useState } from "react";
import Navbar from "../layout/navbar";

import {
  MessageSquare,
  Bell,
  Send,
  Users,
  Search,
  Plus,
  Settings,
  X,
  Filter,
  Star,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import NewMessageModal from "../components/modals/NewMessageModal";
import AnnouncementModal from "../components/modals/AnnouncementModal";

const initialMessages = [
  {
    id: 1,
    sender: "John Doe",
    property: "Unit 304",
    content: "When will the maintenance team fix the AC?",
    timestamp: "2024-01-27T10:30:00",
    status: "unread",
    priority: "high",
    type: "maintenance",
  },
  {
    id: 2,
    sender: "Jane Smith",
    property: "Unit 201",
    content: "Confirming rent payment for February",
    timestamp: "2024-01-26T15:45:00",
    status: "read",
    priority: "normal",
    type: "payment",
  },
];

const initialAnnouncements = [
  {
    id: 1,
    title: "Building Maintenance Notice",
    content: "Water shutdown scheduled for Feb 1st, 9 AM - 2 PM",
    date: "2024-01-27",
    priority: "high",
    recipients: "All Tenants",
  },
];

const CommunicationTools = () => {
  const [activeModule, setActiveModule] = useState("Communication");
  const [messages, setMessages] = useState(initialMessages);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");

  const getPriorityColor = (priority) => {
    const colors = {
      high: "text-red-600",
      normal: "text-blue-600",
      low: "text-gray-600",
    };
    return colors[priority] || colors.normal;
  };

  


  const MessageList = () => (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow
            ${message.status === "unread" ? "border-l-4 border-blue-500" : ""}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{message.sender}</h3>
              <p className="text-sm text-gray-600">{message.property}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${getPriorityColor(message.priority)}`}>
                {message.priority}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          <p className="text-gray-700 line-clamp-2">{message.content}</p>
        </div>
      ))}
    </div>
  );

  const AnnouncementList = () => (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{announcement.title}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                announcement.priority === "high"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {announcement.priority}
            </span>
          </div>
          <p className="text-gray-700 mb-2">{announcement.content}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{announcement.recipients}</span>
            <span>{announcement.date}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center flex-shrink-0 text-sm sm:text-base transition-colors"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>New Message</span>
            </button>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded flex items-center flex-shrink-0 text-sm sm:text-base transition-colors"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>New Announcement</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full sm:w-[200px] pl-9 pr-4 py-2 border rounded text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          <button
            className={`pb-2 px-4 ${
              activeTab === "messages"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            Messages
          </button>
          <button
            className={`pb-2 px-4 ${
              activeTab === "announcements"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("announcements")}
          >
            Announcements
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === "messages" ? <MessageList /> : <AnnouncementList />}
        </div>

        {/* Modals */}
        <NewMessageModal
          isOpen={showNewMessageModal}
          onClose={() => setShowNewMessageModal(false)}
        />
        <AnnouncementModal
          isOpen={showAnnouncementModal}
          onClose={() => setShowAnnouncementModal(false)}
        />
      </div>
    </Navbar>
  );
};

export default CommunicationTools;
