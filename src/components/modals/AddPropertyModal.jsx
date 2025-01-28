import React, { useState } from "react";
import { Camera, X } from "lucide-react";

const AddPropertyModal = ({ isOpen, onClose, onSubmit }) => {
  const [propertyData, setPropertyData] = useState({
    name: "",
    address: "",
    type: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    monthlyRent: "",
    securityDeposit: "",
    amenities: [],
    status: "Available",
    photos: [],
    description: "",
    parkingSpots: "",
    utilities: [],
  });

  const propertyTypes = [
    "Apartment",
    "House",
    "Condo",
    "Townhouse",
    "Studio",
    "Duplex",
  ];

  const amenityOptions = [
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
  ];

  const utilityOptions = [
    "Water",
    "Electricity",
    "Gas",
    "Internet",
    "Trash",
    "Cable TV",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format the property data
    const formattedData = {
      propertyName: propertyData.name,
      address: propertyData.address,
      type: propertyData.type,
      bedrooms: parseInt(propertyData.bedrooms),
      bathrooms: parseFloat(propertyData.bathrooms),
      squareFootage: parseInt(propertyData.size),
      monthlyRent: parseFloat(propertyData.monthlyRent),
      securityDeposit: parseFloat(propertyData.securityDeposit),
      amenities: propertyData.amenities,
      utilities: propertyData.utilities,
      description: propertyData.description,
      photos: propertyData.photos,
    };

    onSubmit(formattedData);
    onClose();
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setPropertyData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files],
    }));
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Add New Property</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={propertyData.name}
                  onChange={(e) =>
                    setPropertyData({ ...propertyData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={propertyData.address}
                  onChange={(e) =>
                    setPropertyData({
                      ...propertyData,
                      address: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Type
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={propertyData.type}
                  onChange={(e) =>
                    setPropertyData({ ...propertyData, type: e.target.value })
                  }
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={propertyData.bedrooms}
                    onChange={(e) =>
                      setPropertyData({
                        ...propertyData,
                        bedrooms: e.target.value,
                      })
                    }
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={propertyData.bathrooms}
                    onChange={(e) =>
                      setPropertyData({
                        ...propertyData,
                        bathrooms: e.target.value,
                      })
                    }
                    min="0"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Size (sq ft)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={propertyData.size}
                  onChange={(e) =>
                    setPropertyData({ ...propertyData, size: e.target.value })
                  }
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Financial and Additional Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Monthly Rent ($)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={propertyData.monthlyRent}
                    onChange={(e) =>
                      setPropertyData({
                        ...propertyData,
                        monthlyRent: e.target.value,
                      })
                    }
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Security Deposit ($)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={propertyData.securityDeposit}
                    onChange={(e) =>
                      setPropertyData({
                        ...propertyData,
                        securityDeposit: e.target.value,
                      })
                    }
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Included Utilities
                </label>
                <div className="grid grid-cols-2 gap-2 p-2 border rounded">
                  {utilityOptions.map((utility) => (
                    <label
                      key={utility}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={propertyData.utilities.includes(utility)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPropertyData({
                              ...propertyData,
                              utilities: [...propertyData.utilities, utility],
                            });
                          } else {
                            setPropertyData({
                              ...propertyData,
                              utilities: propertyData.utilities.filter(
                                (u) => u !== utility
                              ),
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{utility}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 gap-2 p-2 border rounded max-h-40 overflow-y-auto">
                  {amenityOptions.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={propertyData.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPropertyData({
                              ...propertyData,
                              amenities: [...propertyData.amenities, amenity],
                            });
                          } else {
                            setPropertyData({
                              ...propertyData,
                              amenities: propertyData.amenities.filter(
                                (a) => a !== amenity
                              ),
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Photos Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Property Photos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label className="cursor-pointer text-blue-500 hover:text-blue-600">
                    <span>Upload photos</span>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              {propertyData.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {propertyData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded">
                        <p className="text-sm p-2">{photo.name}</p>
                      </div>
                      <button
                        type="button"
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                        onClick={() =>
                          setPropertyData({
                            ...propertyData,
                            photos: propertyData.photos.filter(
                              (_, i) => i !== index
                            ),
                          })
                        }
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              value={propertyData.description}
              onChange={(e) =>
                setPropertyData({
                  ...propertyData,
                  description: e.target.value,
                })
              }
              placeholder="Describe the property..."
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;
