import React, { useState } from "react";
import { 
  X, 
  Calendar, 
  DollarSign, 
  Key, 
  FileText, 
  MapPin,
  CreditCard,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Droplet,
  Flame,
  Wifi,
  Info
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/helperFunctions";

const OffboardingDetailsModal = ({ details, tenant, onClose }) => {
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');
  const [expandedPayments, setExpandedPayments] = useState(new Set());

  if (!details) return null;

  console.log(details, tenant);

  // Payment history data from tenant object
  const paymentHistory = tenant.paymentHistory || [];

  // Toggle payment detail expansion
  const togglePaymentExpansion = (paymentId) => {
    const newExpanded = new Set(expandedPayments);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedPayments(newExpanded);
  };

  // Process payment history
  const getPaymentStats = () => {
    const totalPaid = paymentHistory.reduce((sum, payment) => 
      payment.status === 'Paid' ? sum + (payment.amount || 0) : sum, 0
    );
    const totalDue = paymentHistory.reduce((sum, payment) => 
      sum + (payment.amountDue || 0), 0
    );
    const totalUtilities = paymentHistory.reduce((sum, payment) => 
      sum + (payment.utilitiesCharges || 0), 0
    );
    const paidCount = paymentHistory.filter(p => p.status === 'Paid').length;
    const lateCount = paymentHistory.filter(p => p.status === 'Late').length;
    const writtenOffCount = paymentHistory.filter(p => p.status === 'Written Off').length;

    return {
      totalPaid,
      totalDue,
      totalUtilities,
      paidCount,
      lateCount,
      writtenOffCount,
      totalPayments: paymentHistory.length,
      paymentRate: paymentHistory.length > 0 
        ? ((paidCount / paymentHistory.length) * 100).toFixed(1) 
        : 0
    };
  };

  // Get unique years for filter
  const getYears = () => {
    const years = [...new Set(paymentHistory.map(p => 
      new Date(p.dueDate).getFullYear()
    ))].sort((a, b) => b - a);
    return years;
  };

  // Filter payments based on selected year
  const getFilteredPayments = () => {
    if (selectedYear === 'all') {
      return paymentHistory;
    }
    return paymentHistory.filter(p => 
      new Date(p.dueDate).getFullYear() === parseInt(selectedYear)
    );
  };

  const stats = getPaymentStats();
  const years = getYears();
  const filteredPayments = getFilteredPayments();
  const displayPayments = showAllPayments ? filteredPayments : filteredPayments.slice(0, 5);

  // Get status icon and color
  const getStatusDisplay = (status) => {
    const displays = {
      'Paid': {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      'Late': {
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      'Pending': {
        icon: <Clock className="w-4 h-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      'Written Off': {
        icon: <XCircle className="w-4 h-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    };
    return displays[status] || displays['Pending'];
  };

  // Get utility icon
  const getUtilityIcon = (type) => {
    const icons = {
      'electricity': <Zap className="w-3.5 h-3.5" />,
      'water': <Droplet className="w-3.5 h-3.5" />,
      'gas': <Flame className="w-3.5 h-3.5" />,
      'internet': <Wifi className="w-3.5 h-3.5" />,
      'other': <Info className="w-3.5 h-3.5" />
    };
    return icons[type?.toLowerCase()] || icons['other'];
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <div>
            <h2 className="text-2xl font-bold text-orange-900">Offboarding Details</h2>
            <p className="text-sm text-orange-700 mt-1">{tenant.name}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 hover:bg-white rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Move-out Information */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
            <h3 className="font-semibold mb-4 flex items-center text-blue-900">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Move-out Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Move-out Date</p>
                <p className="font-semibold text-gray-900">{formatDate(details.moveOutDate)}</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Processed By</p>
                <p className="font-semibold text-gray-900">{details.processedBy || 'System'}</p>
              </div>
            </div>
          </div>

          {/* Payment History Section */}
          {paymentHistory.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center text-purple-900">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                  Payment History
                </h3>
                {years.length > 1 && (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="text-sm border border-purple-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Payment Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Paid</p>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(stats.totalPaid)}</p>
                  <p className="text-xs text-gray-600 mt-1">{stats.paidCount} payments</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Due</p>
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(stats.totalDue)}</p>
                  <p className="text-xs text-gray-600 mt-1">{stats.totalPayments} months</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-cyan-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Utilities</p>
                    <Zap className="w-4 h-4 text-cyan-600" />
                  </div>
                  <p className="text-lg font-bold text-cyan-700">{formatCurrency(stats.totalUtilities)}</p>
                  <p className="text-xs text-gray-600 mt-1">Total charges</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Late Payments</p>
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-lg font-bold text-orange-700">{stats.lateCount}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.totalPayments > 0 ? ((stats.lateCount / stats.totalPayments) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Rate</p>
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-purple-700">{stats.paymentRate}%</p>
                  <p className="text-xs text-gray-600 mt-1">On-time rate</p>
                </div>
              </div>

              {/* Payment List */}
              <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50 border-b border-purple-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                          Rent
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                          Utilities
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                          Total Due
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                          Paid
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {displayPayments.length > 0 ? (
                        displayPayments.map((payment, index) => {
                          const statusDisplay = getStatusDisplay(payment.status);
                          const isExpanded = expandedPayments.has(payment.id);
                          const hasUtilities = payment.utilitiesCharges > 0;
                          const rentAmount = (payment.amount || 0) - (payment.utilitiesCharges || 0);
                          
                          return (
                            <React.Fragment key={payment.id || index}>
                              <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                  {formatDate(payment.dueDate)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {formatCurrency(rentAmount)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {hasUtilities ? (
                                    <span className="text-cyan-700 font-medium flex items-center gap-1">
                                      <Zap className="w-3.5 h-3.5" />
                                      {formatCurrency(payment.utilitiesCharges)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                  {formatCurrency(payment.amountDue || 0)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-green-700">
                                      {formatCurrency(payment.amount || 0)}
                                    </span>
                                    {payment.lateFee > 0 && (
                                      <span className="text-xs text-orange-600">
                                        +{formatCurrency(payment.lateFee)} fee
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  <span className="truncate max-w-[120px] inline-block" title={payment.method}>
                                    {payment.method || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.color} border ${statusDisplay.borderColor}`}>
                                    {statusDisplay.icon}
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {(hasUtilities || payment.utilitiesBreakdown) && (
                                    <button
                                      onClick={() => togglePaymentExpansion(payment.id)}
                                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-full p-1 transition-colors"
                                      title="View utilities breakdown"
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </button>
                                  )}
                                </td>
                              </tr>
                              
                              {/* Expanded Utilities Breakdown Row */}
                              {isExpanded && (hasUtilities || payment.utilitiesBreakdown) && (
                                <tr className="bg-cyan-50">
                                  <td colSpan="8" className="px-4 py-4">
                                    <div className="flex items-start gap-3 ml-8">
                                      <div className="bg-cyan-100 rounded-full p-2">
                                        <Zap className="w-4 h-4 text-cyan-700" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-cyan-900 mb-3">
                                          Utilities Breakdown
                                        </h4>
                                        
                                        {payment.utilitiesBreakdown ? (
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {Object.entries(payment.utilitiesBreakdown).map(([utility, amount]) => (
                                              <div key={utility} className="bg-white rounded-lg p-3 border border-cyan-200">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="text-cyan-600">
                                                    {getUtilityIcon(utility)}
                                                  </span>
                                                  <span className="text-xs text-gray-600 capitalize">
                                                    {utility}
                                                  </span>
                                                </div>
                                                <p className="text-sm font-bold text-cyan-700">
                                                  {formatCurrency(amount)}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="bg-white rounded-lg p-3 border border-cyan-200 inline-block">
                                            <div className="flex items-center gap-2">
                                              <Zap className="w-4 h-4 text-cyan-600" />
                                              <span className="text-sm text-gray-700">Total Utilities:</span>
                                              <span className="text-sm font-bold text-cyan-700">
                                                {formatCurrency(payment.utilitiesCharges)}
                                              </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                              Breakdown not available
                                            </p>
                                          </div>
                                        )}
                                        
                                        {/* Payment Notes if available */}
                                        {payment.notes && (
                                          <div className="mt-3 bg-white rounded-lg p-3 border border-cyan-200">
                                            <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
                                            <p className="text-xs text-gray-600">{payment.notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                            No payment records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Show More/Less Button */}
                {filteredPayments.length > 5 && (
                  <div className="border-t border-purple-200 bg-purple-50">
                    <button
                      onClick={() => setShowAllPayments(!showAllPayments)}
                      className="w-full py-3 text-sm font-medium text-purple-700 hover:text-purple-900 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                    >
                      {showAllPayments ? (
                        <>
                          Show Less
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Show All {filteredPayments.length} Payments
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Written Off Notice */}
              {stats.writtenOffCount > 0 && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      {stats.writtenOffCount} payment{stats.writtenOffCount > 1 ? 's' : ''} written off
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      These payments were marked as bad debt during offboarding
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Forwarding Address */}
          {details.confirmAddress && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
              <h3 className="font-semibold mb-3 flex items-center text-green-900">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Forwarding Address
              </h3>
              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-700">{details.confirmAddress}</p>
              </div>
            </div>
          )}

          {/* Security Deposit Settlement */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-5 border border-emerald-200">
            <h3 className="font-semibold mb-4 flex items-center text-emerald-900">
              <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
              Security Deposit Settlement
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 flex justify-between items-center border border-emerald-200">
                <span className="text-gray-700 font-medium">Refund Amount</span>
                <span className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(details.depositRefund)}
                </span>
              </div>
              
              {details.deductions && details.deductions.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                    Deductions
                  </p>
                  <div className="space-y-2">
                    {details.deductions.map((deduction, index) => (
                      <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                        <span className="text-gray-700">{deduction.description}</span>
                        <span className="font-semibold text-red-600">
                          -{formatCurrency(deduction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center font-bold mt-3 pt-3 border-t-2 border-red-300">
                    <span className="text-gray-900">Total Deductions</span>
                    <span className="text-red-700 text-lg">
                      -{formatCurrency(details.totalDeductions || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Keys Returned */}
          {details.keyReturn && (
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200">
              <h3 className="font-semibold mb-4 flex items-center text-yellow-900">
                <Key className="w-5 h-5 mr-2 text-yellow-600" />
                Keys Returned
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(details.keyReturn).map(([type, count]) => (
                  <div key={type} className="bg-white rounded-lg p-3 border border-yellow-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 capitalize">
                      {type.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-2xl font-bold text-yellow-700">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspection Findings */}
          {details.inspectionFindings && (
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-5 border border-indigo-200">
              <h3 className="font-semibold mb-3 flex items-center text-indigo-900">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Inspection Findings
              </h3>
              <div className="bg-white rounded p-4 border border-indigo-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {details.inspectionFindings}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {details.notes && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200">
              <h3 className="font-semibold mb-3 flex items-center text-gray-900">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Additional Notes
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {details.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t bg-gradient-to-r from-gray-50 to-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OffboardingDetailsModal;