import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, UserX, UserCheck, Loader2 } from 'lucide-react';

const ToggleUserStatusModal = ({ isOpen, onClose, user, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reason, setReason] = useState('');
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setShowSuccess(false);
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const isActivating = !user.is_active;
  const action = isActivating ? 'activate' : 'deactivate';
  const actionTitle = isActivating ? 'Activate' : 'Deactivate';

  const handleConfirm = async () => {
    setIsLoading(true);
    
    try {
      await onConfirm(user.id, user.is_active, reason);
      
      // Show success animation
      setShowSuccess(true);
      
      // Auto close after success animation
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      // Error handling is done in parent component
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100 animate-modal-enter"
      >
        {/* Success State */}
        {showSuccess ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-scale-in">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Success!
            </h3>
            <p className="text-gray-600">
              User has been {isActivating ? 'activated' : 'deactivated'} successfully.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${
              isActivating 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100' 
                : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isActivating 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    {isActivating ? (
                      <UserCheck className={`w-6 h-6 text-green-600`} />
                    ) : (
                      <UserX className={`w-6 h-6 text-red-600`} />
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {actionTitle} User
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* User Info Card */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-lg">
                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {user.role_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className={`flex items-start space-x-3 p-4 rounded-xl ${
                isActivating 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isActivating ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm mb-1 ${
                    isActivating ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    {isActivating ? 'Activate User Access' : 'Important Notice'}
                  </h4>
                  <p className={`text-sm ${
                    isActivating ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {isActivating 
                      ? 'This user will regain access to the system and be able to log in immediately.'
                      : 'This user will lose access to the system and will not be able to log in until reactivated. Any active sessions will be terminated.'}
                  </p>
                </div>
              </div>

              {/* Reason Input (optional for deactivation) */}
              {!isActivating && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Deactivation (Optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for deactivating this user..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Confirmation Question */}
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                <p className="text-sm font-medium text-gray-900">
                  Are you sure you want to {action} this user?
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                  isActivating
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {isActivating ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <UserX className="w-4 h-4" />
                    )}
                    <span>{actionTitle} User</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default ToggleUserStatusModal;