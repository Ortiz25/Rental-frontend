// Enhanced Multi-Step Onboarding Form
import React, { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, User, Home, FileText, CreditCard } from 'lucide-react';
import { PropertyUnitSelector, CoTenantManager, LeaseTermsManager } from './propertyUnitSelection.jsx';

const EnhancedOnboardingForm = ({ onSubmit, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [reservationId, setReservationId] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    identificationType: '',
    identificationNumber: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    
    // Employment Information
    employmentStatus: '',
    employerName: '',
    monthlyIncome: '',
    previousAddress: '',
  });

  // Co-tenants state
  const [coTenants, setCoTenants] = useState([]);

  // Lease data state
  const [leaseData, setLeaseData] = useState({
    leaseStart: '',
    leaseEnd: '',
    leaseType: 'Fixed Term',
    monthlyRent: '',
    securityDeposit: '',
    petDeposit: 0,
    lateFee: 0,
    gracePeriodDays: 5,
    rentDueDay: 1,
    moveInDate: '',
    leaseTerms: '',
    specialConditions: ''
  });

  const steps = [
    { 
      id: 1, 
      title: 'Personal Info', 
      icon: User,
      description: 'Basic tenant information'
    },
    { 
      id: 2, 
      title: 'Property & Unit', 
      icon: Home,
      description: 'Select property and unit'
    },
    { 
      id: 3, 
      title: 'Lease Terms', 
      icon: FileText,
      description: 'Configure lease details'
    },
    { 
      id: 4, 
      title: 'Review & Submit', 
      icon: CreditCard,
      description: 'Final review and submission'
    }
  ];

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return selectedUnit !== null;
      case 3:
        return leaseData.leaseStart && leaseData.monthlyRent && leaseData.securityDeposit;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        selectedUnitId: selectedUnit.id,
        customMonthlyRent: leaseData.monthlyRent !== selectedUnit.monthlyRent ? leaseData.monthlyRent : null,
        customSecurityDeposit: leaseData.securityDeposit !== selectedUnit.securityDeposit ? leaseData.securityDeposit : null,
        ...leaseData,
        coTenants: coTenants.filter(ct => ct.firstName && ct.lastName && ct.email),
        reservationId
      };

      const success = await onSubmit(submitData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Onboarding submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="First Name *" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
                <input 
                  placeholder="Last Name *" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
                <input 
                  type="email"
                  placeholder="Email *" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <input 
                  placeholder="Phone *" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
                <input 
                  placeholder="Alternate Phone" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.alternatePhone}
                  onChange={(e) => setFormData({...formData, alternatePhone: e.target.value})}
                />
                <input
                  type="date"
                  placeholder="Date of Birth"
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.identificationType}
                  onChange={(e) => setFormData({...formData, identificationType: e.target.value})}
                >
                  <option value="">Select ID Type</option>
                  <option value="National ID">National ID</option>
                  <option value="Passport">Passport</option>
                  <option value="Driver License">Driver License</option>
                  <option value="Other">Other</option>
                </select>
                <input 
                  placeholder="ID Number" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.identificationNumber}
                  onChange={(e) => setFormData({...formData, identificationNumber: e.target.value})}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  placeholder="Emergency Contact Name" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                />
                <input 
                  placeholder="Emergency Contact Phone" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                />
                <input 
                  placeholder="Relationship" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => setFormData({...formData, emergencyContactRelationship: e.target.value})}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Employment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.employmentStatus}
                  onChange={(e) => setFormData({...formData, employmentStatus: e.target.value})}
                >
                  <option value="">Employment Status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                </select>
                <input 
                  placeholder="Employer Name" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.employerName}
                  onChange={(e) => setFormData({...formData, employerName: e.target.value})}
                />
                <input 
                  type="number"
                  placeholder="Monthly Income (KSh)" 
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Previous Address</h3>
              <textarea
                placeholder="Previous Address"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.previousAddress}
                onChange={(e) => setFormData({...formData, previousAddress: e.target.value})}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <PropertyUnitSelector
              onUnitSelect={(unit) => setSelectedUnit(unit)}
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
            />
            <CoTenantManager
              coTenants={coTenants}
              setCoTenants={setCoTenants}
            />
          </div>
        );

      case 3:
        return (
          <LeaseTermsManager
            leaseData={leaseData}
            setLeaseData={setLeaseData}
            selectedUnit={selectedUnit}
          />
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Review & Confirm</h3>
            
            {/* Tenant Information Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Primary Tenant</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-600">Name:</span> {formData.firstName} {formData.lastName}</div>
                <div><span className="text-gray-600">Email:</span> {formData.email}</div>
                <div><span className="text-gray-600">Phone:</span> {formData.phone}</div>
                <div><span className="text-gray-600">Employment:</span> {formData.employmentStatus}</div>
              </div>
            </div>

            {/* Co-tenants Summary */}
            {coTenants.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Co-Tenants ({coTenants.length})</h4>
                {coTenants.map((coTenant, index) => (
                  <div key={coTenant.id} className="text-sm mb-1">
                    {index + 1}. {coTenant.firstName} {coTenant.lastName} ({coTenant.tenantType})
                  </div>
                ))}
              </div>
            )}

            {/* Property & Unit Summary */}
            {selectedUnit && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Selected Property & Unit</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">Property:</span> {selectedUnit.property.propertyName}</div>
                  <div><span className="text-gray-600">Unit:</span> {selectedUnit.unitNumber}</div>
                  <div><span className="text-gray-600">Address:</span> {selectedUnit.property.address}</div>
                  <div><span className="text-gray-600">Type:</span> {selectedUnit.property.propertyType}</div>
                  <div><span className="text-gray-600">Bedrooms:</span> {selectedUnit.bedrooms}</div>
                  <div><span className="text-gray-600">Bathrooms:</span> {selectedUnit.bathrooms}</div>
                </div>
              </div>
            )}

            {/* Lease Terms Summary */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Lease Terms</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-600">Start Date:</span> {leaseData.leaseStart}</div>
                <div><span className="text-gray-600">End Date:</span> {leaseData.leaseEnd || 'Not specified'}</div>
                <div><span className="text-gray-600">Type:</span> {leaseData.leaseType}</div>
                <div><span className="text-gray-600">Move-in Date:</span> {leaseData.moveInDate || 'Same as start date'}</div>
                <div><span className="text-gray-600">Monthly Rent:</span> KSh {parseInt(leaseData.monthlyRent || 0).toLocaleString()}</div>
                <div><span className="text-gray-600">Security Deposit:</span> KSh {parseInt(leaseData.securityDeposit || 0).toLocaleString()}</div>
                {parseFloat(leaseData.petDeposit) > 0 && (
                  <div><span className="text-gray-600">Pet Deposit:</span> KSh {parseInt(leaseData.petDeposit).toLocaleString()}</div>
                )}
                {parseFloat(leaseData.lateFee) > 0 && (
                  <div><span className="text-gray-600">Late Fee:</span> KSh {parseInt(leaseData.lateFee).toLocaleString()}</div>
                )}
              </div>
            </div>

            {/* Total Financial Summary */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium mb-2">Financial Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Rent:</span>
                  <span>KSh {parseInt(leaseData.monthlyRent || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Deposit:</span>
                  <span>KSh {parseInt(leaseData.securityDeposit || 0).toLocaleString()}</span>
                </div>
                {parseFloat(leaseData.petDeposit) > 0 && (
                  <div className="flex justify-between">
                    <span>Pet Deposit:</span>
                    <span>KSh {parseInt(leaseData.petDeposit).toLocaleString()}</span>
                  </div>
                )}
                <hr className="border-yellow-300" />
                <div className="flex justify-between font-medium">
                  <span>Total Move-in Cost:</span>
                  <span>KSh {(
                    parseInt(leaseData.monthlyRent || 0) + 
                    parseInt(leaseData.securityDeposit || 0) + 
                    parseInt(leaseData.petDeposit || 0)
                  ).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Important Notice</h4>
              <p className="text-sm text-red-700">
                By submitting this form, you confirm that all information provided is accurate and complete. 
                This will create an active lease agreement and mark the selected unit as occupied.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-bold">New Tenant Onboarding</h2>
        <p className="text-sm text-gray-600">Complete tenant registration with unit allocation</p>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isValid = validateStep(step.id);
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                      ? isValid 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-blue-500 bg-white text-blue-500'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
            )}
            
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep) || submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Tenant...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete Onboarding
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboardingForm;