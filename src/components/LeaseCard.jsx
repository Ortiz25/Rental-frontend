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

import LeaseDetailsModal from './modals/LeaseDetailModal';





const LeaseCard = ({ lease, onRenewal }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getStatusColor = (status) => {
        const colors = {
          'Active': 'bg-green-100 text-green-800',
          'Pending Renewal': 'bg-yellow-100 text-yellow-800',
          'Expired': 'bg-red-100 text-red-800',
          'Terminated': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
      };

    return  (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold">{lease.propertyName}</h3>
              <p className="text-gray-600">{lease.tenantName}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(lease.status)}`}>
              {lease.status}
            </span>
          </div>
    
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Lease Period</p>
              <p className="font-semibold">
                {new Date(lease.startDate).toLocaleDateString()} - 
                {new Date(lease.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Rent</p>
              <p className="font-semibold">${lease.monthlyRent}</p>
            </div>
          </div>
    
          <div className="flex justify-between items-center border-t pt-4">
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowDetails(true)}
                className="text-blue-600 hover:underline text-sm flex items-center"
              >
                <FileText className="w-4 h-4 mr-1" />
                View Details
              </button>
              {lease.status === 'Pending Renewal' && (
                <button 
                  onClick={() => setShowDetails(true)}
                  className="text-green-600 hover:underline text-sm flex items-center"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Process Renewal
                </button>
              )}
            </div>
          </div>
          <LeaseDetailsModal 
          lease={lease}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          onRenewal={onRenewal}
        />
        </div>
      );

  };

  export default LeaseCard