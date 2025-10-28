import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const ApplicationScreening = ({ applicantEmail, onScreeningComplete }) => {
  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(false);

  const screenApplicant = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5020/api/tenants/screen-applicant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: applicantEmail })
      });

      const result = await response.json();
      setScreening(result.data);
      onScreeningComplete(result.data);
    } catch (error) {
      console.error('Screening error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Applicant Screening</h3>
        <button
          onClick={screenApplicant}
          disabled={loading || !applicantEmail}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Screening...' : 'Run Screening'}
        </button>
      </div>

      {screening && (
        <div className="space-y-4">
          {/* Blacklist Check */}
          <div className={`p-4 rounded-lg border-l-4 ${
            screening.isBlacklisted ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
          }`}>
            <div className="flex items-center">
              {screening.isBlacklisted ? (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              )}
              <div>
                <h4 className="font-medium">
                  {screening.isBlacklisted ? 'BLACKLISTED TENANT' : 'Clean Record'}
                </h4>
                {screening.isBlacklisted && (
                  <div className="text-sm text-red-700 mt-1">
                    <p><strong>Reason:</strong> {screening.blacklistReason}</p>
                    <p><strong>Severity:</strong> {screening.blacklistSeverity?.toUpperCase()}</p>
                    <p><strong>Date:</strong> {new Date(screening.blacklistedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`p-4 rounded-lg ${
            screening.recommendation === 'approve' ? 'bg-green-50 border border-green-200' :
            screening.recommendation === 'review' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <h4 className="font-medium mb-2">Recommendation: {screening.recommendation.toUpperCase()}</h4>
            <p className="text-sm">{screening.recommendationReason}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationScreening