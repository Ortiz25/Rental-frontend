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
  Plus,
  X,
  Download,
  Edit,
  ArrowRight
} from 'lucide-react';



const LeaseDetailsModal = ({ lease, isOpen, onClose, onRenewal }) => {
    const [showRenewalForm, setShowRenewalForm] = useState(false);
    const [renewalData, setRenewalData] = useState({
      newEndDate: '',
      rentIncrease: 0,
      notes: ''
    });
  
    const calculateDaysRemaining = (endDate) => {
      const today = new Date();
      const end = new Date(endDate);
      const diff = end - today;
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };
  
    const RenewalForm = () => (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Process Renewal</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">New End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={renewalData.newEndDate}
              onChange={(e) => setRenewalData({...renewalData, newEndDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rent Increase ($)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={renewalData.rentIncrease}
              onChange={(e) => setRenewalData({...renewalData, rentIncrease: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              value={renewalData.notes}
              onChange={(e) => setRenewalData({...renewalData, notes: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowRenewalForm(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onRenewal({
                  ...lease,
                  endDate: renewalData.newEndDate,
                  monthlyRent: Number(lease.monthlyRent) + Number(renewalData.rentIncrease),
                  status: 'Active',
                  renewalNotes: renewalData.notes
                });
                onClose();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Confirm Renewal
            </button>
          </div>
        </div>
      </div>
    );
  
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-3/4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">Lease Details</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <div className="p-6">
            {/* Status Banner */}
            <div className={`mb-6 p-4 rounded-lg ${
              lease.status === 'Active' ? 'bg-green-50' :
              lease.status === 'Pending Renewal' ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Status: {lease.status}</p>
                  <p className="text-sm">
                    {calculateDaysRemaining(lease.endDate)} days remaining
                  </p>
                </div>
                {lease.status === 'Pending Renewal' && !showRenewalForm && (
                  <button
                    onClick={() => setShowRenewalForm(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Process Renewal
                  </button>
                )}
              </div>
            </div>
  
            {/* Main Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Property Details</h3>
                  <p>{lease.propertyName}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Tenant Information</h3>
                  <p>{lease.tenantName}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Lease Period</h3>
                  <p>{new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Financial Details</h3>
                  <p>Monthly Rent: ${lease.monthlyRent}</p>
                  <p>Security Deposit: ${lease.securityDeposit}</p>
                  {lease.terms.petsAllowed && <p>Pet Deposit: ${lease.terms.petDeposit}</p>}
                </div>
                <div>
                  <h3 className="font-semibold">Payment Schedule</h3>
                  <p>Due Date: {lease.paymentSchedule.dueDate}st of each month</p>
                  <p>Late Fee: ${lease.paymentSchedule.lateFeeAmount} after {lease.paymentSchedule.lateFeeAfter} days</p>
                </div>
              </div>
            </div>
  
            {/* Terms Section */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Lease Terms</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>Type: {lease.type}</p>
                    <p>Parking Spaces: {lease.terms.parkingSpaces}</p>
                  </div>
                  <div>
                    <p>Pets Allowed: {lease.terms.petsAllowed ? 'Yes' : 'No'}</p>
                    <p>Utilities Included: {lease.terms.utilities.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Documents Section */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Documents</h3>
              <div className="space-y-2">
                {lease.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{doc}</span>
                    <button className="text-blue-500 hover:text-blue-700">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
  
            {showRenewalForm && <RenewalForm />}
          </div>
        </div>
      </div>
    );
  };

  export default LeaseDetailsModal