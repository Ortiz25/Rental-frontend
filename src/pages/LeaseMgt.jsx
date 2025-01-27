import React, { useState } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Plus,X
} from 'lucide-react';
import NewLeaseModal from '../components/NewLeaseModal.jsx';

const initialLeases = [
  {
    id: 1,
    propertyName: "123 Urban Loft, #304",
    tenantName: "John Doe",
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    monthlyRent: 2750,
    securityDeposit: 4125,
    status: "Active",
    type: "Fixed Term",
    renewalOption: true,
    nextRenewalDate: "2024-03-01",
    documents: ["lease_agreement.pdf", "addendum.pdf"],
    terms: {
      petsAllowed: true,
      petDeposit: 500,
      utilities: ["Water", "Internet"],
      parkingSpaces: 1
    },
    paymentSchedule: {
      dueDate: 1,
      lateFeeAfter: 5,
      lateFeeAmount: 100
    }
  },
  {
    id: 2,
    propertyName: "456 Suburban Haven, Unit 12",
    tenantName: "Jane Smith",
    startDate: "2023-09-01",
    endDate: "2024-08-31",
    monthlyRent: 3200,
    securityDeposit: 4800,
    status: "Pending Renewal",
    type: "Fixed Term",
    renewalOption: true,
    nextRenewalDate: "2024-06-01",
    documents: ["lease_agreement.pdf"],
    terms: {
      petsAllowed: false,
      utilities: ["All Inclusive"],
      parkingSpaces: 2
    },
    paymentSchedule: {
      dueDate: 1,
      lateFeeAfter: 5,
      lateFeeAmount: 150
    }
  }
];
import Navbar from '../layout/navbar.jsx';
import LeaseCard from '../components/LeaseCard.jsx';





const LeaseManagement = () =>{
  const [showDetails, setShowDetails] = useState(false);
  const [activeModule, setActiveModule] = useState('Lease Management')
  const [leases, setLeases] = useState(initialLeases);
  const [selectedLease, setSelectedLease] = useState(null);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [showNewLeaseModal, setShowNewLeaseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  
  const handleRenewal = (updatedLease) => {
    setLeases(leases.map(lease => 
      lease.id === updatedLease.id ? updatedLease : lease
    ));
  };
  const handleNewLease = (leaseData) => {
    setLeases([...leases, leaseData]);
  };

  

  

  return (
    <Navbar module={activeModule} >
       <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  {/* Active Leases */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm sm:text-base">Active Leases</p>
        <p className="text-xl sm:text-2xl font-bold mt-1">
          {leases.filter(l => l.status === 'Active').length}
        </p>
      </div>
      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
    </div>
  </div>

  {/* Pending Renewals */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm sm:text-base">Pending Renewals</p>
        <p className="text-xl sm:text-2xl font-bold mt-1">
          {leases.filter(l => l.status === 'Pending Renewal').length}
        </p>
      </div>
      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
    </div>
  </div>

  {/* Expiring Soon */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm sm:text-base">Expiring Soon</p>
        <p className="text-xl sm:text-2xl font-bold mt-1">2</p>
      </div>
      <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
    </div>
  </div>

  {/* Monthly Revenue */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm sm:text-base">Monthly Revenue</p>
        <p className="text-xl sm:text-2xl font-bold mt-1">
          ${leases.reduce((sum, lease) => sum + lease.monthlyRent, 0).toLocaleString()}
        </p>
      </div>
      <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
    </div>
  </div>
</div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
  {/* New Lease Button */}
  <div>
    <button
      onClick={() => setShowNewLeaseModal(true)}
      className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center justify-center sm:justify-start text-sm sm:text-base transition-colors"
    >
      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      <span>New Lease</span>
    </button>
  </div>

  {/* Search and Filter */}
  <div className="flex gap-2 w-full sm:w-auto">
    <div className="relative flex-grow sm:flex-grow-0">
      <input
        type="text"
        placeholder="Search leases..."
        className="w-full sm:w-[250px] pl-9 pr-4 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <Search 
        className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" 
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

      <NewLeaseModal 
        isOpen={showNewLeaseModal}
        onClose={() => setShowNewLeaseModal(false)}
        onSubmit={handleNewLease}
      />

       
      {/* Lease Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {leases
          .filter(lease => 
            lease.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lease.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(lease => (
            <LeaseCard 
              key={lease.id} 
              lease={lease}
              onRenewal={handleRenewal}
            />
          ))
        }
      </div>
    </div>
    </Navbar>
 
)
} ;




  export default LeaseManagement