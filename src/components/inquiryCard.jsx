import React, { useState } from "react";
import {
  Eye,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  MapPin,
  User,
  Building2,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "../utils/helperFunctions";

const InquiryCard = ({ inquiry, onViewDetails, onUpdate, onQuickStatusUpdate, getStatusColor }) => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getContactMethodIcon = (method) => {
    switch (method) {
      case "email":
        return <Mail className="w-4 h-4 text-blue-600" />;
      case "phone":
        return <Phone className="w-4 h-4 text-green-600" />;
      case "whatsapp":
        return <Phone className="w-4 h-4 text-green-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityIndicator = (createdAt) => {
    const daysSince = Math.floor(
      (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSince > 7) {
      return (
        <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {daysSince} days old
        </span>
      );
    } else if (daysSince > 3) {
      return (
        <span className="text-xs text-yellow-600 font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {daysSince} days old
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {inquiry.inquirer_name}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {getContactMethodIcon(inquiry.preferred_contact_method)}
              <span className="capitalize">{inquiry.preferred_contact_method}</span>
            </div>
          </div>
          
          {/* Status Badge */}
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
              inquiry.inquiry_status
            )}`}
          >
            {inquiry.inquiry_status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Property Information */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-start gap-2 mb-2">
            <Building2 className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 line-clamp-1">
                {inquiry.property_name}
              </div>
              {inquiry.unit_number && (
                <div className="text-sm text-gray-600">
                  Unit {inquiry.unit_number}
                </div>
              )}
              {inquiry.property_address && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="line-clamp-1">{inquiry.property_address}</span>
                </div>
              )}
            </div>
          </div>
          {inquiry.property_type && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Type:</span> {inquiry.property_type}
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <a
              href={`mailto:${inquiry.inquirer_email}`}
              className="text-blue-600 hover:text-blue-800 hover:underline line-clamp-1"
            >
              {inquiry.inquirer_email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <a
              href={`tel:${inquiry.inquirer_phone}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {inquiry.inquirer_phone}
            </a>
          </div>
        </div>

        {/* Message Preview */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 line-clamp-3">
              {inquiry.message}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(inquiry.created_at)}</span>
          </div>
          {getPriorityIndicator(inquiry.created_at)}
        </div>

        {/* Move-in Date */}
        {inquiry.preferred_move_in_date && (
          <div className="text-xs text-gray-600 bg-blue-50 rounded-lg p-2 border border-blue-200">
            <span className="font-medium">Preferred Move-in:</span>{" "}
            {formatDate(inquiry.preferred_move_in_date)}
          </div>
        )}

        {/* Assignment Info */}
        {inquiry.assigned_to_name && (
          <div className="text-xs text-gray-600 bg-purple-50 rounded-lg p-2 border border-purple-200">
            <span className="font-medium">Assigned to:</span>{" "}
            {inquiry.assigned_to_name}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-5 py-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(inquiry)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-sm"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-all shadow-sm"
              title="Quick Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Quick Actions Dropdown */}
            {showQuickActions && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                <button
                  onClick={() => {
                    onUpdate(inquiry);
                    setShowQuickActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Edit Details
                </button>
                
                {inquiry.inquiry_status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        onQuickStatusUpdate(inquiry.id, "contacted");
                        setShowQuickActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Mark as Contacted
                    </button>
                    <button
                      onClick={() => {
                        onQuickStatusUpdate(inquiry.id, "scheduled");
                        setShowQuickActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Viewing
                    </button>
                  </>
                )}

                {(inquiry.inquiry_status === "contacted" || inquiry.inquiry_status === "scheduled") && (
                  <button
                    onClick={() => {
                      onQuickStatusUpdate(inquiry.id, "completed");
                      setShowQuickActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Completed
                  </button>
                )}

                {inquiry.inquiry_status !== "rejected" && inquiry.inquiry_status !== "completed" && (
                  <button
                    onClick={() => {
                      onQuickStatusUpdate(inquiry.id, "rejected");
                      setShowQuickActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Inquiry
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryCard;