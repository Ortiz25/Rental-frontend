import React, { useState, useEffect } from "react";
import maleImage from "../../assets/images/male.jpg"
import { formatCurrency } from "../../utils/helperFunctions";

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


const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};



// Payment History Tab Component
const PaymentsTab = ({ tenant }) => {
  console.log(tenant)
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Payment History</h4>
          {/* <button className="text-blue-500 text-sm hover:underline flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download Statement
          </button> */}
        </div>
  
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                {/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tenant.paymentHistory?.map((payment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{formatDate(payment.date)}</td>
                  <td className="px-4 py-2">{payment.type}</td>
                  <td className="px-4 py-2">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.status === 'Paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  {/* <td className="px-4 py-2">
                    <button className="text-blue-500 hover:text-blue-600">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td> */}
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
                {formatCurrency(tenant.paymentHistory?.reduce((sum, payment) => 
                  payment.status === 'Paid' ? sum + payment.amount : sum, 0
                ))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-lg font-semibold text-yellow-600">
                {formatCurrency(tenant.paymentHistory?.reduce((sum, payment) => 
                  payment.status === 'Pending' ? sum + payment.amount : sum, 0
                ))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Payment</p>
              <p className="text-lg font-semibold">{formatCurrency(tenant.rentAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Documents Tab Component
  const DocumentsTab = ({ tenant }) => {
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadForm, setUploadForm] = useState({
      files: null,
      documentType: 'ID Copy',
      documentName: '',
      description: ''
    });
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch documents when component loads
    useEffect(() => {
      fetchDocuments();
    }, [tenant.id]);

    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5020/api/tenants/${tenant.id}/documents`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (result.status === 200) {
          setDocuments(result.data);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const documentTypes = {
      'ID Copy': 'Identification',
      'Income Proof': 'Income Proof',
      'Employment Letter': 'Employment Letter',
      'Bank Statement': 'Bank Statement',
      'Credit Report': 'Credit Report',
      'Reference Letter': 'Reference Letter',
      'Lease Agreement': 'Lease Agreement',
      'Paystub': 'Paystub',
      'Tax Return': 'Tax Return',
      'Utility Bill': 'Utility Bill',
      'Other': 'Other Documents'
    };

    const handleFileSelect = (e) => {
      setUploadForm({ ...uploadForm, files: e.target.files });
    };

    const handleDownload = async (documentId, documentName) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5020/api/tenants/documents/${documentId}/download`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Download failed');
        }

        // Create blob from response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentName;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download document');
      }
    };

    const handleView = async (documentId, documentName, mimeType) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5020/api/tenants/documents/${documentId}/view`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('View failed');
        }

        // Create blob from response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Open in new tab for supported file types
        if (mimeType?.includes('pdf') || mimeType?.includes('image')) {
          window.open(url, '_blank');
        } else {
          // For other types, trigger download
          handleDownload(documentId, documentName);
        }
      } catch (error) {
        console.error('View error:', error);
        alert('Failed to view document');
      }
    };

    const handleUpload = async () => {
      if (!uploadForm.files || uploadForm.files.length === 0) {
        alert('Please select at least one file');
        return;
      }

      setUploading(true);
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        
        // Append all files
        Array.from(uploadForm.files).forEach(file => {
          formData.append('files', file);
        });
        
        formData.append('tenant_id', tenant.id);
        formData.append('category', uploadForm.documentType);
        formData.append('document_name', uploadForm.documentName || uploadForm.files[0].name);
        formData.append('description', uploadForm.description);

        const response = await fetch('http://localhost:5020/api/tenants/tenant/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const result = await response.json();

        if (result.status === 201) {
          alert('Documents uploaded successfully!');
          setShowUploadModal(false);
          setUploadForm({
            files: null,
            documentType: 'ID Copy',
            documentName: '',
            description: ''
          });
          // Refresh documents list
          await fetchDocuments();
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload documents: ${error.message}`);
      } finally {
        setUploading(false);
      }
    };

    const groupedDocuments = documents?.reduce((acc, doc) => {
      const type = doc.type || 'Other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(doc);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Documents</h4>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="text-blue-500 text-sm hover:underline flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading documents...</p>
          </div>
        ) : (
          <>
            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowUploadModal(false)} />
                <div className="relative bg-white p-6 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">Upload Documents</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Document Type</label>
                      <select
                        value={uploadForm.documentType}
                        onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        {Object.keys(documentTypes).map(type => (
                          <option key={type} value={type}>{documentTypes[type]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Document Name (Optional)</label>
                      <input
                        type="text"
                        value={uploadForm.documentName}
                        onChange={(e) => setUploadForm({ ...uploadForm, documentName: e.target.value })}
                        placeholder="Enter document name"
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                      <textarea
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                        placeholder="Enter description"
                        rows={3}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Select Files</label>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.txt,.csv"
                        onChange={handleFileSelect}
                        className="w-full p-2 border rounded"
                      />
                      {uploadForm.files && (
                        <p className="text-sm text-gray-500 mt-2">
                          {uploadForm.files.length} file(s) selected
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      disabled={uploading || !uploadForm.files}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                            Added on {new Date(doc.date || doc.uploadedAt).toLocaleDateString()}
                            {doc.uploadedBy && ` by ${doc.uploadedBy}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-500 hover:text-blue-600"
                          title="Download"
                          onClick={() => handleDownload(doc.id, doc.name)}
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          title="View"
                          onClick={() => handleView(doc.id, doc.name, doc.mimeType)}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {(!documents || documents.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No documents uploaded yet</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 text-blue-500 hover:text-blue-600 text-sm"
                >
                  Upload your first document
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };



const TenantDetailsModal = ({ tenant, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('info');
    console.log(tenant)
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
              <p>{formatCurrency(tenant.rentAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Security Deposit</p>
              <p>{formatCurrency(tenant.securityDeposit)}</p>
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