// Property and Unit Selection Components
import React, { useState, useEffect } from 'react';
import { Building, Home, Users, MapPin, DollarSign, Calendar, Info } from 'lucide-react';

const PropertyUnitSelector = ({ onUnitSelect, selectedUnit, setSelectedUnit }) => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available properties and units
  useEffect(() => {
    const fetchAvailableUnits = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5020/api/tenants/onboarding/available-units', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (result.status === 200) {
          setProperties(result.data.properties);
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error('Error fetching available units:', error);
        setError('Failed to fetch available units');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableUnits();
  }, []);

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setSelectedUnit(null);
    if (onUnitSelect) {
      onUnitSelect(null);
    }
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    if (onUnitSelect) {
      onUnitSelect({
        ...unit,
        property: selectedProperty
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading available units...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property Selection */}
      <div>
        <h3 className="text-lg font-medium mb-4">Select Property</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() => handlePropertySelect(property)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedProperty?.id === property.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-gray-400 mr-2" />
                  <h4 className="font-medium">{property.propertyName}</h4>
                </div>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  {property.availableUnits} available
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.address}
                </div>
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-1" />
                  {property.propertyType} • {property.availableUnits}/{property.actualUnits} units available
                </div>
                {property.baseMonthlyRent > 0 && (
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    From KSh {property.baseMonthlyRent.toLocaleString()}/month
                  </div>
                )}
              </div>

              {property.amenities.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {property.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{property.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Unit Selection */}
      {selectedProperty && (
        <div>
          <h3 className="text-lg font-medium mb-4">
            Select Unit in {selectedProperty.propertyName}
          </h3>
          
          {selectedProperty.units.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Home className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>No available units in this property</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedProperty.units.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => handleUnitSelect(unit)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedUnit?.id === unit.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Unit {unit.unitNumber}</h4>
                    {unit.pendingApplications > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {unit.pendingApplications} pending
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Bedrooms:</span>
                      <span className="font-medium">{unit.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bathrooms:</span>
                      <span className="font-medium">{unit.bathrooms}</span>
                    </div>
                    {unit.sizeSquareFt > 0 && (
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="font-medium">{unit.sizeSquareFt} sq ft</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Monthly Rent:</span>
                      <span className="font-medium text-green-600">
                        KSh {unit.monthlyRent.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Deposit:</span>
                      <span className="font-medium">
                        KSh {unit.securityDeposit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Unit Summary */}
      {selectedUnit && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Selected Unit</h4>
          <div className="text-sm text-green-700">
            <p className="font-medium">
              {selectedProperty.propertyName} - Unit {selectedUnit.unitNumber}
            </p>
            <p>{selectedProperty.address}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <span className="text-green-600">Bedrooms:</span> {selectedUnit.bedrooms}
              </div>
              <div>
                <span className="text-green-600">Bathrooms:</span> {selectedUnit.bathrooms}
              </div>
              <div>
                <span className="text-green-600">Monthly Rent:</span> KSh {selectedUnit.monthlyRent.toLocaleString()}
              </div>
              <div>
                <span className="text-green-600">Security Deposit:</span> KSh {selectedUnit.securityDeposit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Co-Tenant Management Component
const CoTenantManager = ({ coTenants, setCoTenants }) => {
  const addCoTenant = () => {
    setCoTenants([
      ...coTenants,
      {
        id: Date.now(),
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        tenantType: 'Co-Tenant',
        dateOfBirth: '',
        identificationType: '',
        identificationNumber: ''
      }
    ]);
  };

  const removeCoTenant = (id) => {
    setCoTenants(coTenants.filter(tenant => tenant.id !== id));
  };

  const updateCoTenant = (id, field, value) => {
    setCoTenants(coTenants.map(tenant => 
      tenant.id === id ? { ...tenant, [field]: value } : tenant
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Co-Tenants (Optional)</h3>
        <button
          type="button"
          onClick={addCoTenant}
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
        >
          <Users className="w-4 h-4 mr-1" />
          Add Co-Tenant
        </button>
      </div>

      {coTenants.length === 0 ? (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p>No co-tenants added</p>
          <p className="text-sm">Click "Add Co-Tenant" to include additional tenants on the lease</p>
        </div>
      ) : (
        <div className="space-y-4">
          {coTenants.map((coTenant, index) => (
            <div key={coTenant.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Co-Tenant {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeCoTenant(coTenant.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="First Name *"
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={coTenant.firstName}
                  onChange={(e) => updateCoTenant(coTenant.id, 'firstName', e.target.value)}
                  required
                />
                <input
                  placeholder="Last Name *"
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={coTenant.lastName}
                  onChange={(e) => updateCoTenant(coTenant.id, 'lastName', e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={coTenant.email}
                  onChange={(e) => updateCoTenant(coTenant.id, 'email', e.target.value)}
                  required
                />
                <input
                  placeholder="Phone"
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={coTenant.phone}
                  onChange={(e) => updateCoTenant(coTenant.id, 'phone', e.target.value)}
                />
                <select
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={coTenant.tenantType}
                  onChange={(e) => updateCoTenant(coTenant.id, 'tenantType', e.target.value)}
                >
                  <option value="Co-Tenant">Co-Tenant</option>
                  <option value="Guarantor">Guarantor</option>
                  <option value="Occupant">Occupant</option>
                </select>
                <input
                  type="date"
                  placeholder="Date of Birth"
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={coTenant.dateOfBirth}
                  onChange={(e) => updateCoTenant(coTenant.id, 'dateOfBirth', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Lease Terms Component
const LeaseTermsManager = ({ leaseData, setLeaseData, selectedUnit }) => {
  const [useCustomRates, setUseCustomRates] = useState(false);

  useEffect(() => {
    if (selectedUnit && !useCustomRates) {
      setLeaseData(prev => ({
        ...prev,
        monthlyRent: selectedUnit.monthlyRent,
        securityDeposit: selectedUnit.securityDeposit
      }));
    }
  }, [selectedUnit, useCustomRates, setLeaseData]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Lease Terms</h3>

      {/* Basic lease information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Lease Start Date *</label>
          <input
            type="date"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={leaseData.leaseStart}
            onChange={(e) => setLeaseData({...leaseData, leaseStart: e.target.value})}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Lease End Date</label>
          <input
            type="date"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={leaseData.leaseEnd}
            onChange={(e) => setLeaseData({...leaseData, leaseEnd: e.target.value})}
            min={leaseData.leaseStart}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Move-in Date</label>
          <input
            type="date"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={leaseData.moveInDate}
            onChange={(e) => setLeaseData({...leaseData, moveInDate: e.target.value})}
            min={leaseData.leaseStart}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Lease Type</label>
          <select
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={leaseData.leaseType}
            onChange={(e) => setLeaseData({...leaseData, leaseType: e.target.value})}
          >
            <option value="Fixed Term">Fixed Term</option>
            <option value="Month-to-Month">Month-to-Month</option>
            <option value="Week-to-Week">Week-to-Week</option>
          </select>
        </div>
      </div>

      {/* Financial terms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Financial Terms</h4>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={useCustomRates}
              onChange={(e) => setUseCustomRates(e.target.checked)}
              className="mr-2"
            />
            Use custom rates
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Monthly Rent (KSh) *</label>
            <input
              type="number"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                !useCustomRates ? 'bg-gray-100' : ''
              }`}
              value={leaseData.monthlyRent}
              onChange={(e) => setLeaseData({...leaseData, monthlyRent: e.target.value})}
              disabled={!useCustomRates}
              required
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Security Deposit (KSh) *</label>
            <input
              type="number"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                !useCustomRates ? 'bg-gray-100' : ''
              }`}
              value={leaseData.securityDeposit}
              onChange={(e) => setLeaseData({...leaseData, securityDeposit: e.target.value})}
              disabled={!useCustomRates}
              required
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Pet Deposit (KSh)</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={leaseData.petDeposit}
              onChange={(e) => setLeaseData({...leaseData, petDeposit: e.target.value})}
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Late Fee (KSh)</label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={leaseData.lateFee}
              onChange={(e) => setLeaseData({...leaseData, lateFee: e.target.value})}
              min="0"
              step="50"
            />
          </div>
        </div>
      </div>

      {/* Additional terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Grace Period (Days)</label>
          <input
            type="number"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={leaseData.gracePeriodDays}
            onChange={(e) => setLeaseData({...leaseData, gracePeriodDays: e.target.value})}
            min="0"
            max="31"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Rent Due Day</label>
          <input
            type="number"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={leaseData.rentDueDay}
            onChange={(e) => setLeaseData({...leaseData, rentDueDay: e.target.value})}
            min="1"
            max="31"
          />
        </div>
      </div>

      {/* Lease terms and conditions */}
      <div>
        <label className="block text-sm font-medium mb-2">Lease Terms & Conditions</label>
        <textarea
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={leaseData.leaseTerms}
          onChange={(e) => setLeaseData({...leaseData, leaseTerms: e.target.value})}
          placeholder="Enter lease terms and conditions..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Special Conditions</label>
        <textarea
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          value={leaseData.specialConditions}
          onChange={(e) => setLeaseData({...leaseData, specialConditions: e.target.value})}
          placeholder="Any special conditions or notes..."
        />
      </div>
    </div>
  );
};

export { PropertyUnitSelector, CoTenantManager, LeaseTermsManager };