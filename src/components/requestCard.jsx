import React, { useState } from 'react';
import { 
  Camera, 
  Calendar, 
  Users, 
  User, 
  ArrowUpRight, 
  Settings,
  Clock,
  DollarSign,
  MapPin
} from 'lucide-react';
import { formatCurrency } from '../utils/helperFunctions';
import { StatusUpdateModal } from '../pages/MaintenanceMgt';


const RequestCard = ({
  request,
  onStatusUpdate,
  getPriorityColor,
  getStatusColor,
  setSelectedRequest,
  setShowDetailsModal,
  handleOpenDetails,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [imageError, setImageError] = useState({});

  // Priority color styles with gradients
  const priorityStyles = {
    emergency: {
      bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      border: '#ef4444',
      text: '#991b1b'
    },
    high: {
      bg: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
      border: '#f97316',
      text: '#9a3412'
    },
    medium: {
      bg: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)',
      border: '#eab308',
      text: '#854d0e'
    },
    low: {
      bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      border: '#3b82f6',
      text: '#1e40af'
    }
  };

  const getPriorityStyle = (priority) => {
    return priorityStyles[priority?.toLowerCase()] || priorityStyles.low;
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200/60">
      {/* Decorative gradient bar */}
      <div 
        className="h-1.5 w-full"
        style={{ 
          background: getPriorityStyle(request.priority).bg 
        }}
      />

      <div className="p-5 sm:p-6">
        {/* Header with Priority Badge */}
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {request.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="truncate font-medium">
                {request.property?.name || request.property}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-medium text-slate-700">
                Unit {request.unit?.number || request.unit}
              </span>
            </div>
          </div>
          
          {/* Priority Badge with enhanced styling */}
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex-shrink-0 border-2"
            style={{
              background: getPriorityStyle(request.priority).bg,
              borderColor: getPriorityStyle(request.priority).border,
              color: getPriorityStyle(request.priority).text
            }}
          >
            {request.priority?.toUpperCase()}
          </div>
        </div>

        {/* Category Badge with Icon */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border border-slate-200">
            <Settings className="w-3.5 h-3.5" />
            {request.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm sm:text-base mb-5 line-clamp-2 leading-relaxed">
          {request.description}
        </p>

        {/* Enhanced Photo Preview Section */}
        {request.photos && request.photos.length > 0 && (
          <div className="mb-5 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <Camera className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {request.photos.length} {request.photos.length === 1 ? "Photo" : "Photos"}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {request.photos.slice(0, 3).map((photo, index) => (
                <div key={photo.id} className="relative flex-shrink-0 group/photo">
                  <div className="relative overflow-hidden rounded-lg border-2 border-white shadow-sm">
                    <img
                      src={
                        imageError[photo.id]
                          ? '/placeholder-image.jpg'
                          : `/backend/maintenance/photos/${photo.id}/file`
                      }
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover cursor-pointer group-hover/photo:scale-110 transition-transform duration-300"
                      onClick={() => handleOpenDetails(request)}
                      onError={() => setImageError(prev => ({ ...prev, [photo.id]: true }))}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors duration-300" />
                  </div>
                  {photo.isBeforePhoto && (
                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                      Before
                    </span>
                  )}
                </div>
              ))}
              {request.photos.length > 3 && (
                <div
                  className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg border-2 border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:from-slate-200 hover:to-slate-100 transition-all duration-200 flex-shrink-0 shadow-sm"
                  onClick={() => handleOpenDetails(request)}
                >
                  <span className="text-xl font-bold text-slate-700">
                    +{request.photos.length - 3}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
            <div className="p-1.5 bg-white rounded-md">
              <Calendar className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 font-medium">Submitted</div>
              <div className="font-semibold text-slate-700 truncate">
                {request.dateSubmitted}
              </div>
            </div>
          </div>

          {/* Tenant */}
          <div className="flex items-center gap-2 text-sm bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
            <div className="p-1.5 bg-white rounded-md">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 font-medium">Tenant</div>
              <div className="font-semibold text-slate-700 truncate">
                {request.tenantName}
              </div>
            </div>
          </div>

          {/* Assigned To */}
          {(request.assignedTo || request.assignedToName) && (
            <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg px-3 py-2.5 border border-blue-100">
              <div className="p-1.5 bg-white rounded-md">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-blue-600 font-medium">Assigned To</div>
                <div className="font-semibold text-blue-700 truncate">
                  {request.assignedToName || request.assignedTo}
                </div>
              </div>
            </div>
          )}

          {/* Estimated Cost */}
          {request.estimatedCost > 0 && (
            <div className="flex items-center gap-2 text-sm bg-emerald-50 rounded-lg px-3 py-2.5 border border-emerald-100">
              <div className="p-1.5 bg-white rounded-md">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-emerald-600 font-medium">Est. Cost</div>
                <div className="font-bold text-emerald-700 truncate">
                  {formatCurrency(request.estimatedCost)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Badge - Enhanced */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: getStatusColor(request.status).includes('green') ? '#10b981' :
                           getStatusColor(request.status).includes('blue') ? '#3b82f6' :
                           getStatusColor(request.status).includes('yellow') ? '#eab308' :
                           getStatusColor(request.status).includes('red') ? '#ef4444' : '#6b7280',
              color: getStatusColor(request.status).includes('green') ? '#065f46' :
                     getStatusColor(request.status).includes('blue') ? '#1e40af' :
                     getStatusColor(request.status).includes('yellow') ? '#854d0e' :
                     getStatusColor(request.status).includes('red') ? '#991b1b' : '#374151'
            }}
          >
            <Clock className="w-4 h-4" />
            <span>
              {request.status
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenDetails(request)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => setShowStatusModal(true)}
            className="bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-700 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transform hover:-translate-y-0.5"
          >
            <Settings className="w-4 h-4" />
            Update
          </button>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <StatusUpdateModal
          request={request}
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onUpdate={onStatusUpdate}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
};

export default RequestCard;