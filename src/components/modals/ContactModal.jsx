import React, { useState } from "react";
import { X, Send, User, Mail, Phone, MessageSquare, CheckCircle, Loader } from "lucide-react";

const ContactModal = ({ isOpen, onClose, property, unit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    preferredContactMethod: "email",
    moveInDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/backend/api/vacancies/inquire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          propertyId: property.id,
          unitId: unit?.id,
        }),
      });

      const result = await response.json();

      if (result.status === 200 || result.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({
            name: "",
            email: "",
            phone: "",
            message: "",
            preferredContactMethod: "email",
            moveInDate: "",
          });
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to submit inquiry");
      }
    } catch (err) {
      console.error("Inquiry submission error:", err);
      setError(err.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Inquiry Submitted!
            </h3>
            <p className="text-gray-600">
              Thank you for your interest. We'll get back to you shortly.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Contact Property Owner
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {property?.propertyName}
                  {unit && ` - Unit ${unit.unit_number}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Property Details Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Property Type:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {property?.type}
                    </span>
                  </div>
                  {unit ? (
                    <>
                      <div>
                        <span className="text-gray-600">Unit:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {unit.unit_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bedrooms:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {unit.bedrooms}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rent:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          KES {unit.monthly_rent.toLocaleString()}/mo
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-600">Available Units:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {property?.vacantUnits?.length}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Rent Range:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          KES {Math.min(...(property?.vacantUnits?.map(u => u.monthly_rent) || [0])).toLocaleString()} - 
                          KES {Math.max(...(property?.vacantUnits?.map(u => u.monthly_rent) || [0])).toLocaleString()}/mo
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="+254 700 000000"
                  />
                </div>
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["email", "phone", "whatsapp"].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.preferredContactMethod === method
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="preferredContactMethod"
                        value={method}
                        checked={formData.preferredContactMethod === method}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium capitalize">
                        {method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Move-in Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Move-in Date
                </label>
                <input
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    placeholder="Tell us about yourself and why you're interested in this property..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactModal;