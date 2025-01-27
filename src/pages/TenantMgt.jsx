import React, { useState } from 'react';
import { 
  UserPlus,
  UserMinus,
  AlertCircle,
  FileText,
  Check,
  X,
  Search,
  Filter,
  Download
} from 'lucide-react';
import Navbar from '../layout/navbar.jsx';


const initialTenants = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    propertyId: 1,
    propertyName: '123 Urban Loft, #304',
    leaseStart: '2023-06-01',
    leaseEnd: '2024-05-31',
    rentAmount: 2750,
    paymentStatus: 'Paid',
    lastPaymentDate: '2024-01-01',
    securityDeposit: 4125,
    creditScore: 725,
    status: 'Active',
    documents: ['lease_agreement.pdf', 'background_check.pdf'],
    paymentHistory: [
      { id: 1, date: '2024-01-01', amount: 2750, type: 'Rent', status: 'Paid' },
      { id: 2, date: '2023-12-01', amount: 2750, type: 'Rent', status: 'Paid' }
    ]
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '(555) 987-6543',
    propertyId: 2,
    propertyName: '456 Suburban Haven, Unit 12',
    leaseStart: '2023-09-01',
    leaseEnd: '2024-08-31',
    rentAmount: 3200,
    paymentStatus: 'Late',
    lastPaymentDate: '2023-12-15',
    securityDeposit: 4800,
    creditScore: 680,
    status: 'Warning',
    documents: ['lease_agreement.pdf'],
    paymentHistory: [
      { id: 3, date: '2023-12-15', amount: 3200, type: 'Rent', status: 'Late' },
      { id: 4, date: '2023-11-01', amount: 3200, type: 'Rent', status: 'Paid' }
    ]
  }
];

const generateReceipt = (tenant, payment) => {
  return `
    RENT PAYMENT RECEIPT
    
    Date: ${payment.date}
    Tenant: ${tenant.name}
    Property: ${tenant.propertyName}
    Amount: $${payment.amount}
    Payment Type: ${payment.type}
    Status: ${payment.status}
    
    Receipt ID: ${payment.id}
  `;
};

const TenantManagement = () => {
  const [tenants, setTenants] = useState(initialTenants);
  const [blacklistedTenants, setBlacklistedTenants] = useState([]);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  

  const handleBlacklist = (tenant, reason) => {
    const blacklistedTenant = {
      ...tenant,
      blacklistDate: new Date().toISOString(),
      blacklistReason: reason,
      status: 'Blacklisted'
    };

    setBlacklistedTenants([...blacklistedTenants, blacklistedTenant]);
    setTenants(tenants.filter(t => t.id !== tenant.id));
    setShowBlacklistModal(false);
    setBlacklistReason('');
  };


  const [activeModule, setActiveModule] = useState('Tenant Management')

  const TenantCard = ({ tenant }) => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold">{tenant.name}</h3>
          <p className="text-sm text-gray-600">{tenant.propertyName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          tenant.status === 'Active' ? 'bg-green-200 text-green-800' :
          tenant.status === 'Warning' ? 'bg-yellow-200 text-yellow-800' :
          'bg-red-200 text-red-800'
        }`}>
          {tenant.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm">Lease Period</p>
          <p className="font-semibold">{tenant.leaseStart} to {tenant.leaseEnd}</p>
        </div>
        <div>
          <p className="text-sm">Rent Amount</p>
          <p className="font-semibold">${tenant.rentAmount}/month</p>
        </div>
      </div>

      <div className="flex justify-between border-t pt-4">
        <button 
          onClick={() => {
            setSelectedTenant(tenant);
            setShowBlacklistModal(true);
          }}
          className="text-red-600 hover:underline text-sm"
        >
          Blacklist
        </button>
        <button 
          onClick={() => setSelectedTenant(tenant)}
          className="text-purple-600 hover:underline text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );

  const OnboardingForm = () =>

     (
        <div className="bg-white p-6 rounded-lg opacity-100">
          <h2 className="text-xl font-bold mb-4">New Tenant Onboarding</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Full Name" className="p-2 border rounded" />
              <input placeholder="Email" className="p-2 border rounded" />
              <input placeholder="Phone" className="p-2 border rounded" />
              <select className="p-2 border rounded">
                <option>Select Property</option>
                {/* Property options */}
              </select>
              <input type="date" placeholder="Lease Start" className="p-2 border rounded" />
              <input type="date" placeholder="Lease End" className="p-2 border rounded" />
              <input placeholder="Rent Amount" className="p-2 border rounded" />
              <input placeholder="Security Deposit" className="p-2 border rounded" />
            </div>
            <div className="flex justify-end space-x-2">
              <button className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
            </div>
          </form>
        </div>
      )
 ;

 const BlacklistModal = ({ tenant }) => (
  <div className="fixed inset-0 flex items-center  justify-center z-50">
    <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowBlacklistModal(false)} />
    <div className="relative bg-white p-6 rounded-lg shadow-xl w-96">
      <h2 className="text-xl font-bold mb-4 text-red-600">Blacklist Tenant</h2>
      <div className="space-y-4">
        <div>
          <p className="font-semibold">Tenant: {tenant?.name}</p>
          <p className="text-sm text-gray-600">Property: {tenant?.propertyName}</p>
        </div>
        <textarea 
          placeholder="Reason for blacklisting..."
          className="w-full p-2 border rounded"
          rows={4}
          value={blacklistReason}
          onChange={(e) => setBlacklistReason(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => setShowBlacklistModal(false)}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={() => handleBlacklist(tenant, blacklistReason)}
            className="bg-red-500 text-white px-4 py-2 rounded"
            disabled={!blacklistReason.trim()}
          >
            Confirm Blacklist
          </button>
        </div>
      </div>
    </div>
  </div>
);

const BlacklistedTenantsSection = () => (
  <div className="mt-8">
    <h2 className="text-xl font-bold mb-4">Blacklisted Tenants</h2>
    <div className="bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Previous Property</th>
            <th className="px-4 py-2 text-left">Blacklist Date</th>
            <th className="px-4 py-2 text-left">Reason</th>
          </tr>
        </thead>
        <tbody>
          {blacklistedTenants.map(tenant => (
            <tr key={tenant.id} className="border-t">
              <td className="px-4 py-2">{tenant.name}</td>
              <td className="px-4 py-2">{tenant.propertyName}</td>
              <td className="px-4 py-2">
                {new Date(tenant.blacklistDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">{tenant.blacklistReason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
  return (
    <Navbar module={activeModule} >
       <div className="space-y-6 z-40">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  {/* Total Tenants */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <p className="text-gray-600 text-sm sm:text-base truncate">Total Tenants</p>
    <p className="text-xl sm:text-2xl font-bold mt-1">{tenants.length}</p>
  </div>

  {/* Active Leases */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <p className="text-gray-600 text-sm sm:text-base truncate">Active Leases</p>
    <p className="text-xl sm:text-2xl font-bold mt-1 text-green-600">
      {tenants.filter(t => t.status === 'Active').length}
    </p>
  </div>

  {/* Pending Payments */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <p className="text-gray-600 text-sm sm:text-base truncate">Pending Payments</p>
    <p className="text-xl sm:text-2xl font-bold mt-1 text-yellow-600">
      {tenants.filter(t => t.paymentStatus === 'Late').length}
    </p>
  </div>

  {/* Expiring Leases */}
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <p className="text-gray-600 text-sm sm:text-base truncate">Expiring Leases (30 days)</p>
    <p className="text-xl sm:text-2xl font-bold mt-1 text-orange-600">2</p>
  </div>
</div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
  {/* Action Buttons */}
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => setShowOnboardingModal(true)}
      className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded flex items-center text-sm sm:text-base transition-colors"
    >
      <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      <span>Onboard Tenant</span>
    </button>
    
    <button 
      className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded flex items-center text-sm sm:text-base transition-colors"
    >
      <UserMinus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      <span>Offboard Tenant</span>
    </button>
  </div>

  {/* Search and Filter */}
  <div className="flex gap-2 w-full sm:w-auto">
    <div className="relative flex-grow sm:flex-grow-0">
      <input
        placeholder="Search tenants..."
        className="w-full sm:w-[250px] px-4 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
    </div>
    <button 
      className="bg-gray-200 hover:bg-gray-300 p-2 rounded transition-colors flex-shrink-0"
      aria-label="Filter"
    >
      <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  </div>
</div>

      {/* Tenant Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {tenants.map(tenant => (
          <TenantCard key={tenant.id} tenant={tenant}  />
        ))}
      </div>

      {/* Modals */}
      {showOnboardingModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowOnboardingModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl">
            <OnboardingForm />
          </div>
        </div>
      )}

      {/* Blacklist Modal */}
      {showBlacklistModal && <BlacklistModal tenant={selectedTenant} />}
       {/* Blacklisted Tenants Section */}
       <BlacklistedTenantsSection />
    </div>
    </Navbar>
 
)
} ;



  export default TenantManagement