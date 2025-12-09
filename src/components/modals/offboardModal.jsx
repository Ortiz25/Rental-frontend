import React, { useState, useEffect } from "react";

import {
  MessageSquare,
  Bell,
  Send,
  Users,
  Search,
  Plus,
  Settings,
  X,
  Filter,
  Star,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatCurrency } from "../../utils/helperFunctions";

const OffboardTenantModal = ({ tenant, isOpen, onClose, onOffboard }) => {
  const [formData, setFormData] = useState({
    moveOutDate: '',
    depositRefund: tenant?.securityDeposit || 0,
    deductions: [],
    notes: '',
    confirmAddress: '',
    returnKeys: false,
    propertyInspection: false,
    finalBillsSettled: false,
    inspectionFindings: '',
    keyReturn: {
      house: 0,
      mailbox: 0,
      garage: 0,
      other: 0
    },
    handleUnpaidRent: 'deduct' // 'deduct' or 'writeoff'
  });

  const [step, setStep] = useState(1);
  const [confirmOffboard, setConfirmOffboard] = useState(false);
  const [unpaidRent, setUnpaidRent] = useState(0);
  const [unpaidRentDetails, setUnpaidRentDetails] = useState([]);
  const [loadingUnpaidRent, setLoadingUnpaidRent] = useState(false);

  // Fetch unpaid rent when modal opens
  useEffect(() => {
    if (isOpen && tenant?.id) {
      fetchUnpaidRent();
    }
  }, [isOpen, tenant?.id]);

  // Auto-calculate deposit refund based on deductions
  useEffect(() => {
    const totalDeductions = formData.deductions.reduce(
      (sum, deduction) => sum + (parseFloat(deduction.amount) || 0), 
      0
    );
    const refund = Math.max(0, (tenant?.securityDeposit || 0) - totalDeductions);
    setFormData(prev => ({ ...prev, depositRefund: refund }));
  }, [formData.deductions, tenant?.securityDeposit]);

  // Auto-add unpaid rent to deductions when handleUnpaidRent changes
  useEffect(() => {
    if (unpaidRent > 0) {
      if (formData.handleUnpaidRent === 'deduct') {
        // Check if unpaid rent deduction already exists
        const hasUnpaidRentDeduction = formData.deductions.some(
          d => d.description === 'Unpaid Rent Settlement'
        );
        
        if (!hasUnpaidRentDeduction) {
          setFormData(prev => ({
            ...prev,
            deductions: [
              ...prev.deductions.filter(d => d.description !== 'Unpaid Rent Settlement'),
              { description: 'Unpaid Rent Settlement', amount: unpaidRent }
            ]
          }));
        }
      } else {
        // Remove unpaid rent deduction if switching to writeoff
        setFormData(prev => ({
          ...prev,
          deductions: prev.deductions.filter(d => d.description !== 'Unpaid Rent Settlement')
        }));
      }
    }
  }, [formData.handleUnpaidRent, unpaidRent]);

  const fetchUnpaidRent = async () => {
    setLoadingUnpaidRent(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/backend/tenants/${tenant.id}/unpaid-rent`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const result = await response.json();
      if (result.status === 200) {
        setUnpaidRent(result.data.totalUnpaid);
        setUnpaidRentDetails(result.data.payments);
        
        // Auto-add to deductions if unpaid rent exists
        if (result.data.totalUnpaid > 0) {
          setFormData(prev => ({
            ...prev,
            deductions: [
              { description: 'Unpaid Rent Settlement', amount: result.data.totalUnpaid }
            ]
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching unpaid rent:', error);
    } finally {
      setLoadingUnpaidRent(false);
    }
  };

  const renderStepOne = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Move-out Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            value={formData.moveOutDate}
            onChange={(e) => setFormData({...formData, moveOutDate: e.target.value})}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Current Status</label>
          <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-sm">Lease ends: {new Date(tenant.leaseEnd).toLocaleDateString()}</p>
            <p className="text-sm mt-1">
              {new Date(tenant.leaseEnd) < new Date() ? 'Lease has expired' : 'Lease is active'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Forwarding Address</label>
        <textarea
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          value={formData.confirmAddress}
          onChange={(e) => setFormData({...formData, confirmAddress: e.target.value})}
          required
          rows={3}
          placeholder="Enter tenant's forwarding address..."
        />
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Keys Return Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(formData.keyReturn).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm text-gray-600 mb-1 capitalize">{key} Keys</label>
              <input
                type="number"
                min="0"
                className="w-full p-2 border rounded"
                value={value}
                onChange={(e) => setFormData({
                  ...formData,
                  keyReturn: {
                    ...formData.keyReturn,
                    [key]: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Pre-departure Checklist</label>
        <div className="space-y-2 bg-gray-50 p-4 rounded">
          {[
            { key: 'returnKeys', label: 'Keys Returned' },
            { key: 'propertyInspection', label: 'Property Inspection Scheduled' },
            { key: 'finalBillsSettled', label: 'Final Bills Settled' }
          ].map(item => (
            <label key={item.key} className="flex items-center">
              <input
                type="checkbox"
                className="rounded text-blue-500"
                checked={formData[item.key]}
                onChange={(e) => setFormData({...formData, [item.key]: e.target.checked})}
              />
              <span className="ml-2 text-sm">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-4">
      {/* Unpaid Rent Warning */}
      {loadingUnpaidRent ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">Checking for unpaid rent...</p>
        </div>
      ) : unpaidRent > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Unpaid Rent Detected
          </h4>
          <p className="text-sm text-red-700 mb-3">
            This tenant has <strong>{formatCurrency(unpaidRent)}</strong> in unpaid rent.
          </p>
          
          {/* Show unpaid rent details */}
          {unpaidRentDetails.length > 0 && (
            <div className="bg-white rounded p-3 mb-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Unpaid Payments:</p>
              <div className="space-y-1">
                {unpaidRentDetails.map((payment, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                    </span>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(payment.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">How to handle unpaid rent:</p>
            <label className="flex items-start">
              <input
                type="radio"
                checked={formData.handleUnpaidRent === 'deduct'}
                onChange={() => setFormData({...formData, handleUnpaidRent: 'deduct'})}
                className="mt-1 mr-2"
              />
              <div>
                <span className="text-sm font-medium">Deduct from security deposit</span>
                <p className="text-xs text-gray-600">
                  Unpaid rent will be automatically deducted from the security deposit
                </p>
              </div>
            </label>
            <label className="flex items-start">
              <input
                type="radio"
                checked={formData.handleUnpaidRent === 'writeoff'}
                onChange={() => setFormData({...formData, handleUnpaidRent: 'writeoff'})}
                className="mt-1 mr-2"
              />
              <div>
                <span className="text-sm font-medium">Write off as bad debt</span>
                <p className="text-xs text-gray-600">
                  Mark as uncollectable and record as tenant debt
                </p>
              </div>
            </label>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            No unpaid rent - all payments are up to date
          </p>
        </div>
      )}

      {/* Security Deposit Settlement */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-4">Security Deposit Settlement</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Original Deposit</p>
            <p className="text-lg font-medium">{formatCurrency(tenant.securityDeposit)}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Refund Amount (Auto-calculated)</label>
            <p className="text-lg font-medium text-green-600">
              {formatCurrency(formData.depositRefund)}
            </p>
          </div>
        </div>
      </div>

      {/* Deductions */}
      <div>
        <label className="block text-sm font-medium mb-2">Deductions</label>
        <div className="space-y-2">
          {formData.deductions.map((deduction, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder="Description"
                className="flex-grow p-2 border rounded"
                value={deduction.description}
                onChange={(e) => {
                  const newDeductions = [...formData.deductions];
                  newDeductions[index].description = e.target.value;
                  setFormData({...formData, deductions: newDeductions});
                }}
                disabled={deduction.description === 'Unpaid Rent Settlement'}
              />
              <input
                type="number"
                placeholder="Amount"
                className="w-32 p-2 border rounded"
                value={deduction.amount}
                onChange={(e) => {
                  const newDeductions = [...formData.deductions];
                  newDeductions[index].amount = e.target.value;
                  setFormData({...formData, deductions: newDeductions});
                }}
                disabled={deduction.description === 'Unpaid Rent Settlement'}
              />
              <button
                type="button"
                className="text-red-500 hover:text-red-600 disabled:opacity-50"
                onClick={() => {
                  const newDeductions = formData.deductions.filter((_, i) => i !== index);
                  setFormData({...formData, deductions: newDeductions});
                }}
                disabled={deduction.description === 'Unpaid Rent Settlement'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-blue-500 text-sm hover:text-blue-600"
            onClick={() => setFormData({
              ...formData,
              deductions: [...formData.deductions, { description: '', amount: '' }]
            })}
          >
            + Add Deduction
          </button>
        </div>

        {/* Total Deductions Summary */}
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <div className="flex justify-between text-sm">
            <span>Total Deductions:</span>
            <span className="font-medium text-red-600">
              {formatCurrency(formData.deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Inspection Findings */}
      <div>
        <label className="block text-sm font-medium mb-2">Inspection Findings</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          value={formData.inspectionFindings}
          onChange={(e) => setFormData({...formData, inspectionFindings: e.target.value})}
          placeholder="Document any damages or issues found during inspection..."
        />
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">Additional Notes</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Any additional notes about the offboarding..."
        />
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Offboard Tenant - {tenant.name}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}>1</div>
              <div className={`w-20 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}>2</div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm">Move-out Details</span>
              <span className="text-sm">Security Deposit & Settlement</span>
            </div>
          </div>

          {step === 1 ? renderStepOne() : renderStepTwo()}
        </div>

        <div className="flex justify-between p-6 border-t bg-gray-50">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (step === 1) {
                if (!formData.moveOutDate) {
                  alert('Please select a move-out date');
                  return;
                }
                setStep(2);
              } else {
                setConfirmOffboard(true);
              }
            }}
            className="ml-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {step === 1 ? 'Next' : 'Complete Offboarding'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOffboard && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-60" />
          <div className="relative bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm Offboarding</h3>
            <div className="space-y-2 mb-4 text-sm">
              <p className="text-gray-600">
                Are you sure you want to offboard <strong>{tenant.name}</strong>?
              </p>
              {unpaidRent > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-yellow-800">
                    <strong>Unpaid rent: {formatCurrency(unpaidRent)}</strong>
                  </p>
                  <p className="text-yellow-700 text-xs mt-1">
                    Will be {formData.handleUnpaidRent === 'deduct' ? 'deducted from deposit' : 'written off as bad debt'}
                  </p>
                </div>
              )}
              <p className="text-gray-600">
                Security deposit refund: <strong>{formatCurrency(formData.depositRefund)}</strong>
              </p>
              <p className="text-red-600 text-xs mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmOffboard(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onOffboard(formData);
                  setConfirmOffboard(false);
                  onClose();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Confirm Offboarding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffboardTenantModal;