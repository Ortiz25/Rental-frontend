import Navbar from '../layout/navbar.jsx';
import React, { useState } from 'react';
import { 
  WrenchIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Calendar,
  Users,
  ArrowUpRight,
  X,
  Camera,
  Paperclip,
  Clock,
  Settings // Replacing Tool with Settings
} from 'lucide-react';


const initialRequests = [
  {
    id: 1,
    title: "Leaking Faucet",
    description: "Kitchen sink faucet is continuously dripping",
    property: "123 Urban Loft",
    unit: "#304",
    tenantName: "John Doe",
    tenantContact: "555-0123",
    priority: "Medium",
    status: "In Progress",
    category: "Plumbing",
    createdAt: "2024-01-25T10:00:00",
    assignedTo: "Mike Wilson",
    expectedCompletion: "2024-01-28",
    photos: ["leak1.jpg", "leak2.jpg"],
    cost: 150,
    updates: [
      {
        date: "2024-01-25T14:30:00",
        status: "Assigned",
        note: "Assigned to Mike Wilson"
      },
      {
        date: "2024-01-26T09:15:00",
        status: "In Progress",
        note: "Parts ordered, scheduled for tomorrow"
      }
    ]
  },
  {
    id: 2,
    title: "AC Not Working",
    description: "Air conditioning unit not cooling properly",
    property: "456 Suburban Haven",
    unit: "Unit 12",
    tenantName: "Jane Smith",
    tenantContact: "555-0124",
    priority: "High",
    status: "Open",
    category: "HVAC",
    createdAt: "2024-01-26T09:00:00",
    assignedTo: null,
    expectedCompletion: null,
    photos: ["ac1.jpg"],
    updates: [
      {
        date: "2024-01-26T09:00:00",
        status: "Open",
        note: "Request received"
      }
    ]
  }
];

