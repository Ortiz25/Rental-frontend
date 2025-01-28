import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  Plus
} from "lucide-react";
import Navbar from "../layout/navbar.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import AddPropertyModal from "../components/modals/AddPropertyModal.jsx";

const initialProperties = [
  {
    id: 1,
    address: "123 Urban Loft, Downtown",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    monthlyRent: 2750,
    occupancyStatus: "Occupied",
    amenities: ["Gym", "Parking", "Balcony", "Smart Home"],
    totalUnits: 25,
    occupiedUnits: 25,
    vacantUnits: 0,
    occupancyState: "Full",
  },
  {
    id: 2,
    address: "456 Suburban Haven, Midtown",
    type: "Single Family Home",
    bedrooms: 3,
    bathrooms: 2.5,
    squareFootage: 1800,
    monthlyRent: 3200,
    occupancyStatus: "Vacant",
    amenities: ["Garden", "Home Office", "Garage"],
    totalUnits: 12,
    occupiedUnits: 8,
    vacantUnits: 4,
    occupancyState: "Partial",
  },
  {
    id: 3,
    address: "789 Tech Campus Residences",
    type: "Apartment Complex",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 850,
    monthlyRent: 2300,
    occupancyStatus: "Occupied",
    amenities: ["Co-working Space", "Fitness Center", "Electric Charging"],
    totalUnits: 50,
    occupiedUnits: 45,
    vacantUnits: 5,
    occupancyState: "Partial",
  },
  {
    id: 4,
    address: "101 Waterfront Condos",
    type: "Luxury Condominiums",
    bedrooms: 3,
    bathrooms: 3,
    squareFootage: 2200,
    monthlyRent: 4500,
    occupancyStatus: "Occupied",
    amenities: ["Pool", "Concierge", "Marina View", "Security"],
    totalUnits: 30,
    occupiedUnits: 27,
    vacantUnits: 3,
    occupancyState: "Partial",
  },
];

const PropertyManagement = () => {
  const [activeModule, setActiveModule] = useState("Property Management");
  const [properties, setProperties] = useState(initialProperties);
  const [filteredProperties, setFilteredProperties] =
    useState(initialProperties);

  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    minRent: 0,
    maxRent: 10000,
    bedrooms: "",
    occupancyState: "",
    minVacancies: 0,
  });

  // Total Portfolio Summary
  const totalPortfolioStats = {
    totalProperties: properties.length,
    totalUnits: properties.reduce((sum, prop) => sum + prop.totalUnits, 0),
    totalOccupiedUnits: properties.reduce(
      (sum, prop) => sum + prop.occupiedUnits,
      0
    ),
    totalVacantUnits: properties.reduce(
      (sum, prop) => sum + prop.vacantUnits,
      0
    ),
    occupancyRate: (
      (properties.reduce((sum, prop) => sum + prop.occupiedUnits, 0) /
        properties.reduce((sum, prop) => sum + prop.totalUnits, 0)) *
      100
    ).toFixed(2),
  };

   // Filter function for properties
   useEffect(() => {
    const results = properties.filter(property => 
      property.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(results);
  }, [searchTerm, properties]);

  // Handle adding new property
  const handleAddProperty = (newPropertyData) => {
    const newProperty = {
      id: Date.now(),
      ...newPropertyData,
      status: 'Available',
      occupancyState: 'Vacant',
      occupiedUnits: 0,
      vacantUnits: 1,
      totalUnits: 1
    };

    setProperties([...properties, newProperty]);
  };

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <p className="text-gray-600">Total Properties</p>
            <p className="text-xl font-bold">
              {totalPortfolioStats.totalProperties}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Total Units</p>
            <p className="text-xl font-bold">
              {totalPortfolioStats.totalUnits}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Occupied Units</p>
            <p className="text-xl font-bold text-green-600">
              {totalPortfolioStats.totalOccupiedUnits}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Vacant Units</p>
            <p className="text-xl font-bold text-red-600">
              {totalPortfolioStats.totalVacantUnits}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Overall Occupancy</p>
            <p className="text-xl font-bold">
              {totalPortfolioStats.occupancyRate}%
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full p-2 pl-8 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-2 top-3 text-gray-400" />
          </div>

          <button
            onClick={() => setShowAddPropertyModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center text-sm sm:text-base transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span>Add Property</span>
          </button>
          <AddPropertyModal
        isOpen={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
        onSubmit={(propertyData) => {
          handleAddProperty(propertyData);
          setShowAddPropertyModal(false);
        }}
      />
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {/* Bedrooms Filter */}
          <select
            className="p-2 border rounded w-full"
            value={filters.bedrooms}
            onChange={(e) =>
              setFilters({ ...filters, bedrooms: e.target.value })
            }
          >
            <option value="">Bedrooms</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
          </select>

          {/* Occupancy State Filter */}
          <select
            className="p-2 border rounded w-full"
            value={filters.occupancyState}
            onChange={(e) =>
              setFilters({ ...filters, occupancyState: e.target.value })
            }
          >
            <option value="">Occupancy State</option>
            <option value="Full">Full</option>
            <option value="Partial">Partial</option>
          </select>

          {/* Rent Range */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min Rent"
              className="p-2 border rounded w-full"
              value={filters.minRent}
              onChange={(e) =>
                setFilters({ ...filters, minRent: Number(e.target.value) })
              }
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max Rent"
              className="p-2 border rounded w-full"
              value={filters.maxRent}
              onChange={(e) =>
                setFilters({ ...filters, maxRent: Number(e.target.value) })
              }
            />
          </div>

          {/* Min Vacancies Filter */}
          <input
            type="number"
            placeholder="Min Vacancies"
            className="p-2 border rounded w-full"
            value={filters.minVacancies}
            onChange={(e) =>
              setFilters({ ...filters, minVacancies: Number(e.target.value) })
            }
          />

          {/* Apply Filters Button */}
          <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center w-full">
            <FilterIcon className="mr-2" /> Apply Filters
          </button>
        </div>

        {/* Property Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </Navbar>
  );
};

export default PropertyManagement;
