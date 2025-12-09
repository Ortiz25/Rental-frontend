import React, { useState, useEffect } from "react";
import {
  SearchIcon,
  FilterIcon,
  MapPinIcon,
  BedIcon,
  BathIcon,
  HomeIcon,
  ChevronLeft,
  ChevronRight,
  Camera,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  DoorOpen,
  Ruler,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useLoaderData, redirect } from "react-router";
import Navbar from "../layout/navbar.jsx";
import VacancyCard from "../components/vacancyCard.jsx";
import ContactModal from "../components/modals/ContactModal.jsx";

const VacancyView = () => {
  const [activeModule] = useState("Property Vacancies");
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [filters, setFilters] = useState({
    minRent: "",
    maxRent: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "",
    minSize: "",
    maxSize: "",
  });

  const [sortOption, setSortOption] = useState("newest");

  // Fetch vacant properties from API
  const fetchVacantProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token") || "";
      // if (!token) {
      //   throw new Error("No authentication token found");
      // }

      const response = await fetch("/backend/api/vacancies", {
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

      if (result.status === 200) {
        setProperties(result.data);
        setFilteredProperties(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch vacant properties");
      }
    } catch (error) {
      console.error("Vacant properties fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacantProperties();
  }, []);

  // Filter and sort properties
  useEffect(() => {
    let results = properties.filter((property) => {
      // Search term matching
      const matchesSearch =
        property.propertyName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type?.toLowerCase().includes(searchTerm.toLowerCase());

      // Property type filter
      const matchesPropertyType =
        filters.propertyType === "" || property.type === filters.propertyType;

      // Rent range filters - check all vacant units
      const matchesRentRange = property.vacantUnits.some((unit) => {
        const matchesMin =
          filters.minRent === "" || unit.monthly_rent >= parseFloat(filters.minRent);
        const matchesMax =
          filters.maxRent === "" || unit.monthly_rent <= parseFloat(filters.maxRent);
        return matchesMin && matchesMax;
      });

      // Bedrooms filter - check if any vacant unit matches
      const matchesBedrooms = (() => {
        if (filters.bedrooms === "") return true;
        const filterValue = parseInt(filters.bedrooms);
        return property.vacantUnits.some((unit) => {
          if (filterValue === 4) {
            return unit.bedrooms >= 4;
          }
          return unit.bedrooms === filterValue;
        });
      })();

      // Bathrooms filter - check if any vacant unit matches
      const matchesBathrooms = (() => {
        if (filters.bathrooms === "") return true;
        const filterValue = parseFloat(filters.bathrooms);
        return property.vacantUnits.some((unit) => unit.bathrooms >= filterValue);
      })();

      // Size filters - check if any vacant unit matches
      const matchesSize = property.vacantUnits.some((unit) => {
        const matchesMin =
          filters.minSize === "" || unit.size_sq_ft >= parseInt(filters.minSize);
        const matchesMax =
          filters.maxSize === "" || unit.size_sq_ft <= parseInt(filters.maxSize);
        return matchesMin && matchesMax;
      });

      return (
        matchesSearch &&
        matchesPropertyType &&
        matchesRentRange &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesSize
      );
    });

    // Apply sorting
    results.sort((a, b) => {
      switch (sortOption) {
        case "price-low":
          return Math.min(...a.vacantUnits.map(u => u.monthly_rent)) - 
                 Math.min(...b.vacantUnits.map(u => u.monthly_rent));
        case "price-high":
          return Math.max(...b.vacantUnits.map(u => u.monthly_rent)) - 
                 Math.max(...a.vacantUnits.map(u => u.monthly_rent));
        case "bedrooms":
          return Math.max(...b.vacantUnits.map(u => u.bedrooms)) - 
                 Math.max(...a.vacantUnits.map(u => u.bedrooms));
        case "size":
          return Math.max(...b.vacantUnits.map(u => u.size_sq_ft || 0)) - 
                 Math.max(...a.vacantUnits.map(u => u.size_sq_ft || 0));
        case "newest":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredProperties(results);
  }, [searchTerm, properties, filters, sortOption]);

  // Clear filters
  const clearFilters = () => {
    setFilters({
      minRent: "",
      maxRent: "",
      bedrooms: "",
      bathrooms: "",
      propertyType: "",
      minSize: "",
      maxSize: "",
    });
    setSearchTerm("");
    setSortOption("newest");
  };

  const handleContactInquiry = (property, unit = null) => {
    setSelectedProperty(property);
    setSelectedUnit(unit);
    setShowContactModal(true);
  };

  // Get unique property types
  const uniquePropertyTypes = [...new Set(properties.map((p) => p.type))];

  // Calculate statistics
  const totalVacantUnits = properties.reduce(
    (sum, prop) => sum + prop.vacantUnits.length,
    0
  );
  const avgRent = totalVacantUnits > 0
    ? properties.reduce((sum, prop) => 
        sum + prop.vacantUnits.reduce((s, u) => s + u.monthly_rent, 0), 0
      ) / totalVacantUnits
    : 0;

  if (loading && properties.length === 0) {
    return (
      <Navbar module="Available Properties">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading available properties...</p>
          </div>
        </div>
      </Navbar>
    );
  }

  if (error) {
    return (
      <Navbar module="Available Properties">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Properties
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchVacantProperties}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar activeModule="Available Properties">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Available Properties
              </h1>
              <p className="text-gray-600">
                Find your perfect home from our available units
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-4 md:mt-0 flex gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-700">
                  {totalVacantUnits}
                </div>
                <div className="text-sm text-blue-600">Units Available</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-700">
                  KES {avgRent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-green-600">Avg. Rent</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by property name, location, or type..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters and Sort Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FilterIcon className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                Filter & Sort
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.propertyType}
                  onChange={(e) =>
                    setFilters({ ...filters, propertyType: e.target.value })
                  }
                >
                  <option value="">All Types</option>
                  {uniquePropertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.bedrooms}
                  onChange={(e) =>
                    setFilters({ ...filters, bedrooms: e.target.value })
                  }
                >
                  <option value="">Any</option>
                  <option value="0">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.bathrooms}
                  onChange={(e) =>
                    setFilters({ ...filters, bathrooms: e.target.value })
                  }
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="bedrooms">Most Bedrooms</option>
                  <option value="size">Largest Size</option>
                </select>
              </div>

              {/* Min Rent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rent (KES)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.minRent}
                  onChange={(e) =>
                    setFilters({ ...filters, minRent: e.target.value })
                  }
                />
              </div>

              {/* Max Rent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Rent (KES)
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.maxRent}
                  onChange={(e) =>
                    setFilters({ ...filters, maxRent: e.target.value })
                  }
                />
              </div>

              {/* Min Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Size (sq ft)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.minSize}
                  onChange={(e) =>
                    setFilters({ ...filters, minSize: e.target.value })
                  }
                />
              </div>

              {/* Max Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Size (sq ft)
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filters.maxSize}
                  onChange={(e) =>
                    setFilters({ ...filters, maxSize: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || Object.values(filters).some((f) => f !== "") || sortOption !== "newest") && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-700 font-medium">
            Showing {filteredProperties.length} of {properties.length} properties
            {filteredProperties.length !== properties.length && ` (${
              filteredProperties.reduce((sum, p) => sum + p.vacantUnits.length, 0)
            } units)`}
          </p>
        </div>

        {/* Property Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-gray-400 mb-4">
              <HomeIcon className="mx-auto h-16 w-16" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {properties.length === 0
                ? "There are currently no vacant properties available."
                : "Try adjusting your search criteria or filters to find more properties."}
            </p>
            {properties.length > 0 && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <VacancyCard
                key={property.id}
                property={property}
                onContactInquiry={handleContactInquiry}
              />
            ))}
          </div>
        )}

        {/* Contact Modal */}
        <ContactModal
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false);
            setSelectedProperty(null);
            setSelectedUnit(null);
          }}
          property={selectedProperty}
          unit={selectedUnit}
        />
      </div>
    </Navbar>
  );
};

export default VacancyView;

// Loader function for authentication
// export async function loader() {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     return redirect("/");
//   }

//   try {
//     const response = await fetch("/backend/api/auth/verifyToken", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ token }),
//     });

//     const userData = await response.json();

//     if (userData.status !== 200) {
//       const keysToRemove = ["token", "user", "name", "userRole", "userId"];
//       keysToRemove.forEach((key) => localStorage.removeItem(key));
//       return redirect("/");
//     }

//     // Allow all authenticated users (including tenants)
//     return {
//       user: userData.user,
//       isAuthenticated: true,
//     };
//   } catch (error) {
//     console.error("Auth check error:", error);
//     const keysToRemove = ["token", "user", "name", "userRole", "userId"];
//     keysToRemove.forEach((key) => localStorage.removeItem(key));
//     return redirect("/");
//   }
// }