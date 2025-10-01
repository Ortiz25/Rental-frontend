import React, { useState, useEffect } from "react";
import {
  Edit,
  TrashIcon,
  MoreHorizontal,
  Home,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import UpdatePropertyModal from "./modals/updatePropertyModal";
import DeletePropertyModal from "./modals/deletePropertyModal";
import { formatCurrency } from "../utils/helperFunctions";

const PropertyCard = ({ property, onUpdate }) => {
  const userRole = localStorage.getItem("userRole");
  console.log(!userRole === "Staff");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [showUnitsDropdown, setShowUnitsDropdown] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Default placeholder image
  const defaultImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showUnitsDropdown &&
        !event.target.closest(".units-dropdown-container")
      ) {
        setShowUnitsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showUnitsDropdown]);

  const isDropdownVisible = showUnitsDropdown || isHovering;
  // Fetch property photos
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!property.id) return;

      try {
        setLoadingPhotos(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5020/api/properties/${property.id}/photos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.status === 200 && result.data.length > 0) {
            setPhotos(result.data);
          } else {
            setPhotos([]);
          }
        } else {
          setPhotos([]);
        }
      } catch (error) {
        console.error("Error fetching photos:", error);
        setPhotos([]);
      } finally {
        setLoadingPhotos(false);
      }
    };

    fetchPhotos();
  }, [property.id]);

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
      if (onUpdate) {
        await onUpdate();
      }
      console.log(`Property ${propertyId} deleted successfully`);
    } catch (error) {
      console.error("Error after property deletion:", error);
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % Math.max(photos.length, 1));
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? Math.max(photos.length - 1, 0) : prev - 1
    );
  };

  const currentPhoto =
    photos.length > 0
      ? `http://localhost:5020/api/properties/photos/${photos[currentPhotoIndex].file_name}`
      : defaultImage;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-visible">
      {/* Photo Section */}
      <div className="relative h-48 sm:h-56 bg-gray-200 overflow-hidden group rounded-t-lg">
        {loadingPhotos ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse flex flex-col items-center">
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <img
              src={currentPhoto}
              alt={property.propertyName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = defaultImage;
              }}
            />

            {/* Photo Counter Badge */}
            {photos.length > 0 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <Camera className="w-3 h-3 mr-1" />
                {currentPhotoIndex + 1}/{photos.length}
              </div>
            )}

            {/* No Photos Badge */}
            {photos.length === 0 && (
              <div className="absolute top-2 right-2 bg-gray-600 bg-opacity-80 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <Camera className="w-3 h-3 mr-1" />
                No Photos
              </div>
            )}

            {/* Photo Navigation Arrows - Only show if multiple photos */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Photo Dots Indicator */}
            {photos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentPhotoIndex
                        ? "bg-white w-4"
                        : "bg-white bg-opacity-50"
                    }`}
                    aria-label={`Go to photo ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 lg:p-6 relative">
        {/* Property Name - New Addition */}
        <div className="mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
            {property.propertyName}
          </h2>
        </div>

        {/* Header Section - Address and Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-sm sm:text-base text-gray-600 leading-tight">
              {property.address}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-1 lg:gap-2 flex-shrink-0">
            {userRole !== "Staff" && (
              <button
                onClick={handleEditProperty}
                className="flex items-center px-2 py-1 sm:px-3 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Property"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Property</span>
                <span className="sm:hidden">Edit</span>
              </button>
            )}
            {property.totalUnits > 1 && (
              <div
                className="relative units-dropdown-container"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <button
                  onClick={() => setShowUnitsDropdown(!showUnitsDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                >
                  <Home className="w-4 h-4" />
                  <span>Units ({property.units?.length || 0})</span>
                </button>

                {isDropdownVisible && (
                  <>
                    {/* Mobile: Full card width */}
                    <div
                      className="sm:hidden absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 left-[-0.75rem] right-[-0.75rem]"
                      style={{ width: "calc(100% + 1.5rem)" }}
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                    >
                      <div className="p-3">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b">
                          <span className="text-sm font-semibold text-gray-700">
                            Unit Overview
                          </span>
                          <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              {property.units?.filter(
                                (u) => u.occupancy_status === "occupied"
                              ).length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              {property.units?.filter(
                                (u) => u.occupancy_status === "vacant"
                              ).length || 0}
                            </span>
                          </div>
                        </div>

                        {/* Units List */}
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1 pb-2">
                          {property.units?.map((unit) => (
                            <button
                              key={unit.id}
                              onClick={() => {
                                handleEditUnit(unit);
                                setShowUnitsDropdown(false);
                                setIsHovering(false);
                              }}
                              disabled={userRole === "Staff"}
                              className="w-full text-left p-2.5 hover:bg-gray-50 active:bg-gray-100 rounded-lg border border-gray-100 transition-all hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900">
                                      Unit {unit.unit_number}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                                        unit.occupancy_status === "occupied"
                                          ? "bg-green-100 text-green-700 border border-green-200"
                                          : unit.occupancy_status ===
                                            "maintenance"
                                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                          : "bg-gray-100 text-gray-600 border border-gray-200"
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          unit.occupancy_status === "occupied"
                                            ? "bg-green-500"
                                            : unit.occupancy_status ===
                                              "maintenance"
                                            ? "bg-yellow-500"
                                            : "bg-gray-400"
                                        }`}
                                      ></span>
                                      {unit.occupancy_status === "occupied"
                                        ? "Occupied"
                                        : unit.occupancy_status ===
                                          "maintenance"
                                        ? "Maintenance"
                                        : "Vacant"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                                    <span>{unit.bedrooms} bed</span>
                                    <span>•</span>
                                    <span>{unit.bathrooms} bath</span>
                                    <span>•</span>
                                    <span className="font-medium text-gray-700">
                                      KES {unit.monthly_rent?.toLocaleString()}
                                      /mo
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Right-aligned, fixed width */}
                    <div
                      className="hidden sm:block absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 w-72"
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                    >
                      {/* Same content as above */}
                      <div className="p-3">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b">
                          <span className="text-sm font-semibold text-gray-700">
                            Unit Overview
                          </span>
                          <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              {property.units?.filter(
                                (u) => u.occupancy_status === "occupied"
                              ).length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              {property.units?.filter(
                                (u) => u.occupancy_status === "vacant"
                              ).length || 0}
                            </span>
                          </div>
                        </div>

                        {/* Units List */}
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1 pb-2">
                          {property.units?.map((unit) => (
                            <button
                              key={unit.id}
                              onClick={() => {
                                handleEditUnit(unit);
                                setShowUnitsDropdown(false);
                                setIsHovering(false);
                              }}
                              disabled={userRole === "Staff"}
                              className="w-full text-left p-2.5 hover:bg-gray-50 active:bg-gray-100 rounded-lg border border-gray-100 transition-all hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900">
                                      Unit {unit.unit_number}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                                        unit.occupancy_status === "occupied"
                                          ? "bg-green-100 text-green-700 border border-green-200"
                                          : unit.occupancy_status ===
                                            "maintenance"
                                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                          : "bg-gray-100 text-gray-600 border border-gray-200"
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          unit.occupancy_status === "occupied"
                                            ? "bg-green-500"
                                            : unit.occupancy_status ===
                                              "maintenance"
                                            ? "bg-yellow-500"
                                            : "bg-gray-400"
                                        }`}
                                      ></span>
                                      {unit.occupancy_status === "occupied"
                                        ? "Occupied"
                                        : unit.occupancy_status ===
                                          "maintenance"
                                        ? "Maintenance"
                                        : "Vacant"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                    <span>{unit.bedrooms} bed</span>
                                    <span>•</span>
                                    <span>{unit.bathrooms} bath</span>
                                    <span>•</span>
                                    <span className="font-medium text-gray-700">
                                      KES {unit.monthly_rent?.toLocaleString()}
                                      /mo
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {userRole !== "Staff" && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Property"
              >
                <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="space-y-1 sm:space-y-2">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-medium">Type:</span> {property.type}
            </p>

            {/* Show bedrooms/bathrooms for single unit properties */}
            {property.totalUnits === 1 && property.bedrooms !== undefined && (
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Bedrooms:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {property.bedrooms}
                </span>
              </p>
            )}

            {property.totalUnits === 1 && property.bathrooms !== undefined && (
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Bathrooms:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {property.bathrooms}
                </span>
              </p>
            )}

            {/* Show total units for multi-unit properties */}
            {property.totalUnits > 1 && (
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Total Units:</span>{" "}
                {property.totalUnits}
              </p>
            )}

            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-medium">Rent:</span>
              <span className="font-semibold text-gray-900 ml-1">
                {formatCurrency(property.monthlyRent) || "N/A"}/mo
              </span>
            </p>

            {/* Show square footage for single unit if available */}
            {property.totalUnits === 1 && property.squareFootage && (
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Size:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {property.squareFootage} sq ft
                </span>
              </p>
            )}
          </div>

          <div className="space-y-1 sm:space-y-2">
            {/* For multi-unit properties, show occupancy stats */}
            {property.totalUnits > 1 && (
              <>
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
              </>
            )}

            {/* For single-unit properties, show status and security deposit */}
            {property.totalUnits === 1 && (
              <>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`font-semibold ml-1 ${
                      property.occupancyStatus === "Occupied"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {property.occupancyStatus}
                  </span>
                </p>
                {property.securityDeposit && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Security Deposit:</span>
                    <span className="font-semibold text-gray-900 ml-1">
                      {formatCurrency(property.securityDeposit)}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Status Badge Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
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

          <div className="hidden sm:flex items-center text-xs text-gray-500">
            <span>Last updated: Today</span>
          </div>
        </div>

        {/* Amenities Section */}
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

            <div className="sm:hidden">
              <p className="text-xs text-gray-500">
                {property.amenities.length} amenities available
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
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
