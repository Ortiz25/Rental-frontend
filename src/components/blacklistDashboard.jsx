import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';

const BlacklistDashboard = () => {
  const [stats, setStats] = useState({
    totalBlacklisted: 0,
    recentBlacklists: 0,
    severityBreakdown: {},
    commonReasons: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlacklistStats();
  }, []);

  const fetchBlacklistStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5020/api/tenants/blacklist-analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 200) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching blacklist stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'severe': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blacklist Analytics</h2>
        <button 
          onClick={fetchBlacklistStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Blacklisted</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalBlacklisted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-orange-600">{stats.recentBlacklists}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg. per Month</p>
              <p className="text-2xl font-bold text-yellow-600">
                {Math.round(stats.monthlyTrends?.reduce((a, b) => a + b.count, 0) / 12 || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Risk Prevention</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.preventedApplications || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Severity Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.severityBreakdown).map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(severity)}`}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className={`h-2 rounded-full ${
                        severity === 'severe' ? 'bg-red-600' :
                        severity === 'high' ? 'bg-red-500' :
                        severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${(count / stats.totalBlacklisted) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Reasons */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium mb-4">Most Common Reasons</h3>
          <div className="space-y-3">
            {stats.commonReasons.slice(0, 5).map((reason, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm">{reason.reason}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ 
                        width: `${(reason.count / stats.commonReasons[0]?.count) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-6">{reason.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium mb-4">Monthly Blacklist Trends</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {stats.monthlyTrends.map((month, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="bg-red-500 rounded-t min-h-[4px] w-full flex items-end justify-center text-white text-xs"
                style={{ height: `${Math.max((month.count / Math.max(...stats.monthlyTrends.map(m => m.count))) * 200, 4)}px` }}
              >
                {month.count > 0 && <span className="mb-1">{month.count}</span>}
              </div>
              <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                {month.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlacklistDashboard;