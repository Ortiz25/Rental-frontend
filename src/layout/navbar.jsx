import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router';
import { 
  LayoutDashboard, 
  BuildingIcon, 
  UsersIcon, 
  FileTextIcon, 
  DollarSignIcon, 
  WrenchIcon, 
  BarChartIcon, 
  MailIcon, 
  ShieldCheckIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  HousePlus,
  UserCircle,
  IdCard
} from 'lucide-react';
import { useStore } from '../store/store';
import { useEffect } from 'react';



const Navbar = ({module, children}) => {
  const {isSidebarCollapsed, setIsSidebarCollapsed} = useStore();
  const [activeModule, setActiveModule] = useState(module);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMediumOrLarger: window.innerWidth >= 768 // Tailwind's md breakpoint
  });
   console.log(activeModule, screenSize)
   useEffect(()=>{
      if(!screenSize.isMediumOrLarger){
        setIsSidebarCollapsed(true)
      }

   },[screenSize.width])
  const modules = [
    { 
      name: 'Dashboard', 
      icon: <LayoutDashboard />,
      component: () => <DashboardSummary />,
      route:"/"
    },
    { 
      name: 'Tenant Dashboard', 
      icon: <IdCard />,
      route:"/tenant_dash"
    },
    { 
      name: 'Property Management', 
      icon: <BuildingIcon />,
      component: () => <PropertyManagement />,
      route:"/property"
    },
    { 
      name: 'Tenant Management', 
      icon: <UsersIcon />,
      component: () => <TenantManagement />,
      route:"/tenant"
    },
    { 
      name: 'Lease Management', 
      icon: <FileTextIcon />,
      component: () => <LeaseManagement />,
      route:"/lease"
    },
    { 
      name: 'Rent Collection', 
      icon: <DollarSignIcon />,
      component: () => <RentCollection />,
      route:"/rent"
    },
    { 
      name: 'Maintenance', 
      icon: <WrenchIcon />,
      component: () => <MaintenanceManagement />,
      route:"/maintenance"
    },
    { 
      name: 'Financial Reports', 
      icon: <BarChartIcon />,
      component: () => <FinancialReports />,
      route:"/finance"
    },
    { 
      name: 'Document Management', 
      icon: <ShieldCheckIcon />,
      component: () => <DocumentManagement />,
      route:"/documents"
    },
    { 
      name: 'Communication', 
      icon: <MailIcon />,
      component: () => <CommunicationTools />,
      route:"/communications"
    }
  ];

  const ActiveComponent = modules.find(m => m.name === activeModule)?.component || (() => null);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div 
        className={`bg-gray-800 z-10 text-white transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-49 md:w-64'
        }`}
      >
        <div className="flex items-center p-4">
          <HousePlus className='size-10'/>
          {!isSidebarCollapsed && <h1 className="text-base md:text-xl font-bold ml-2">Rental Manager</h1>}
        </div>
        <nav className="mt-4">
          {modules.map((module) => (
            <NavLink
              to={module.route}
              key={module.name}
              className={`
                flex items-center w-full p-3 
                ${isSidebarCollapsed ? 'justify-center' : 'px-4'}
                ${activeModule === module.name ? 'bg-blue-600' : 'hover:bg-gray-700'}
              `}
              onClick={() => setActiveModule(module.name)}
              title={module.name}
            >
              {module.icon}
              {!isSidebarCollapsed && <span className="ml-2 text-xs md:text-base">{module.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-9 left-4 w-3/5">
          <div className="relative">
            <button
              className="flex items-center hover:text-blue-500 justify-center md:justify-start text-gray-400 hover:text-white"
              
            >
              <UserCircle className="mr-0 md:mr-2 text-white " size={30} />
              <span className="text-white ">
              {!isSidebarCollapsed && <span className="ml-2 text-xs md:text-base font-bold">User</span>}
                {/* {user ? user : "User"} */}
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        <header className="bg-white shadow-md flex justify-between items-center p-4 sticky top-0 z-10">
          <button 
          className='px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-700 hover:bg-gray-300 focus:ring-gray-500'
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          <Menu />
          </button>
          <h2 className="text-base md:text-2xl font-bold">{activeModule}</h2>
        </header>
        
        <div className="p-6">
            {children}
        </div>
      </div>
    </div>
  );
};


export default Navbar;