import React, { useState } from 'react';
import { 
  LayoutDashboard, 

  BuildingIcon, 
  UsersIcon, 
  FileTextIcon, 
  DollarSignIcon, 
  WrenchIcon, 
  BarChartIcon, 
  MailIcon, 
  ShieldCheckIcon 
} from 'lucide-react';
import Navbar from '../layout/navbar.jsx';
import { useStore } from '../store/store.jsx';


const Dashboard = () => {
    const [activeModule, setActiveModule] = useState('Dashboard')

    const moduleSummaries = [
      {
        name: 'Property Overview',
        icon: <BuildingIcon />,
        stats: [
          { label: 'Total Properties', value: 12, color: 'bg-blue-100' },
          { label: 'Occupied', value: 9, color: 'bg-green-100' },
          { label: 'Vacant', value: 3, color: 'bg-red-100' }
        ]
      },
      {
        name: 'Tenant Management',
        icon: <UsersIcon />,
        stats: [
          { label: 'Active Tenants', value: 9, color: 'bg-purple-100' },
          { label: 'Lease Renewals', value: 3, color: 'bg-yellow-100' },
          { label: 'New Applications', value: 2, color: 'bg-indigo-100' }
        ]
      },
      {
        name: 'Lease Status',
        icon: <FileTextIcon />,
        stats: [
          { label: 'Active Leases', value: 9, color: 'bg-green-100' },
          { label: 'Expiring Soon', value: 2, color: 'bg-orange-100' },
          { label: 'Terminated', value: 1, color: 'bg-red-100' }
        ]
      },
      {
        name: 'Financial Summary',
        icon: <DollarSignIcon />,
        stats: [
          { label: 'Monthly Revenue', value: '$45,600', color: 'bg-blue-100' },
          { label: 'Outstanding Rent', value: '$6,200', color: 'bg-red-100' },
          { label: 'Maintenance Costs', value: '$3,800', color: 'bg-yellow-100' }
        ]
      },
      {
        name: 'Maintenance',
        icon: <WrenchIcon />,
        stats: [
          { label: 'Open Requests', value: 5, color: 'bg-orange-100' },
          { label: 'Completed', value: 12, color: 'bg-green-100' },
          { label: 'Urgent', value: 2, color: 'bg-red-100' }
        ]
      }
    ];


    return (
      <Navbar module={activeModule}>
  <div className="p-6 bg-gray-100 min-h-screen">
  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-6 flex items-center">
    <LayoutDashboard className="mr-3 size-6 sm:size-8 md:size-12" /> Rental Management Dashboard
  </h1>
  
  <div className="grid xl:grid-cols-3 gap-4">
    {moduleSummaries.map((module) => (
      <div 
        key={module.name} 
        className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center mb-4">
          {module.icon}
          <h2 className="ml-2 text-sm sm:text-base font-semibold">{module.name}</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {module.stats.map((stat) => (
            <div 
              key={stat.label} 
              className={`p-2 sm:p-3 rounded text-center flex flex-col justify-center ${stat.color}`}
            >
              <div className="text-xs sm:text-sm text-gray-600 w-full">{stat.label}</div>
              <div className="text-base sm:text-xl font-bold w-full">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>
      </Navbar>
   
  )};


  export default Dashboard