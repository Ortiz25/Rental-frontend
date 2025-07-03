import { Home, Users, Calendar, AlertCircle } from "lucide-react";

const EnhancedStats = ({ tenantStats }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold">{tenantStats.totalTenants}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Leases</p>
              <p className="text-2xl font-bold text-green-600">
                {tenantStats.activeLeases}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tenantStats.pendingPayments}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Expiring Leases (30 days)</p>
              <p className="text-2xl font-bold text-orange-600">
                {tenantStats.expiringLeases}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default EnhancedStats