import React from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  Edit,
  ExternalLink,
} from "lucide-react";
import { formatDate, formatDateTime } from "../../utils/helperFunctions";

const InquiryDetailModal = ({ isOpen, onClose, inquiry, onUpdate, getStatusColor }) => {
  if (!isOpen || !inquiry) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Inquiry Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                inquiry.inquiry_status === "pending"
                  ? "bg-yellow-500 text-white border-yellow-600"
                  : inquiry.inquiry_status === "contacted"
                  ? "bg-blue-500 text-white border-blue-600"
                  : inquiry.inquiry_status === "scheduled"
                  ? "bg-purple-500 text-white border-purple-600"
                  : inquiry.inquiry_status === "completed"
                  ? "bg-green-500 text-white border-green-600"
                  : "bg-red-500 text-white border-red-600"
              }`}
            >
              {inquiry.inquiry_status.toUpperCase()}
            </span>
            <span className="text-sm text-blue-100">
              ID: #{inquiry.id}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Inquirer Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Inquirer Information
              </h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Full Name
                  </label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {inquiry.inquirer_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Preferred Contact
                  </label>
                  <p className="text-base font-semibold text-gray-900 mt-1 capitalize">
                    {inquiry.preferred_contact_method}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a
                    href={`mailto:${inquiry.inquirer_email}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {inquiry.inquirer_email}
                  </a>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a
                    href={`tel:${inquiry.inquirer_phone}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {inquiry.inquirer_phone}
                  </a>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Property Information
              </h3>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-200">
              <div>
                <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                  Property Name
                </label>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {inquiry.property_name}
                </p>
              </div>

              {inquiry.unit_number && (
                <div className="pt-3 border-t border-blue-200">
                  <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    Unit Number
                  </label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {inquiry.unit_number}
                  </p>
                </div>
              )}

              {inquiry.property_address && (
                <div className="pt-3 border-t border-blue-200">
                  <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    Address
                  </label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-base text-gray-900">
                      {inquiry.property_address}
                    </p>
                  </div>
                </div>
              )}

              {inquiry.property_type && (
                <div className="pt-3 border-t border-blue-200">
                  <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    Property Type
                  </label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {inquiry.property_type}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Message */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Message</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </p>
            </div>
          </div>

          {/* Dates and Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Timeline & Dates
              </h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Inquiry Submitted
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <p className="text-base text-gray-900">
                      {formatDateTime(inquiry.created_at)}
                    </p>
                  </div>
                </div>

                {inquiry.preferred_move_in_date && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Preferred Move-in Date
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <p className="text-base font-semibold text-gray-900">
                        {formatDate(inquiry.preferred_move_in_date)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {inquiry.contacted_at && (
                <div className="pt-3 border-t border-gray-200">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Contacted On
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-base text-gray-900">
                      {formatDateTime(inquiry.contacted_at)}
                    </p>
                  </div>
                </div>
              )}

              {inquiry.scheduled_viewing_at && (
                <div className="pt-3 border-t border-gray-200">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Scheduled Viewing
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <p className="text-base font-semibold text-gray-900">
                      {formatDateTime(inquiry.scheduled_viewing_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Information */}
          {(inquiry.assigned_to_name || inquiry.response_notes) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Assignment & Notes
                </h3>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 space-y-3 border border-purple-200">
                {inquiry.assigned_to_name && (
                  <div>
                    <label className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                      Assigned To
                    </label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {inquiry.assigned_to_name}
                    </p>
                  </div>
                )}

                {inquiry.response_notes && (
                  <div className="pt-3 border-t border-purple-200">
                    <label className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                      Response Notes
                    </label>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mt-2">
                      {inquiry.response_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500 flex items-center justify-between pt-4 border-t border-gray-200">
            <span>Last Updated: {formatDateTime(inquiry.updated_at)}</span>
            <span>Inquiry ID: #{inquiry.id}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white transition-all"
          >
            Close
          </button>
          <button
            onClick={onUpdate}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Update Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailModal;