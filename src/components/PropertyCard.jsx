import React, { useState, useEffect } from "react";
import { Edit, TrashIcon, MoreHorizontal, Home, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import UpdatePropertyModal from "./modals/updatePropertyModal";
import DeletePropertyModal from "./modals/deletePropertyModal";
import { formatCurrency } from "../utils/helperFunctions";

const PropertyCard = ({ property, onUpdate }) => {
  console.log(property);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // Default placeholder image
  const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Fetch property photos
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!property.id) return;

      try {
        setLoadingPhotos(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `/backend/api/properties/${property.id}/photos`,
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

  const currentPhoto = photos.length > 0 
    ? `/backend/api/properties/photos/${photos[currentPhotoIndex].file_name}`
    : defaultImage;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {/* Photo Section */}
      <div className="relative h-48 sm:h-56 bg-gray-200 overflow-hidden group">
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
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight pr-2">
            {property.address}
          </h3>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-1 lg:gap-2 flex-shrink-0">
            <button
              onClick={handleEditProperty}
              className="flex items-center px-2 py-1 sm:px-3 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Property"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Property</span>
              <span className="sm:hidden">Edit</span>
            </button>

            {property.totalUnits > 1 && (
              <div className="relative group">
                <button className="flex items-center px-2 py-1 sm:px-3 text-xs sm:text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Units</span>
                  <span className="sm:hidden">Units</span>
                </button>

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

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Property"
            >
              <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
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
                {formatCurrency(property.monthlyRent) || "N/A"}/mo
              </span>
            </p>
          </div>

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