import React, { useState } from "react";

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
      }
    });
  
    const [step, setStep] = useState(1);
    const [confirmOffboard, setConfirmOffboard] = useState(false);
  
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
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-4">Security Deposit Settlement</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Original Deposit</p>
              <p className="text-lg font-medium">${tenant.securityDeposit}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Refund Amount</label>
              <input
                type="number"
                className="w-full p-2 border rounded mt-1"
                value={formData.depositRefund}
                onChange={(e) => setFormData({...formData, depositRefund: e.target.value})}
                max={tenant.securityDeposit}
              />
            </div>
          </div>
        </div>
  
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
                />
                <button
                  type="button"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => {
                    const newDeductions = formData.deductions.filter((_, i) => i !== index);
                    setFormData({...formData, deductions: newDeductions});
                  }}
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
        </div>
  
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
                <span className="text-sm">Security Deposit</span>
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
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <div className="relative bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-bold mb-4">Confirm Offboarding</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to offboard {tenant.name}? This action cannot be undone.
              </p>
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


  export default OffboardTenantModal

