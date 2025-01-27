import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';

const initialMessages = [
  {
    id: 1,
    sender: 'John Doe',
    property: 'Unit 304',
    content: 'When will the maintenance team fix the AC?',
    timestamp: '2024-01-27T10:30:00',
    status: 'unread',
    priority: 'high',
    type: 'maintenance'
  },
  {
    id: 2,
    sender: 'Jane Smith',
    property: 'Unit 201',
    content: 'Confirming rent payment for February',
    timestamp: '2024-01-26T15:45:00',
    status: 'read',
    priority: 'normal',
    type: 'payment'
  }
];

const initialAnnouncements = [
  {
    id: 1,
    title: 'Building Maintenance Notice',
    content: 'Water shutdown scheduled for Feb 1st, 9 AM - 2 PM',
    date: '2024-01-27',
    priority: 'high',
    recipients: 'All Tenants'
  }
];



const CommunicationTools = () => {
  const [activeModule, setActiveModule] = useState('Communication')
  const [messages, setMessages] = useState(initialMessages);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600',
      normal: 'text-blue-600',
      low: 'text-gray-600'
    };
    return colors[priority] || colors.normal;
  };
  
  
  const NewMessageModal = ({ isOpen, onClose }) => {
    const [messageData, setMessageData] = useState({
      recipient: '',
      subject: '',
      content: '',
      priority: 'normal'
    });

    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-2/3 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">New Message</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">To</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Recipient name or unit"
                value={messageData.recipient}
                onChange={(e) => setMessageData({...messageData, recipient: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={messageData.subject}
                onChange={(e) => setMessageData({...messageData, subject: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={6}
                value={messageData.content}
                onChange={(e) => setMessageData({...messageData, content: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                className="w-full p-2 border rounded"
                value={messageData.priority}
                onChange={(e) => setMessageData({...messageData, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AnnouncementModal = ({ isOpen, onClose }) => {
    const [announcementData, setAnnouncementData] = useState({
      title: '',
      content: '',
      priority: 'normal',
      recipients: 'all'
    });

    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-2/3">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">New Announcement</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={announcementData.title}
                onChange={(e) => setAnnouncementData({...announcementData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={4}
                value={announcementData.content}
                onChange={(e) => setAnnouncementData({...announcementData, content: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  className="w-full p-2 border rounded"
                  value={announcementData.priority}
                  onChange={(e) => setAnnouncementData({...announcementData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Recipients</label>
                <select
                  className="w-full p-2 border rounded"
                  value={announcementData.recipients}
                  onChange={(e) => setAnnouncementData({...announcementData, recipients: e.target.value})}
                >
                  <option value="all">All Tenants</option>
                  <option value="building1">Building 1</option>
                  <option value="building2">Building 2</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Send Announcement
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const MessageList = () => (
    <div className="space-y-4">
      {messages.map(message => (
        <div 
          key={message.id}
          className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow
            ${message.status === 'unread' ? 'border-l-4 border-blue-500' : ''}`}
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
      {announcements.map(announcement => (
        <div key={announcement.id} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{announcement.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs ${
              announcement.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
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
      <Navbar module={activeModule} >
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
            activeTab === 'messages'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
        <button
          className={`pb-2 px-4 ${
            activeTab === 'announcements'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'messages' ? <MessageList /> : <AnnouncementList />}
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
   
  )
  
}
  


export default CommunicationTools