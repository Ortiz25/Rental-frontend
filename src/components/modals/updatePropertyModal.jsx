import React, { useState, useEffect } from "react";
import {
  Camera,
  X,
  Plus,
  Trash2,
  Loader,
  AlertCircle,
  CheckCircle,
  Edit,
  Building,
  Home,
} from "lucide-react";

const UpdatePropertyModal = ({
  isOpen,
  onClose,
  onUpdate,
  property,
  selectedUnit = null,
}) => {
  const [currentView, setCurrentView] = useState("property"); // 'property' or 'unit'
  const [selectedUnitData, setSelectedUnitData] = useState(null);

  const [propertyData, setPropertyData] = useState({
    propertyName: "",
    address: "",
    propertyType: "",
    sizeSquareFt: "",
    monthlyRent: "",
    securityDeposit: "",
    description: "",
    totalUnits: 1,
    amenities: [],
  });

  const [unitData, setUnitData] = useState({
    id: null,
    unitNumber: "",
    bedrooms: 0,
    bathrooms: 0,
    sizeSquareFt: "",
    monthlyRent: "",
    securityDeposit: "",
    occupancyStatus: "vacant",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [propertyUnits, setPropertyUnits] = useState([]);

  const propertyTypes = [
    "Apartment",
    "House",
    "Condominium",
    "Townhouse",
    "Studio",
    "Other",
  ];

  const occupancyStatuses = [
    { value: "vacant", label: "Vacant", color: "text-red-600" },
    { value: "occupied", label: "Occupied", color: "text-green-600" },
    { value: "maintenance", label: "Maintenance", color: "text-yellow-600" },
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
  ];

  // Load property data when modal opens
  useEffect(() => {
    if (isOpen && property) {
      // Load property data
      setPropertyData({
        propertyName: property.propertyName || "",
        address: property.address || "",
        propertyType: property.type || "",
        sizeSquareFt: property.squareFootage || "",
        monthlyRent: property.monthlyRent || "",
        securityDeposit: property.securityDeposit || "",
        description: property.description || "",
        totalUnits: property.totalUnits || 1,
        amenities: property.amenities || [],
      });

      // Load units data if it's a multi-unit property
      if (property.units && property.units.length > 0) {
        setPropertyUnits(property.units);
      } else {
        // For single-unit properties, create a default unit structure
        setPropertyUnits([
          {
            id: null,
            unit_number: "Main",
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            size_sq_ft: property.squareFootage || "",
            monthly_rent: property.monthlyRent || "",
            security_deposit: property.securityDeposit || "",
            occupancy_status:
              property.occupancyStatus === "Occupied" ? "occupied" : "vacant",
          },
        ]);
      }

      // If a specific unit was selected, switch to unit view
      if (selectedUnit) {
        setCurrentView("unit");
        setSelectedUnitData(selectedUnit);
        setUnitData({
          id: selectedUnit.id,
          unitNumber: selectedUnit.unit_number || selectedUnit.unitNumber || "",
          bedrooms: selectedUnit.bedrooms || 0,
          bathrooms: selectedUnit.bathrooms || 0,
          sizeSquareFt:
            selectedUnit.size_sq_ft || selectedUnit.sizeSquareFt || "",
          monthlyRent:
            selectedUnit.monthly_rent || selectedUnit.monthlyRent || "",
          securityDeposit:
            selectedUnit.security_deposit || selectedUnit.securityDeposit || "",
          occupancyStatus:
            selectedUnit.occupancy_status ||
            selectedUnit.occupancyStatus ||
            "vacant",
        });
      } else {
        setCurrentView("property");
      }

      setError(null);
      setSuccess(false);
    }
  }, [isOpen, property, selectedUnit]);

  // Fetch available amenities from API
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "/backend/properties/amenities",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.status === 200) {
            const amenityNames = result.data.map((amenity) => amenity.name);
            setAvailableAmenities(amenityNames);
          }
        } else {
          setAvailableAmenities(defaultAmenityOptions);
        }
      } catch (error) {
        console.error("Error fetching amenities:", error);
        setAvailableAmenities(defaultAmenityOptions);
      }
    };

    if (isOpen) {
      fetchAmenities();
    }
  }, [isOpen]);

  const isMultiUnitProperty = () => {
    return (
      propertyData.propertyType === "Apartment" && propertyUnits.length > 1
    );
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
        amenities: propertyData.amenities.filter((a) => a !== amenity),
      });
    }
  };

  const selectUnitForEdit = (unit) => {
    setSelectedUnitData(unit);
    setUnitData({
      id: unit.id,
      unitNumber: unit.unit_number || "",
      bedrooms: unit.bedrooms || 0,
      bathrooms: unit.bathrooms || 0,
      sizeSquareFt: unit.size_sq_ft || "",
      monthlyRent: unit.monthly_rent || "",
      securityDeposit: unit.security_deposit || "",
      occupancyStatus: unit.occupancy_status || "vacant",
    });
  };

  const validatePropertyForm = () => {
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
    return errors;
  };

  const validateUnitForm = () => {
    const errors = [];
    if (!unitData.unitNumber.trim()) {
      errors.push("Unit number is required");
    }
    return errors;
  };

  const handlePropertySubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const validationErrors = validatePropertyForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(", "));
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formattedProperty = {
        propertyName: propertyData.propertyName.trim(),
        address: propertyData.address.trim(),
        propertyType: propertyData.propertyType,
        totalUnits: propertyData.totalUnits,
        sizeSquareFt: propertyData.sizeSquareFt
          ? parseInt(propertyData.sizeSquareFt)
          : null,
        monthlyRent: propertyData.monthlyRent
          ? parseFloat(propertyData.monthlyRent)
          : null,
        securityDeposit: propertyData.securityDeposit
          ? parseFloat(propertyData.securityDeposit)
          : null,
        description: propertyData.description.trim(),
        amenities: propertyData.amenities,
      };

      const response = await fetch(
        `/backend/properties/${property.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedProperty),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.status === 200) {
        setSuccess(true);

        if (onUpdate) {
          await onUpdate(result.data);
        }

        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to update property");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUnitSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const validationErrors = validateUnitForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(", "));
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formattedUnit = {
        unitNumber: unitData.unitNumber.trim(),
        bedrooms: parseInt(unitData.bedrooms) || 0,
        bathrooms: parseFloat(unitData.bathrooms) || 0,
        sizeSquareFt: unitData.sizeSquareFt
          ? parseInt(unitData.sizeSquareFt)
          : null,
        monthlyRent: unitData.monthlyRent
          ? parseFloat(unitData.monthlyRent)
          : null,
        securityDeposit: unitData.securityDeposit
          ? parseFloat(unitData.securityDeposit)
          : null,
        occupancyStatus: unitData.occupancyStatus,
      };

      const response = await fetch(
        `/backend/properties/${property.id}/units/${unitData.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedUnit),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.status === 200) {
        setSuccess(true);

        // Update the local units array
        const updatedUnits = propertyUnits.map((unit) =>
          unit.id === unitData.id ? { ...unit, ...formattedUnit } : unit
        );
        setPropertyUnits(updatedUnits);

        if (onUpdate) {
          await onUpdate();
        }

        setTimeout(() => {
          setSuccess(false);
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to update unit");
      }
    } catch (error) {
      console.error("Error updating unit:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center">
            <Edit className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold">
              {currentView === "property" ? "Update Property" : "Update Unit"}
            </h2>
            {currentView === "unit" && selectedUnitData && (
              <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                Unit {selectedUnitData.unit_number}
              </span>
            )}
          </div>
          <button onClick={!loading ? onClose : undefined} disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs - Only show if it's a multi-unit property */}
        {isMultiUnitProperty() && (
          <div className="flex border-b">
            <button
              onClick={() => setCurrentView("property")}
              className={`px-6 py-3 font-medium ${
                currentView === "property"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Building className="w-4 h-4 inline mr-2" />
              Property Details
            </button>
            <button
              onClick={() => setCurrentView("unit")}
              className={`px-6 py-3 font-medium ${
                currentView === "unit"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Unit Management
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    {currentView === "property"
                      ? "Property Updated Successfully!"
                      : "Unit Updated Successfully!"}
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    {currentView === "property"
                      ? "The property information has been updated."
                      : "The unit information has been updated."}
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
                    {currentView === "property"
                      ? "Error Updating Property"
                      : "Error Updating Unit"}
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Property Form Content */}
          {currentView === "property" && (
            <div>
              {/* Property Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">
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
                        setPropertyData({
                          ...propertyData,
                          propertyName: e.target.value,
                        })
                      }
                      disabled={loading}
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
                      onChange={(e) =>
                        setPropertyData({
                          ...propertyData,
                          propertyType: e.target.value,
                        })
                      }
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
                        setPropertyData({
                          ...propertyData,
                          address: e.target.value,
                        })
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Size (sq ft)
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={propertyData.sizeSquareFt}
                      onChange={(e) =>
                        setPropertyData({
                          ...propertyData,
                          sizeSquareFt: e.target.value,
                        })
                      }
                      disabled={loading}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Units
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={propertyData.totalUnits}
                      onChange={(e) =>
                        setPropertyData({
                          ...propertyData,
                          totalUnits: parseInt(e.target.value) || 1,
                        })
                      }
                      disabled={loading}
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Monthly Rent (KSh){" "}
                      {!isMultiUnitProperty() ? "" : "(Base Rate)"}
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={propertyData.monthlyRent}
                      onChange={(e) =>
                        setPropertyData({
                          ...propertyData,
                          monthlyRent: e.target.value,
                        })
                      }
                      disabled={loading}
                      min="0"
                      step="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Security Deposit (KSh){" "}
                      {!isMultiUnitProperty() ? "" : "(Base Rate)"}
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={propertyData.securityDeposit}
                      onChange={(e) =>
                        setPropertyData({
                          ...propertyData,
                          securityDeposit: e.target.value,
                        })
                      }
                      disabled={loading}
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
              </div>

              {/* Current Property Stats (Read-only) */}
              <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Current Property Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Occupied Units:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      {property.occupiedUnits}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vacant Units:</span>
                    <span className="ml-2 font-semibold text-red-600">
                      {property.vacantUnits}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Occupancy Rate:</span>
                    <span className="ml-2 font-semibold">
                      {property.occupancyRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`ml-2 font-semibold ${
                        property.occupancyState === "Full"
                          ? "text-green-600"
                          : property.occupancyState === "Partial"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {property.occupancyState}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
                  {availableAmenities.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={propertyData.amenities.includes(amenity)}
                        onChange={(e) =>
                          handleAmenityChange(amenity, e.target.checked)
                        }
                        disabled={loading}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  value={propertyData.description}
                  onChange={(e) =>
                    setPropertyData({
                      ...propertyData,
                      description: e.target.value,
                    })
                  }
                  disabled={loading}
                  placeholder="Describe the property..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
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
                  onClick={handlePropertySubmit}
                  disabled={loading || success}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                >
                  {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {loading
                    ? "Updating..."
                    : success
                    ? "Updated!"
                    : "Update Property"}
                </button>
              </div>
            </div>
          )}

          {/* Unit Management Content */}
          {currentView === "unit" && (
            <div>
              {/* Unit Selector for Multi-Unit Properties */}
              {isMultiUnitProperty() && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Select Unit to Edit
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {propertyUnits.map((unit) => (
                      <div
                        key={unit.id}
                        onClick={() => selectUnitForEdit(unit)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedUnitData?.id === unit.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            Unit {unit.unit_number}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              unit.occupancy_status === "occupied"
                                ? "bg-green-100 text-green-800"
                                : unit.occupancy_status === "maintenance"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {unit.occupancy_status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>
                            {unit.bedrooms} bed, {unit.bathrooms} bath
                          </div>
                          <div>
                            KSh {unit.monthly_rent?.toLocaleString() || "N/A"}
                            /month
                          </div>
                          {unit.size_sq_ft && (
                            <div>{unit.size_sq_ft} sq ft</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unit Form - Only show if a unit is selected or it's a single unit property */}
              {(selectedUnitData || !isMultiUnitProperty()) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {isMultiUnitProperty()
                      ? `Edit Unit ${selectedUnitData?.unit_number}`
                      : "Edit Unit Details"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Unit Number *
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unitData.unitNumber}
                        onChange={(e) =>
                          setUnitData({
                            ...unitData,
                            unitNumber: e.target.value,
                          })
                        }
                        disabled={loading}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Occupancy Status
                      </label>
                      <select
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unitData.occupancyStatus}
                        onChange={(e) =>
                          setUnitData({
                            ...unitData,
                            occupancyStatus: e.target.value,
                          })
                        }
                        disabled={loading}
                      >
                        {occupancyStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unitData.bedrooms}
                        onChange={(e) =>
                          setUnitData({ ...unitData, bedrooms: e.target.value })
                        }
                        disabled={loading}
                        min="0"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unitData.bathrooms}
                        onChange={(e) =>
                          setUnitData({
                            ...unitData,
                            bathrooms: e.target.value,
                          })
                        }
                        disabled={loading}
                        min="0"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Size (sq ft)
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unitData.sizeSquareFt}
                        onChange={(e) =>
                          setUnitData({
                            ...unitData,
                            sizeSquareFt: e.target.value,
                          })
                        }
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
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unitData.monthlyRent}
                        onChange={(e) =>
                          setUnitData({
                            ...unitData,
                            monthlyRent: e.target.value,
                          })
                        }
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
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={unitData.securityDeposit}
                        onChange={(e) =>
                          setUnitData({
                            ...unitData,
                            securityDeposit: e.target.value,
                          })
                        }
                        disabled={loading}
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>
                  {/* Current Unit Status for Multi-Unit Properties */}
                  {isMultiUnitProperty() && selectedUnitData && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">
                        Current Unit Information
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current Status:</span>
                          <span
                            className={`ml-2 font-semibold ${
                              selectedUnitData.occupancy_status === "occupied"
                                ? "text-green-600"
                                : selectedUnitData.occupancy_status ===
                                  "maintenance"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {selectedUnitData.occupancy_status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Current Rent:</span>
                          <span className="ml-2 font-semibold">
                            KSh{" "}
                            {selectedUnitData.monthly_rent?.toLocaleString() ||
                              "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Size:</span>
                          <span className="ml-2 font-semibold">
                            {selectedUnitData.size_sq_ft || "N/A"} sq ft
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Layout:</span>
                          <span className="ml-2 font-semibold">
                            {selectedUnitData.bedrooms}BR/
                            {selectedUnitData.bathrooms}BA
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                    {isMultiUnitProperty() && (
                      <button
                        type="button"
                        onClick={() => setCurrentView("property")}
                        disabled={loading}
                        className="px-6 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                      >
                        Back to Property
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleUnitSubmit}
                      disabled={
                        loading ||
                        success ||
                        (!selectedUnitData && isMultiUnitProperty())
                      }
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                    >
                      {loading && (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {loading
                        ? "Updating..."
                        : success
                        ? "Updated!"
                        : "Update Unit"}
                    </button>
                  </div>
                </div>
              )}

              {/* No Unit Selected Message for Multi-Unit Properties */}
              {isMultiUnitProperty() && !selectedUnitData && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Home className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Unit to Edit
                  </h3>
                  <p className="text-gray-500">
                    Choose a unit from the list above to edit its details.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePropertyModal;
