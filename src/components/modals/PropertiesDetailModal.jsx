import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  BedIcon,
  BathIcon,
  Ruler,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
  Camera,
  Home,
} from "lucide-react";
import { formatCurrency } from "../../utils/helperFunctions";

const PropertyDetailsModal = ({ isOpen, onClose, property, onContactInquiry }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  const defaultImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Fetch property photos
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!property?.id || !isOpen) return;

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
    setCurrentPhotoIndex(0);
  }, [property?.id, isOpen]);

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

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{property.propertyName}</h2>
              <div className="flex items-center gap-2 text-blue-100">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{property.address}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="relative h-96 bg-gray-200">
          {loadingPhotos ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="animate-pulse flex flex-col items-center">
                <Camera className="w-12 h-12 text-gray-400 mb-3" />
                <span className="text-sm text-gray-500">Loading photos...</span>
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

              {/* Photo Counter */}
              {photos.length > 0 && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 font-medium">
                  <Camera className="w-4 h-4" />
                  {currentPhotoIndex + 1}/{photos.length}
                </div>
              )}

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full transition-all shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Photo Dots */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentPhotoIndex
                          ? "bg-white w-8"
                          : "bg-white/60 w-2 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Property Type Badge */}
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {property.type}
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {property.vacantUnits.length} Available
            </span>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">About This Property</h3>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Property Details Grid */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Property Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.totalUnits > 1 ? (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Building2 className="w-5 h-5" />
                      <span className="text-sm">Units Available</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.vacantUnits.length}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <BedIcon className="w-5 h-5" />
                      <span className="text-sm">Bedrooms</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.min(...property.vacantUnits.map(u => u.bedrooms))} - {Math.max(...property.vacantUnits.map(u => u.bedrooms))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <BathIcon className="w-5 h-5" />
                      <span className="text-sm">Bathrooms</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.min(...property.vacantUnits.map(u => u.bathrooms))} - {Math.max(...property.vacantUnits.map(u => u.bathrooms))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm">Rent Range</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {Math.min(...property.vacantUnits.map(u => u.monthly_rent)).toLocaleString()} - {Math.max(...property.vacantUnits.map(u => u.monthly_rent)).toLocaleString()}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <BedIcon className="w-5 h-5" />
                      <span className="text-sm">Bedrooms</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.vacantUnits[0].bedrooms}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <BathIcon className="w-5 h-5" />
                      <span className="text-sm">Bathrooms</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {property.vacantUnits[0].bathrooms}
                    </div>
                  </div>
                  {property.vacantUnits[0].size_sq_ft && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Ruler className="w-5 h-5" />
                        <span className="text-sm">Size</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {property.vacantUnits[0].size_sq_ft} ft²
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm">Monthly Rent</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      KES {property.vacantUnits[0].monthly_rent.toLocaleString()}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Available Units List */}
          {property.vacantUnits.length > 1 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Available Units ({property.vacantUnits.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {property.vacantUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900 text-lg">
                        Unit {unit.unit_number}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        KES {unit.monthly_rent.toLocaleString()}/mo
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <BedIcon className="w-4 h-4" />
                        {unit.bedrooms} bed
                      </span>
                      <span className="flex items-center gap-1">
                        <BathIcon className="w-4 h-4" />
                        {unit.bathrooms} bath
                      </span>
                      {unit.size_sq_ft && (
                        <span className="flex items-center gap-1">
                          <Ruler className="w-4 h-4" />
                          {unit.size_sq_ft} ft²
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white transition-all"
          >
            Close
          </button>
          <button
            onClick={() => {
              onContactInquiry(property);
              onClose();
            }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Contact Us About This Property
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;