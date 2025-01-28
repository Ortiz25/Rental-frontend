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







const NewLeaseModal = ({ isOpen, onClose, onSubmit }) => {
    const [leaseData, setLeaseData] = useState({
      propertyName: '',
      tenantName: '',
      startDate: '',
      endDate: '',
      monthlyRent: '',
      securityDeposit: '',
      type: 'Fixed Term',
      terms: {
        petsAllowed: false,
        utilities: [],
        parkingSpaces: 0
      }
    });
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({
        ...leaseData,
        id: Date.now(),
        status: 'Active',
        documents: []
      });
      onClose();
    };
  
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-2/3 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">New Lease Agreement</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Property</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={leaseData.propertyName}
                  onChange={(e) => setLeaseData({...leaseData, propertyName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tenant Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={leaseData.tenantName}
                  onChange={(e) => setLeaseData({...leaseData, tenantName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={leaseData.startDate}
                  onChange={(e) => setLeaseData({...leaseData, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={leaseData.endDate}
                  onChange={(e) => setLeaseData({...leaseData, endDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Rent ($)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={leaseData.monthlyRent}
                  onChange={(e) => setLeaseData({...leaseData, monthlyRent: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Security Deposit ($)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={leaseData.securityDeposit}
                  onChange={(e) => setLeaseData({...leaseData, securityDeposit: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lease Type</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={leaseData.type}
                  onChange={(e) => setLeaseData({...leaseData, type: e.target.value})}
                >
                  <option>Fixed Term</option>
                  <option>Month-to-Month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Parking Spaces</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={leaseData.terms.parkingSpaces}
                  onChange={(e) => setLeaseData({
                    ...leaseData,
                    terms: {...leaseData.terms, parkingSpaces: e.target.value}
                  })}
                />
              </div>
            </div>
  
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={leaseData.terms.petsAllowed}
                  onChange={(e) => setLeaseData({
                    ...leaseData,
                    terms: {...leaseData.terms, petsAllowed: e.target.checked}
                  })}
                />
                <span className="text-sm font-medium">Pets Allowed</span>
              </label>
            </div>
  
            <div className="flex justify-end space-x-2 pt-4 border-t">
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
                Create Lease
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };


  export default NewLeaseModal