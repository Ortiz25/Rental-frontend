import React, { useState } from "react";
import maleImage from "../../assets/images/male.jpg"

import {
  MessageSquare,
  Bell,
  Send,
  Users,
  Search,
  Plus,
  Settings,
  X,
  Download,
  FileText,
  Upload,
  Eye,
  Filter,
  Star,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";






// Payment History Tab Component
const PaymentsTab = ({ tenant }) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Payment History</h4>
          <button className="text-blue-500 text-sm hover:underline flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download Statement
          </button>
        </div>
  
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tenant.paymentHistory?.map((payment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{payment.date}</td>
                  <td className="px-4 py-2">{payment.type}</td>
                  <td className="px-4 py-2">${payment.amount.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.status === 'Paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-blue-500 hover:text-blue-600">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-lg font-semibold text-green-600">
                ${tenant.paymentHistory?.reduce((sum, payment) => 
                  payment.status === 'Paid' ? sum + payment.amount : sum, 0
                ).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-lg font-semibold text-yellow-600">
                ${tenant.paymentHistory?.reduce((sum, payment) => 
                  payment.status === 'Pending' ? sum + payment.amount : sum, 0
                ).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Payment</p>
              <p className="text-lg font-semibold">${tenant.rentAmount}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Documents Tab Component
  const DocumentsTab = ({ tenant }) => {
    const documentTypes = {
      'lease': 'Lease Agreement',
      'id': 'Identification',
      'insurance': 'Insurance',
      'inspection': 'Property Inspection',
      'other': 'Other Documents'
    };
  
    const groupedDocuments = tenant.documents?.reduce((acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    }, {});
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Documents</h4>
          <button className="text-blue-500 text-sm hover:underline flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </button>
        </div>
  
        {Object.entries(groupedDocuments || {}).map(([type, docs]) => (
          <div key={type} className="space-y-2">
            <h5 className="text-sm font-medium text-gray-600">
              {documentTypes[type] || type}
            </h5>
            <div className="space-y-2">
              {docs.map((doc, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        Added on {new Date(doc.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-500 hover:text-blue-600"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
  
        {(!tenant.documents || tenant.documents.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No documents uploaded yet</p>
          </div>
        )}
      </div>
    );
  };



const TenantDetailsModal = ({ tenant, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('info');
  
    const renderInfoTab = () => (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
            <img 
              src={maleImage || '/api/placeholder/80/80'} 
              alt={tenant.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{tenant.name}</h3>
            <p className="text-gray-600">{tenant.propertyName}</p>
          </div>
        </div>
  
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-600">Contact Info</h4>
            <p className="mt-1">{tenant.email}</p>
            <p>{tenant.phone}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-600">Emergency Contact</h4>
            <p className="mt-1">{tenant.emergencyContact?.name}</p>
            <p>{tenant.emergencyContact?.phone}</p>
          </div>
        </div>
  
        <div>
          <h4 className="font-medium text-gray-600">Lease Details</h4>
          <div className="mt-1 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p>{new Date(tenant.leaseStart).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p>{new Date(tenant.leaseEnd).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Rent</p>
              <p>${tenant.rentAmount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Security Deposit</p>
              <p>${tenant.securityDeposit}</p>
            </div>
          </div>
        </div>
      </div>
    );
  
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">Tenant Details</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <div className="flex border-b">
            {['info', 'payments', 'documents'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
  
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {activeTab === 'info' && renderInfoTab()}
            {activeTab === 'payments' && <PaymentsTab tenant={tenant} />}
            {activeTab === 'documents' && <DocumentsTab tenant={tenant} />}
          </div>
        </div>
      </div>
    );
  };


  export default TenantDetailsModal