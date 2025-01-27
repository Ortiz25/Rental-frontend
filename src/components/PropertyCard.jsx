import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  SearchIcon, 
  FilterIcon 
} from 'lucide-react';




const PropertyCard = ({ property }) => {
    
    return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{property.address}</h3>
        <div className="flex space-x-2">
          <EditIcon className="text-blue-500 cursor-pointer" />
          <TrashIcon className="text-red-500 cursor-pointer" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-sm text-gray-600">Type: {property.type}</p>
          <p className="text-sm text-gray-600">Total Units: {property.totalUnits}</p>
          <p className="text-sm text-gray-600">Rent: ${property.monthlyRent}/mo</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Occupied Units: {property.occupiedUnits}</p>
          <p className="text-sm text-gray-600">Vacant Units: {property.vacantUnits}</p>
          <p className="text-sm text-gray-600">Occupancy: {property.occupancyState}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span 
          className={`px-2 py-1 rounded text-xs ${
            property.occupancyState === 'Full'
              ? 'bg-green-200 text-green-800'
              : property.vacantUnits > 0
              ? 'bg-yellow-200 text-yellow-800'
              : 'bg-red-200 text-red-800'
          }`}
        >
          {property.occupancyState === 'Full' ? 'Fully Occupied' : `${property.vacantUnits} Units Available`}
        </span>
      </div>
    </div>
  )};

  export default PropertyCard