const contractors = [
  {
    id: 1,
    name: "Mike Wilson",
    specialties: ["Plumbing", "General Repairs"],
    rating: 4.8,
    phone: "555-9876",
    email: "mike@repairs.com",
    availability: "Available"
  },
  {
    id: 2,
    name: "Sarah Chen",
    specialties: ["HVAC", "Electrical"],
    rating: 4.9,
    phone: "555-8765",
    email: "sarah@repairs.com",
    availability: "Available"
  }
];
const NewRequestModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    propertyName: '',
    tenantName: '',
    priority: 'Medium',
    category: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      ...formData,
      id: Date.now(),
      status: 'Pending',
      dateSubmitted: new Date().toISOString().split('T')[0],
      updates: [
        {
          date: new Date().toISOString().split('T')[0],
          author: 'System',
          content: 'Maintenance request created'
        }
      ]
    };
    setRequests([...requests, newRequest]);
    onClose();
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-2/3 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">New Maintenance Request</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Property</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.propertyName}
                onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tenant Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.tenantName}
                onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>HVAC</option>
                <option>Security</option>
                <option>General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="border-t pt-4 flex justify-end space-x-2">
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
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RequestDetailsModal = ({ request, isOpen, onClose, getStatusColor, getPriorityColor }) => {
  const [newUpdate, setNewUpdate] = useState('');

  const addUpdate = () => {
    if (!newUpdate.trim()) return;

    const updatedRequest = {
      ...request,
      updates: [
        ...request.updates,
        {
          date: new Date().toISOString().split('T')[0],
          author: 'Staff',
          content: newUpdate
        }
      ]
    };

    setRequests(requests.map(r => r.id === request.id ? updatedRequest : r));
    setNewUpdate('');
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-3/4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Maintenance Request Details</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Request Information</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Title:</span> {request.title}</p>
                <p><span className="text-gray-600">Property:</span> {request.propertyName}</p>
                <p><span className="text-gray-600">Tenant:</span> {request.tenantName}</p>
                <p><span className="text-gray-600">Category:</span> {request.category}</p>
                <p><span className="text-gray-600">Submitted:</span> {request.dateSubmitted}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Status & Assignment</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Priority:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
                {request.assignedTo && (
                  <p><span className="text-gray-600">Assigned To:</span> {request.assignedTo}</p>
                )}
                {request.scheduledDate && (
                  <p><span className="text-gray-600">Scheduled:</span> {request.scheduledDate}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="bg-gray-50 p-4 rounded">{request.description}</p>
          </div>

          {request.images && request.images.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Images</h3>
              <div className="flex space-x-2">
                {request.images.map((image, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded">
                    <p className="text-sm">{image}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Updates</h3>
            <div className="space-y-4">
              {request.updates.map((update, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{update.author}</span>
                    <span className="text-gray-600">{update.date}</span>
                  </div>
                  <p>{update.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Add Update</h3>
            <div className="flex space-x-2">
              <textarea
                className="flex-1 p-2 border rounded"
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                placeholder="Enter update details..."
              />
              <button
                onClick={addUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const RequestCard = ({ request, getPriorityColor, onStatusUpdate, getStatusColor, setShowStatusModal, showStatusModal, setSelectedRequest, setShowDetailsModal, showDetailsModal }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-bold">{request.title}</h3>
        <p className="text-gray-600">{request.propertyName}</p>
      </div>
      <div className="flex space-x-2">
        <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(request.priority)}`}>
          {request.priority}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-sm text-gray-600">Category</p>
        <p className="font-semibold">{request.category}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Submitted</p>
        <p className="font-semibold">{request.dateSubmitted}</p>
      </div>
      {request.assignedTo && (
        <div>
          <p className="text-sm text-gray-600">Assigned To</p>
          <p className="font-semibold">{request.assignedTo}</p>
        </div>
      )}
      {request.estimatedCost && (
        <div>
          <p className="text-sm text-gray-600">Estimated Cost</p>
          <p className="font-semibold">${request.estimatedCost}</p>
        </div>
      )}
    </div>

    <div className="flex justify-between border-t pt-4">
      <button 
        onClick={() => {setSelectedRequest(request);
         setShowDetailsModal(!showDetailsModal)}}
        className="text-blue-600 hover:underline text-sm flex items-center"
      >
        <MessageSquare className="w-4 h-4 mr-1" />
        View Details
        {request.updates.length > 0 && (
          <span className="ml-1 bg-blue-100 text-blue-800 px-2 rounded-full">
            {request.updates.length}
          </span>
        )}
      </button>
      {request.status !== 'Completed' && (
          <button 
            onClick={() => setShowStatusModal(true)}
            className="text-green-600 hover:underline text-sm flex items-center"
          >
            <Settings className="w-4 h-4 mr-1" />
            Update Status
          </button>
        )}
    </div>
    <StatusUpdateModal 
        request={request}
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onUpdate={onStatusUpdate}
      />
  </div>
);


const StatusUpdateModal = ({ request, isOpen, onClose, onUpdate }) => {
  const [updateData, setUpdateData] = useState({
    status: request.status,
    assignedTo: request.assignedTo || '',
    notes: '',
    estimatedCost: request.estimatedCost || ''
  });

  const statusOptions = ['Pending', 'In Progress', 'Completed'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...request,
      status: updateData.status,
      assignedTo: updateData.assignedTo,
      estimatedCost: updateData.estimatedCost,
      updates: [
        ...request.updates,
        {
          date: new Date().toISOString().split('T')[0],
          author: 'Staff',
          content: `Status updated to ${updateData.status}${updateData.notes ? ': ' + updateData.notes : ''}`
        }
      ]
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Update Status</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select 
              className="w-full p-2 border rounded"
              value={updateData.status}
              onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Assigned To</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={updateData.assignedTo}
              onChange={(e) => setUpdateData({...updateData, assignedTo: e.target.value})}
              placeholder="Name of assignee"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estimated Cost ($)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={updateData.estimatedCost}
              onChange={(e) => setUpdateData({...updateData, estimatedCost: e.target.value})}
              placeholder="Enter estimated cost"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Update Notes</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              value={updateData.notes}
              onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
              placeholder="Add any relevant notes..."
            />
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
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};










const MaintenanceManagement = () => {

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeModule, setActiveModule] = useState('Maintenance')
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all');

 
  
  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Urgent': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-500',
      'Medium': 'text-yellow-500',
      'Low': 'text-green-500'
    };
    return colors[priority] || 'text-gray-500';
  };

  const handleStatusUpdate = (updatedRequest) => {
    setRequests(requests.map(request => 
      request.id === updatedRequest.id ? updatedRequest : request
    ));
  };


    

    

  return (
    <Navbar module={activeModule} >
      <div className="space-y-6">
      {/* Summary Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  {/* Total Requests */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm sm:text-base">Total Requests</p>
        <p className="text-xl sm:text-2xl font-bold mt-1">{requests.length}</p>
      </div>
      <WrenchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
    </div>
  </div>

  {/* In Progress */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm sm:text-base">In Progress</p>
        <p className="text-xl sm:text-2xl font-bold mt-1 text-blue-600">
          {requests.filter(r => r.status === 'In Progress').length}
        </p>
      </div>
      <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
    </div>
  </div>

  {/* High Priority */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm sm:text-base">High Priority</p>
        <p className="text-xl sm:text-2xl font-bold mt-1 text-red-600">
          {requests.filter(r => r.priority === 'High').length}
        </p>
      </div>
      <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
    </div>
  </div>

  {/* Completed */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm sm:text-base">Completed</p>
        <p className="text-xl sm:text-2xl font-bold mt-1 text-green-600">
          {requests.filter(r => r.status === 'Completed').length}
        </p>
      </div>
      <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
    </div>
  </div>
</div>

     
<div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
  {/* Left side - Action Button and Select */}
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => setShowNewRequestModal(true)}
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center text-sm sm:text-base transition-colors"
    >
      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 
      <span>New Request</span>
    </button>
    
    <select
      className="border rounded px-2 sm:px-4 py-2 text-sm sm:text-base min-w-[120px] bg-white"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <option value="all">All Requests</option>
      <option value="pending">Pending</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  </div>

  {/* Right side - Search and Filter */}
  <div className="flex gap-2 w-full sm:w-auto">
    <div className="relative flex-grow sm:flex-grow-0">
      <input
        placeholder="Search requests..."
        className="w-full sm:w-[200px] px-4 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <button 
      className="bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors flex-shrink-0"
      aria-label="Filter"
    >
      <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  </div>
</div>

    
      <div className="grid md:grid-cols-2 gap-6">
        {requests
          .filter(request => {
            if (filter === 'all') return true;
            return request.status.toLowerCase().replace(' ', '-') === filter;
          })
          .map(request => (
            <RequestCard key={request.id} onStatusUpdate={handleStatusUpdate} setShowStatusModal={setShowStatusModal} showStatusModal={showStatusModal} request={request} showDetailsModal={showDetailsModal} setShowDetailsModal={setShowDetailsModal} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} setSelectedRequest={setSelectedRequest}/>
          ))}
      </div>

      {/* Modals */}
      <NewRequestModal 
        isOpen={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
      />
      
      {showDetailsModal && (
        <RequestDetailsModal 
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
          request={selectedRequest}
          isOpen={showDetailsModal}
          setShowDetailsModal={setShowDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
    </Navbar>
 
)
};




  export default MaintenanceManagement