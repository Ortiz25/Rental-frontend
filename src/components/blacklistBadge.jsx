import React from 'react';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

const BlacklistBadge = ({ tenant, size = 'sm', showTooltip = true }) => {
  if (!tenant?.isBlacklisted) return null;

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'low':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Low Risk'
        };
      case 'medium':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: AlertTriangle,
          label: 'Medium Risk'
        };
      case 'high':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          label: 'High Risk'
        };
      case 'severe':
        return {
          color: 'bg-red-200 text-red-900 border-red-300',
          icon: Shield,
          label: 'Severe Risk'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertTriangle,
          label: 'Blacklisted'
        };
    }
  };

  const config = getSeverityConfig(tenant.blacklistSeverity);
  const Icon = config.icon;
  
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className="relative group">
      <span className={`
        inline-flex items-center rounded-full border font-medium
        ${config.color} ${sizeClasses[size]}
      `}>
        <Icon className={`mr-1 ${iconSizes[size]}`} />
        BLACKLISTED
      </span>
      
      {showTooltip && (
        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
          <div className="font-medium">{config.label}</div>
          <div className="text-gray-300">{tenant.blacklistReason}</div>
          {tenant.blacklistedDate && (
            <div className="text-gray-400">
              Since: {new Date(tenant.blacklistedDate).toLocaleDateString()}
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default BlacklistBadge;