import React, { useState, useEffect } from 'react';
import { Calendar, User, FileText, AlertTriangle } from 'lucide-react';

const BlacklistHistory = ({ tenantId, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tenantId) {
      fetchBlacklistHistory();
    }
  }, [isOpen, tenantId]);

  const fetchBlacklistHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/backend/api/tenants/${tenantId}/blacklist-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 200) {
        setHistory(result.data);
      }
    } catch (error) {
      console.error('Error fetching blacklist history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'blacklisted': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'removed': return <User className="h-4 w-4 text-green-500" />;
      case 'updated': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'note_added': return <FileText className="h-4 w-4 text-gray-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'blacklisted': return 'border-l-red-500 bg-red-50';
      case 'removed': return 'border-l-green-500 bg-green-50';
      case 'updated': return 'border-l-blue-500 bg-blue-50';
      case 'note_added': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center ">
      <div className='fixed inset-0  bg-black opacity-50'></div>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden z-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Blacklist History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No blacklist history found</div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={entry.id} className={`border-l-4 pl-4 py-3 ${getActionColor(entry.action)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(entry.action)}
                      <div>
                        <div className="font-medium capitalize">
                          {entry.action.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-600">
                          by {entry.performed_by} • {new Date(entry.performed_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {entry.severity && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.severity === 'severe' ? 'bg-red-100 text-red-800' :
                        entry.severity === 'high' ? 'bg-red-50 text-red-700' :
                        entry.severity === 'medium' ? 'bg-orange-50 text-orange-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        {entry.severity.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {entry.reason && (
                    <div className="mt-2 text-sm">
                      <strong>Reason:</strong> {entry.reason}
                    </div>
                  )}
                  
                  {entry.notes && (
                    <div className="mt-1 text-sm text-gray-600">
                      <strong>Notes:</strong> {entry.notes}
                    </div>
                  )}
                  
                  {entry.evidence_documents && entry.evidence_documents.length > 0 && (
                    <div className="mt-2">
                      <strong className="text-sm">Evidence:</strong>
                      <ul className="text-sm text-blue-600 mt-1">
                        {entry.evidence_documents.map((doc, i) => (
                          <li key={i}>• {doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlacklistHistory;