import React, { useState, useEffect } from "react";
import {
  MapPinIcon,
  BedIcon,
  BathIcon,
  HomeIcon,
  ChevronLeft,
  ChevronRight,
  Camera,
  Ruler,
  DollarSign,
  Building2,
  CheckCircle,
  Star,
  Heart,
  Share2,
  Phone,
} from "lucide-react";
import PropertyDetailsModal from "./modals/PropertiesDetailModal";

const VacancyCard = ({ property, onContactInquiry }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const defaultImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Fetch property photos
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!property.id) return;

      try {
        setLoadingPhotos(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `/backend/properties/${property.id}/photos`,
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
      ? `/backend/properties/photos/${photos[currentPhotoIndex].file_name}`
      : defaultImage;

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  const handleShare = () => {
    // Simple share functionality
    if (navigator.share) {
      navigator.share({
        title: property.propertyName,
        text: `Check out this property: ${property.propertyName}`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Calculate rent range
  const rentRange =
    property.vacantUnits.length > 1
      ? {
          min: Math.min(...property.vacantUnits.map((u) => u.monthly_rent)),
          max: Math.max(...property.vacantUnits.map((u) => u.monthly_rent)),
        }
      : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Photo Section */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        {loadingPhotos ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="animate-pulse flex flex-col items-center">
              <Camera className="w-10 h-10 text-gray-400 mb-3" />
              <span className="text-sm text-gray-500">Loading photos...</span>
            </div>
          </div>
        ) : (
          <>
            <img
              src={currentPhoto}
              alt={property.propertyName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = defaultImage;
              }}
            />

            {/* Photo Counter Badge */}
            {photos.length > 0 && (
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 font-medium">
                <Camera className="w-4 h-4" />
                {currentPhotoIndex + 1}/{photos.length}
              </div>
            )}

            {/* Vacancy Badge */}
            <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              {property.vacantUnits.length} Available
            </div>

            {/* Photo Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Dots */}
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentPhotoIndex
                        ? "bg-white w-6"
                        : "bg-white/60 w-2 hover:bg-white/80"
                    }`}
                    aria-label={`Go to photo ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Action Buttons Overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={handleFavorite}
                className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-lg transition-all"
                title="Add to favorites"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-lg transition-all"
                title="Share property"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Property Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
              {property.propertyName}
            </h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {property.type}
            </span>
          </div>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{property.address}</span>
          </div>

          {/* Price Display */}
          <div className="flex items-baseline gap-2 mb-4">
            {rentRange ? (
              <>
                <span className="text-2xl font-bold text-gray-900">
                  KES {rentRange.min.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">-</span>
                <span className="text-xl font-semibold text-gray-700">
                  {rentRange.max.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">/month</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-900">
                  KES {property.vacantUnits[0].monthly_rent.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">/month</span>
              </>
            )}
          </div>
        </div>

        {/* Property Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100">
          {property.totalUnits > 1 ? (
            <>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-600">Units</div>
                  <div className="font-semibold text-gray-900">
                    {property.vacantUnits.length}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BedIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-600">Bedrooms</div>
                  <div className="font-semibold text-gray-900">
                    {Math.min(...property.vacantUnits.map((u) => u.bedrooms))} -{" "}
                    {Math.max(...property.vacantUnits.map((u) => u.bedrooms))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BathIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-600">Bathrooms</div>
                  <div className="font-semibold text-gray-900">
                    {Math.min(...property.vacantUnits.map((u) => u.bathrooms))}{" "}
                    -{" "}
                    {Math.max(...property.vacantUnits.map((u) => u.bathrooms))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <BedIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-600">Bedrooms</div>
                  <div className="font-semibold text-gray-900">
                    {property.vacantUnits[0].bedrooms}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BathIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-600">Bathrooms</div>
                  <div className="font-semibold text-gray-900">
                    {property.vacantUnits[0].bathrooms}
                  </div>
                </div>
              </div>
              {property.vacantUnits[0].size_sq_ft && (
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-600">Size</div>
                    <div className="font-semibold text-gray-900">
                      {property.vacantUnits[0].size_sq_ft} ft²
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Amenities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {property.amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {property.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Available Units Dropdown for Multi-unit Properties */}
        {property.vacantUnits.length > 1 && (
          <div className="mb-4">
            <details className="group/details">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">
                    View All {property.vacantUnits.length} Available Units
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-open/details:rotate-90 transition-transform" />
                </div>
              </summary>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {property.vacantUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                    onClick={() => onContactInquiry(property, unit)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-900">
                        Unit {unit.unit_number}
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        KES {unit.monthly_rent.toLocaleString()}/mo
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <span>{unit.bedrooms} bed</span>
                      <span>•</span>
                      <span>{unit.bathrooms} bath</span>
                      {unit.size_sq_ft && (
                        <>
                          <span>•</span>
                          <span>{unit.size_sq_ft} ft²</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onContactInquiry(property)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Contact Us
          </button>
          <button
            onClick={() => setShowDetailsModal(true)}
            className="px-4 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition-all"
          >
            Details
          </button>
        </div>
      </div>

      <PropertyDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        property={property}
        onContactInquiry={onContactInquiry}
      />
    </div>
  );
};

export default VacancyCard;
