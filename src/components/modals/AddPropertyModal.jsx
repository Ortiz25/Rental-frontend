import React, { useState, useEffect } from "react";
import { Camera, X, Plus, Trash2, Loader, AlertCircle, CheckCircle, Building, Home } from "lucide-react";

const AddPropertyModal = ({ isOpen, onClose, onSubmit }) => {
  const [propertyData, setPropertyData] = useState({
    propertyName: "",
    address: "",
    propertyType: "",
    sizeSquareFt: "",
    monthlyRent: "",
    securityDeposit: "",
    description: "",
    totalUnits: 1,
    utilities: [],
    amenities: [],
    photos: [],
  });

  const [units, setUnits] = useState([
    {
      unitNumber: "",
      bedrooms: "",
      bathrooms: "",
      sizeSquareFt: "",
      monthlyRent: "",
      securityDeposit: "",
    }
  ]);

  const [isMultiUnit, setIsMultiUnit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState([]);

  const propertyTypes = [
    "Apartment",
    "House", 
    "Condominium",
    "Townhouse",
    "Studio",
    "Other"
  ];

  const defaultAmenityOptions = [
    "Air Conditioning",
    "Heating", 
    "Washer/Dryer",
    "Dishwasher",
    "Parking",
    "Pool",
    "Gym",
    "Pet Friendly",
    "Furnished",
    "Balcony",
    "Storage",
    "Garden",
    "Security",
    "Internet",
    "Cable TV",
    "Elevator",
    "Concierge",
    "Fitness Center",
    "Rooftop Access",
    "Business Center"
  ];

  const utilityOptions = [
    "Water",
    "Electricity",
    "Gas",
    "Internet",
    "Cable TV",
    "Trash",
    "Sewer",
    "Heating",
    "Cooling"
  ];

  // Fetch available amenities from API
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5020/api/amenities', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === 200) {
            const amenityNames = result.data.map(amenity => amenity.name);
            setAvailableAmenities(amenityNames);
          }
        } else {
          setAvailableAmenities(defaultAmenityOptions);
        }
      } catch (error) {
        console.error('Error fetching amenities:', error);
        setAvailableAmenities(defaultAmenityOptions);
      }
    };

    if (isOpen) {
      fetchAmenities();
    }
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const resetForm = () => {
    setPropertyData({
      propertyName: "",
      address: "",
      propertyType: "",
      sizeSquareFt: "",
      monthlyRent: "",
      securityDeposit: "",
      description: "",
      totalUnits: 1,
      utilities: [],
      amenities: [],
      photos: [],
    });
    setUnits([{
      unitNumber: "",
      bedrooms: "",
      bathrooms: "",
      sizeSquareFt: "",
      monthlyRent: "",
      securityDeposit: "",
    }]);
    setIsMultiUnit(false);
  };

  const handlePropertyTypeChange = (type) => {
    setPropertyData({ ...propertyData, propertyType: type });
    
    // Enable multi-unit mode for apartments and condominiums
    if (type === "Apartment" || type === "Condominium") {
      setIsMultiUnit(true);
      // Start with 5 units for apartments as a reasonable default
      const initialUnitCount = type === "Apartment" ? 5 : 3;
      const newUnits = Array(initialUnitCount).fill(null).map((_, index) => ({
        unitNumber: type === "Apartment" ? `${Math.floor(index / 10) + 1}0${(index % 10) + 1}` : `Unit ${index + 1}`,
        bedrooms: "",
        bathrooms: "",
        sizeSquareFt: "",
        monthlyRent: "",
        securityDeposit: "",
      }));
      setUnits(newUnits);
      setPropertyData(prev => ({ ...prev, totalUnits: initialUnitCount }));
    } else {
      setIsMultiUnit(false);
      setPropertyData(prev => ({ ...prev, totalUnits: 1 }));
      setUnits([{
        unitNumber: "Main",
        bedrooms: "",
        bathrooms: "",
        sizeSquareFt: "",
        monthlyRent: "",
        securityDeposit: "",
      }]);
    }
  };

  const addUnit = () => {
    const nextUnitNumber = isMultiUnit ? 
      (propertyData.propertyType === "Apartment" ? 
        `${Math.floor(units.length / 10) + 1}0${(units.length % 10) + 1}` : 
        `Unit ${units.length + 1}`) : 
      "Main";
      
    setUnits([...units, {
      unitNumber: nextUnitNumber,
      bedrooms: "",
      bathrooms: "",
      sizeSquareFt: "",
      monthlyRent: "",
      securityDeposit: "",
    }]);
    setPropertyData(prev => ({ ...prev, totalUnits: units.length + 1 }));
  };

  const removeUnit = (index) => {
    if (units.length > 1) {
      const newUnits = units.filter((_, i) => i !== index);
      setUnits(newUnits);
      setPropertyData(prev => ({ ...prev, totalUnits: newUnits.length }));
    }
  };

  const updateUnit = (index, field, value) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };

  // Bulk update functionality for multi-unit properties
  const bulkUpdateUnits = (field, value) => {
    const newUnits = units.map(unit => ({
      ...unit,
      [field]: value
    }));
    setUnits(newUnits);
  };

  // Generate sequential unit numbers
  const generateUnitNumbers = () => {
    const newUnits = units.map((unit, index) => ({
      ...unit,
      unitNumber: propertyData.propertyType === "Apartment" ? 
        `${Math.floor(index / 10) + 1}0${(index % 10) + 1}` : 
        `Unit ${index + 1}`
    }));
    setUnits(newUnits);
  };

  const validateForm = () => {
    const errors = [];

    if (!propertyData.propertyName.trim()) {
      errors.push("Property name is required");
    }
    if (!propertyData.address.trim()) {
      errors.push("Address is required");
    }
    if (!propertyData.propertyType) {
      errors.push("Property type is required");
    }

    // Validate units
    units.forEach((unit, index) => {
      if (isMultiUnit && !unit.unitNumber.trim()) {
        errors.push(`Unit ${index + 1}: Unit number is required`);
      }
      if (!unit.bedrooms || parseInt(unit.bedrooms) < 0) {
        errors.push(`Unit ${index + 1}: Valid number of bedrooms is required`);
      }
      if (!unit.bathrooms || parseFloat(unit.bathrooms) < 0) {
        errors.push(`Unit ${index + 1}: Valid number of bathrooms is required`);
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(", "));
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // For multi-unit properties, calculate average values from units
      let avgRent = null;
      let avgDeposit = null;
      let avgSize = null;

      if (isMultiUnit && units.length > 0) {
        const rents = units.filter(u => u.monthlyRent).map(u => parseFloat(u.monthlyRent));
        const deposits = units.filter(u => u.securityDeposit).map(u => parseFloat(u.securityDeposit));
        const sizes = units.filter(u => u.sizeSquareFt).map(u => parseInt(u.sizeSquareFt));

        avgRent = rents.length > 0 ? rents.reduce((a, b) => a + b, 0) / rents.length : null;
        avgDeposit = deposits.length > 0 ? deposits.reduce((a, b) => a + b, 0) / deposits.length : null;
        avgSize = sizes.length > 0 ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : null;
      }

      // Format the property data for the API
      const formattedProperty = {
        propertyName: propertyData.propertyName.trim(),
        address: propertyData.address.trim(),
        propertyType: propertyData.propertyType,
        totalUnits: propertyData.totalUnits,
        sizeSquareFt: isMultiUnit ? avgSize : (propertyData.sizeSquareFt ? parseInt(propertyData.sizeSquareFt) : null),
        monthlyRent: isMultiUnit ? avgRent : (propertyData.monthlyRent ? parseFloat(propertyData.monthlyRent) : null),
        securityDeposit: isMultiUnit ? avgDeposit : (propertyData.securityDeposit ? parseFloat(propertyData.securityDeposit) : null),
        description: propertyData.description.trim(),
        amenities: propertyData.amenities,
      };

      // Format units data
      let formattedUnits = [];
      if (isMultiUnit) {
        formattedUnits = units.map(unit => ({
          unitNumber: unit.unitNumber.trim(),
          bedrooms: parseInt(unit.bedrooms) || 0,
          bathrooms: parseFloat(unit.bathrooms) || 0,
          sizeSquareFt: unit.sizeSquareFt ? parseInt(unit.sizeSquareFt) : null,
          monthlyRent: unit.monthlyRent ? parseFloat(unit.monthlyRent) : null,
          securityDeposit: unit.securityDeposit ? parseFloat(unit.securityDeposit) : null,
          occupancyStatus: "vacant"
        }));
      } else {
        // For single unit properties, create one unit
        const unit = units[0];
        formattedUnits = [{
          unitNumber: "Main",
          bedrooms: parseInt(unit.bedrooms) || 0,
          bathrooms: parseFloat(unit.bathrooms) || 0,
          sizeSquareFt: unit.sizeSquareFt ? parseInt(unit.sizeSquareFt) : formattedProperty.sizeSquareFt,
          monthlyRent: unit.monthlyRent ? parseFloat(unit.monthlyRent) : formattedProperty.monthlyRent,
          securityDeposit: unit.securityDeposit ? parseFloat(unit.securityDeposit) : formattedProperty.securityDeposit,
          occupancyStatus: "vacant"
        }];
      }

      const requestData = {
        ...formattedProperty,
        units: formattedUnits
      };

      console.log('Sending property data:', requestData);

      const response = await fetch('http://localhost:5020/api/properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.status === 201) {
        setSuccess(true);
        
        // Call the parent onSubmit callback
        if (onSubmit) {
          await onSubmit(result.data);
        }

        // Close modal after short delay to show success message
        setTimeout(() => {
          onClose();
          resetForm();
          setSuccess(false);
        }, 1500);

      } else {
        throw new Error(result.message || 'Failed to create property');
      }

    } catch (error) {
      console.error('Error creating property:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUtilityChange = (utility, checked) => {
    if (checked) {
      setPropertyData({
        ...propertyData,
        utilities: [...propertyData.utilities, utility],
      });
    } else {
      setPropertyData({
        ...propertyData,
        utilities: propertyData.utilities.filter(u => u !== utility),
      });
    }
  };

  const handleAmenityChange = (amenity, checked) => {
    if (checked) {
      setPropertyData({
        ...propertyData,
        amenities: [...propertyData.amenities, amenity],
      });
    } else {
      setPropertyData({
        ...propertyData,
        amenities: propertyData.amenities.filter(a => a !== amenity),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center">
            <Building className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold">Add New Property</h2>
            {isMultiUnit && (
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Multi-Unit Property
              </span>
            )}
          </div>
          <button onClick={!loading ? onClose : undefined} disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Property Created Successfully!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    {isMultiUnit ? 
                      `Property with ${units.length} units has been added to your portfolio.` :
                      'The property has been added to your portfolio.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Error Creating Property
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Property Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Property Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Name *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={propertyData.propertyName}
                  onChange={(e) =>
                    setPropertyData({ ...propertyData, propertyName: e.target.value })
                  }
                  disabled={loading}
                  placeholder="e.g., Sunset Apartments, Green Valley Homes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Type *
                </label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={propertyData.propertyType}
                  onChange={(e) => handlePropertyTypeChange(e.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="">Select Type</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {propertyData.propertyType === "Apartment" && (
                  <p className="text-sm text-blue-600 mt-1">
                    ℹ️ Apartment properties automatically enable multi-unit mode
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={propertyData.address}
                  onChange={(e) =>
                    setPropertyData({ ...propertyData, address: e.target.value })
                  }
                  disabled={loading}
                  placeholder="Full property address including city and postal code"
                  required
                />
              </div>

              {!isMultiUnit && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Size (sq ft)
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={propertyData.sizeSquareFt}
                      onChange={(e) =>
                        setPropertyData({ ...propertyData, sizeSquareFt: e.target.value })
                      }
                      disabled={loading}
                      min="0"
                      placeholder="Total square footage"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Monthly Rent (KSh)
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={propertyData.monthlyRent}
                        onChange={(e) =>
                          setPropertyData({ ...propertyData, monthlyRent: e.target.value })
                        }
                        disabled={loading}
                        min="0"
                        step="100"
                        placeholder="Monthly rent amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Security Deposit (KSh)
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={propertyData.securityDeposit}
                        onChange={(e) =>
                          setPropertyData({ ...propertyData, securityDeposit: e.target.value })
                        }
                        disabled={loading}
                        min="0"
                        step="100"
                        placeholder="Security deposit amount"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Units Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Building className="w-5 h-5 mr-2" />
                {isMultiUnit ? `Units (${units.length} total)` : "Unit Details"}
              </h3>
              {isMultiUnit && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={generateUnitNumbers}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 text-sm"
                  >
                    Auto-Number Units
                  </button>
                  <button
                    type="button"
                    onClick={addUnit}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Unit</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bulk Update Controls for Multi-Unit */}
            {isMultiUnit && units.length > 1 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Bulk Update All Units:</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Bedrooms</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Apply to all"
                      min="0"
                      onChange={(e) => e.target.value && bulkUpdateUnits('bedrooms', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Bathrooms</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Apply to all"
                      min="0"
                      step="0.5"
                      onChange={(e) => e.target.value && bulkUpdateUnits('bathrooms', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Size (sq ft)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Apply to all"
                      min="0"
                      onChange={(e) => e.target.value && bulkUpdateUnits('sizeSquareFt', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Rent (KSh)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Apply to all"
                      min="0"
                      step="100"
                      onChange={(e) => e.target.value && bulkUpdateUnits('monthlyRent', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Deposit (KSh)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Apply to all"
                      min="0"
                      step="100"
                      onChange={(e) => e.target.value && bulkUpdateUnits('securityDeposit', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {units.map((unit, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-lg">
                      {isMultiUnit ? `Unit ${index + 1}` : "Main Unit"}
                    </h4>
                    {isMultiUnit && units.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUnit(index)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {isMultiUnit && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Unit Number *
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={unit.unitNumber}
                          onChange={(e) => updateUnit(index, 'unitNumber', e.target.value)}
                          placeholder="e.g., 101, A1"
                          disabled={loading}
                          required={isMultiUnit}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bedrooms *
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unit.bedrooms}
                        onChange={(e) => updateUnit(index, 'bedrooms', e.target.value)}
                        disabled={loading}
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bathrooms *
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unit.bathrooms}
                        onChange={(e) => updateUnit(index, 'bathrooms', e.target.value)}
                        disabled={loading}
                        min="0"
                        step="0.5"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Size (sq ft)
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unit.sizeSquareFt}
                        onChange={(e) => updateUnit(index, 'sizeSquareFt', e.target.value)}
                        disabled={loading}
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Monthly Rent (KSh)
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unit.monthlyRent}
                        onChange={(e) => updateUnit(index, 'monthlyRent', e.target.value)}
                        disabled={loading}
                        min="0"
                        step="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Security Deposit (KSh)
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unit.securityDeposit}
                        onChange={(e) => updateUnit(index, 'securityDeposit', e.target.value)}
                        disabled={loading}
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Utilities and Amenities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">
                Included Utilities
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-48 overflow-y-auto">
                {utilityOptions.map((utility) => (
                  <label key={utility} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={propertyData.utilities.includes(utility)}
                      onChange={(e) => handleUtilityChange(utility, e.target.checked)}
                      disabled={loading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{utility}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Property Amenities
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-48 overflow-y-auto">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={propertyData.amenities.includes(amenity)}
                      onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                      disabled={loading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Property Summary for Multi-Unit */}
          {isMultiUnit && units.length > 0 && (
            <div className="mb-8 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Property Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Units:</span>
                  <span className="ml-2 font-semibold">{units.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg. Bedrooms:</span>
                  <span className="ml-2 font-semibold">
                    {units.filter(u => u.bedrooms).length > 0 ? 
                      (units.reduce((sum, u) => sum + (parseInt(u.bedrooms) || 0), 0) / units.filter(u => u.bedrooms).length).toFixed(1) : 
                      'N/A'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Avg. Rent:</span>
                  <span className="ml-2 font-semibold">
                    {units.filter(u => u.monthlyRent).length > 0 ? 
                      `KSh ${(units.reduce((sum, u) => sum + (parseFloat(u.monthlyRent) || 0), 0) / units.filter(u => u.monthlyRent).length).toLocaleString()}` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Potential Revenue:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    KSh {units.reduce((sum, u) => sum + (parseFloat(u.monthlyRent) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Photos Upload (Disabled for now) */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Property Photos (Coming Soon)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 opacity-50">
              <div className="text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <span className="text-gray-500">Photo upload coming in next update</span>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF support planned
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Property Description
            </label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              value={propertyData.description}
              onChange={(e) =>
                setPropertyData({ ...propertyData, description: e.target.value })
              }
              disabled={loading}
              placeholder={isMultiUnit ? 
                "Describe the property complex, location benefits, shared amenities, and what makes it attractive to tenants..." :
                "Describe the property, location benefits, unique features, and what makes it attractive to tenants..."
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || success}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
            >
              {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Creating...' : success ? 'Created!' : 
                isMultiUnit ? `Create Property with ${units.length} Units` : 'Create Property'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyModal;