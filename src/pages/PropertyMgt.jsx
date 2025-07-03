import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useLoaderData } from "react-router";
import { redirect } from "react-router";
import Navbar from "../layout/navbar.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import AddPropertyModal from "../components/modals/AddPropertyModal.jsx";
import UpdatePropertyModal from "../components/modals/updatePropertyModal.jsx";

const PropertyManagement = () => {
  const [activeModule, setActiveModule] = useState("Property Management");
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalProperties: 0,
    totalUnits: 0,
    totalOccupiedUnits: 0,
    totalVacantUnits: 0,
    overallOccupancyRate: 0,
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [filters, setFilters] = useState({
    minRent: "",
    maxRent: "",
    bedrooms: "",
    occupancyState: "",
    minVacancies: "",
    propertyType: "",
  });

  const loaderData = useLoaderData();

  // Fetch properties from API
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Fetching properties...");
      const response = await fetch("http://localhost:5020/api/properties", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const keysToRemove = ["token", "user", "name", "userRole", "userId"];
          keysToRemove.forEach((key) => localStorage.removeItem(key));
          window.location.href = "/";
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Properties data received:", result);

      if (result.status === 200) {
        setProperties(result.data.properties);
        setFilteredProperties(result.data.properties);
        setPortfolioStats(result.data.portfolioStats);
        setLastUpdated(new Date());
        console.log("Properties updated successfully");
      } else {
        throw new Error(result.message || "Failed to fetch properties");
      }
    } catch (error) {
      console.error("Properties fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  // Filter properties based on search term and filters
  useEffect(() => {
    let results = properties.filter((property) => {
      const matchesSearch =
        property.propertyName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilters =
        (filters.minRent === "" ||
          property.monthlyRent >= parseFloat(filters.minRent)) &&
        (filters.maxRent === "" ||
          property.monthlyRent <= parseFloat(filters.maxRent)) &&
        (filters.bedrooms === "" ||
          property.bedrooms === parseInt(filters.bedrooms)) &&
        (filters.occupancyState === "" ||
          property.occupancyState === filters.occupancyState) &&
        (filters.minVacancies === "" ||
          property.vacantUnits >= parseInt(filters.minVacancies)) &&
        (filters.propertyType === "" || property.type === filters.propertyType);

      return matchesSearch && matchesFilters;
    });

    setFilteredProperties(results);
  }, [searchTerm, properties, filters]);

  const handleUpdateProperty = async (updatedProperty) => {
    try {
      // Refresh the parent component's property list
      if (onUpdate) {
        await onUpdate(); // This will call fetchProperties() in PropertyManagement
      }
    } catch (error) {
      console.error("Error updating property:", error);
    }
  };

  // Handle adding new property
  const handleAddProperty = async (newPropertyData) => {
    try {
      const token = localStorage.getItem("token");

      console.log("Creating new property:", newPropertyData);
      const response = await fetch("http://localhost:5020/api/properties", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPropertyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 201) {
        console.log("Property created successfully");
        // Refresh the properties list
        await fetchProperties();
        return true;
      } else {
        throw new Error(result.message || "Failed to create property");
      }
    } catch (error) {
      console.error("Error creating property:", error);
      setError(`Failed to create property: ${error.message}`);
      return false;
    }
  };

  // Apply filters
  const applyFilters = () => {
    // The filtering is already happening in useEffect
    // This function can be used for additional filter logic if needed
    console.log("Filters applied:", filters);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      minRent: "",
      maxRent: "",
      bedrooms: "",
      occupancyState: "",
      minVacancies: "",
      propertyType: "",
    });
    setSearchTerm("");
  };

  // Get unique property types for filter dropdown
  const uniquePropertyTypes = [...new Set(properties.map((p) => p.type))];

  if (loading && properties.length === 0) {
    return (
      <Navbar module={activeModule}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-lg text-gray-600">Loading properties...</p>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar module={activeModule}>
      <div className="space-y-6 p-6">
        {/* Header with user info and refresh button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Property Management
            </h1>
            {loaderData?.user && (
              <p className="text-sm text-gray-600 mt-1">
                Managing properties as {loaderData.user.role}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchProperties}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error loading properties
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <p className="text-gray-600">Total Properties</p>
            <p className="text-xl font-bold">
              {portfolioStats.totalProperties}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Total Units</p>
            <p className="text-xl font-bold">{portfolioStats.totalUnits}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Occupied Units</p>
            <p className="text-xl font-bold text-green-600">
              {portfolioStats.totalOccupiedUnits}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Vacant Units</p>
            <p className="text-xl font-bold text-red-600">
              {portfolioStats.totalVacantUnits}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Overall Occupancy</p>
            <p className="text-xl font-bold">
              {portfolioStats.overallOccupancyRate}%
            </p>
          </div>
        </div>

        {/* Search and Add Property Section */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search properties by name, address, or type..."
              className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          </div>

          <button
            onClick={() => setShowAddPropertyModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center text-sm sm:text-base transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span>Add Property</span>
          </button>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Property Type Filter */}
            <select
              className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.propertyType}
              onChange={(e) =>
                setFilters({ ...filters, propertyType: e.target.value })
              }
            >
              <option value="">All Property Types</option>
              {uniquePropertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Bedrooms Filter */}
            <select
              className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.bedrooms}
              onChange={(e) =>
                setFilters({ ...filters, bedrooms: e.target.value })
              }
            >
              <option value="">Any Bedrooms</option>
              <option value="0">Studio</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>

            {/* Occupancy State Filter */}
            <select
              className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.occupancyState}
              onChange={(e) =>
                setFilters({ ...filters, occupancyState: e.target.value })
              }
            >
              <option value="">Any Occupancy</option>
              <option value="Full">Full</option>
              <option value="Partial">Partial</option>
              <option value="Empty">Empty</option>
            </select>

            {/* Min Rent */}
            <input
              type="number"
              placeholder="Min Rent"
              className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.minRent}
              onChange={(e) =>
                setFilters({ ...filters, minRent: e.target.value })
              }
            />

            {/* Max Rent */}
            <input
              type="number"
              placeholder="Max Rent"
              className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.maxRent}
              onChange={(e) =>
                setFilters({ ...filters, maxRent: e.target.value })
              }
            />

            {/* Filter Actions */}
            <div className="flex space-x-2">
              <button
                onClick={applyFilters}
                className="bg-blue-500 text-white px-3 py-2 rounded flex items-center justify-center flex-1 hover:bg-blue-600 transition-colors"
              >
                <FilterIcon className="w-4 h-4 mr-1" />
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-500 text-white px-3 py-2 rounded flex-1 hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            Showing {filteredProperties.length} of {properties.length}{" "}
            properties
          </p>
          {(searchTerm ||
            Object.values(filters).some((filter) => filter !== "")) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Property Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m5 0v-4a1 1 0 011-1h2a1 1 0 011 1v4M7 7h10M7 10h10M7 13h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-500 mb-4">
              {properties.length === 0
                ? "Get started by adding your first property."
                : "Try adjusting your search criteria or filters."}
            </p>
            {properties.length === 0 && (
              <button
                onClick={() => setShowAddPropertyModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Add Your First Property
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onUpdate={fetchProperties}
                setShowUpdateModal={setShowUpdateModal} // Pass the refresh function
              />
            ))}
          </div>
        )}


        {/* Add Property Modal */}
        <AddPropertyModal
          isOpen={showAddPropertyModal}
          onClose={() => setShowAddPropertyModal(false)}
          onSubmit={async (propertyData) => {
            const success = await handleAddProperty(propertyData);
            if (success) {
              setShowAddPropertyModal(false);
            }
          }}
        />

        {/* Loading Overlay for refreshes */}
        {loading && properties.length > 0 && (
          <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 z-50">
            <div className="flex items-center justify-center">
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Updating properties...
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
};

export default PropertyManagement;

// Loader function for the property management route
export async function loader() {
  const token = localStorage.getItem("token");
  console.log(token)
  if (!token) {
    return redirect("/");
  }

  try {
    const response = await fetch("http://localhost:5020/api/auth/verifyToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const userData = await response.json();
     console.log(userData)
    if (userData.status !== 200) {
      const keysToRemove = ["token", "user", "name", "userRole", "userId"];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      return redirect("/");
    }

    // Check role permissions
    const allowedRoles = ["Super Admin", "Admin", "Manager", "Staff"];
    const userRole = userData.user?.role || localStorage.getItem("userRole");

    if (!userRole || !allowedRoles.includes(userRole)) {
      return redirect("/");
    }

    return {
      user: userData.user,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Auth check error:", error);
    const keysToRemove = ["token", "user", "name", "userRole", "userId"];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    return redirect("/");
  }
}
