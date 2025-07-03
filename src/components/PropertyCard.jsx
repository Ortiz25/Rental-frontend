import React, { useState, useEffect } from "react";
import { Edit, TrashIcon, MoreHorizontal, Home } from "lucide-react";
import UpdatePropertyModal from "./modals/updatePropertyModal";
import DeletePropertyModal from "./modals/deletePropertyModal";

const PropertyCard = ({ property, onUpdate }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleUpdateProperty = async (updatedProperty) => {
    try {
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      console.error("Error updating property:", error);
    }
  };

  const handleEditProperty = () => {
    setSelectedUnit(null);
    setShowUpdateModal(true);
  };

  const handleEditUnit = (unit) => {
    setSelectedUnit(unit);
    setShowUpdateModal(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      // Call the parent's refresh function to update the property list
      if (onUpdate) {
        await onUpdate();
      }

      // Show success message (optional)
      console.log(`Property ${propertyId} deleted successfully`);
    } catch (error) {
      console.error("Error after property deletion:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-shadow">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        {/* Property Address - Responsive Text */}
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight pr-2">
          {property.address}
        </h3>

        {/* Action Buttons - Responsive Layout */}
        <div className="flex flex-wrap gap-2 sm:gap-1 lg:gap-2 flex-shrink-0">
          {/* Edit Property Button */}
          <button
            onClick={handleEditProperty}
            className="flex items-center px-2 py-1 sm:px-3 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Property"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Property</span>
            <span className="sm:hidden">Edit</span>
          </button>

          {/* Edit Units Button - Only show for multi-unit properties */}
          {property.totalUnits > 1 && (
            <div className="relative group">
              <button className="flex items-center px-2 py-1 sm:px-3 text-xs sm:text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Units</span>
                <span className="sm:hidden">Units</span>
              </button>

              {/* Units Dropdown - Responsive positioning */}
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 min-w-32 sm:min-w-48 max-w-64">
                <div className="p-2">
                  <div className="text-xs text-gray-500 font-medium px-2 py-1">
                    Edit Unit:
                  </div>
                  <div className="max-h-32 sm:max-h-48 overflow-y-auto">
                    {property.units &&
                      property.units.map((unit) => (
                        <button
                          key={unit.id}
                          onClick={() => handleEditUnit(unit)}
                          className="w-full text-left px-2 py-1 hover:bg-gray-50 rounded flex justify-between items-center text-xs sm:text-sm"
                        >
                          <span className="truncate">
                            Unit {unit.unit_number}
                          </span>
                          <span
                            className={`px-1 py-0.5 rounded text-xs flex-shrink-0 ml-2 ${
                              unit.occupancy_status === "occupied"
                                ? "bg-green-100 text-green-700"
                                : unit.occupancy_status === "maintenance"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {unit.occupancy_status.charAt(0).toUpperCase()}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Property"
          >
            <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Property Details Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
        {/* Left Column */}
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">Type:</span> {property.type}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">Total Units:</span>{" "}
            {property.totalUnits}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">Rent:</span>
            <span className="font-semibold text-gray-900 ml-1">
              KSh {property.monthlyRent?.toLocaleString() || "N/A"}/mo
            </span>
          </p>
        </div>

        {/* Right Column */}
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">Occupied:</span>
            <span className="text-green-600 font-semibold ml-1">
              {property.occupiedUnits}
            </span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">Vacant:</span>
            <span className="text-red-600 font-semibold ml-1">
              {property.vacantUnits}
            </span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">Occupancy:</span>
            <span className="font-semibold ml-1">
              {property.occupancyRate}%
            </span>
          </p>
        </div>
      </div>

      {/* Status Badge Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        {/* Occupancy Status Badge */}
        <span
          className={`inline-flex items-center px-2 py-1 rounded-md text-xs sm:text-sm font-medium ${
            property.occupancyState === "Full"
              ? "bg-green-100 text-green-800"
              : property.vacantUnits > 0
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {property.occupancyState === "Full"
            ? "Fully Occupied"
            : property.occupancyState === "Empty"
            ? "All Units Vacant"
            : `${property.vacantUnits} Unit${
                property.vacantUnits !== 1 ? "s" : ""
              } Available`}
        </span>

        {/* Additional Info for larger screens */}
        <div className="hidden sm:flex items-center text-xs text-gray-500">
          <span>Last updated: Today</span>
        </div>
      </div>

      {/* Amenities Section - Show on larger screens or collapsible on mobile */}
      {property.amenities && property.amenities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="hidden sm:block">
            <p className="text-xs text-gray-500 mb-1">Amenities:</p>
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 4).map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                  +{property.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Mobile amenities - just count */}
          <div className="sm:hidden">
            <p className="text-xs text-gray-500">
              {property.amenities.length} amenities available
            </p>
          </div>
        </div>
      )}

      {/* Modal Component */}
      <UpdatePropertyModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdateProperty}
        property={property}
      />
      <DeletePropertyModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteProperty}
        property={property}
      />
    </div>
  );
};

export default PropertyCard;
