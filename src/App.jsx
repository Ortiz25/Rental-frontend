import React, { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import CommunicationTools from "./pages/Communication";
import PropertyManagement from "./pages/PropertyMgt";
import TenantManagement from "./pages/TenantMgt";
import LeaseManagement from "./pages/LeaseMgt";
import RentCollection from "./pages/RentCollection";
import MaintenanceManagement from "./pages/MaintenanceMgt";
import FinancialReports from "./pages/FinancialReports";
import DocumentManagement from "./pages/DocumentMgt";
import TenantDashboard from "./pages/TenantDash";






const router = createBrowserRouter([
  {path:"/",element: <Dashboard />,
    errorElement: <NotFound />,
  }, {path:"/comms", element: <CommunicationTools/>, errorElement: <NotFound />},
  {path:"/property", element: <PropertyManagement/>, errorElement: <NotFound />},
  {path:"/tenant", element: <TenantManagement/>, errorElement: <NotFound />},
  {path:"/lease", element: <LeaseManagement/>, errorElement: <NotFound />},
  {path:"/rent", element: <RentCollection/>, errorElement: <NotFound />},
  {path:"/maintenance", element: <MaintenanceManagement/>, errorElement: <NotFound />},
  {path:"/finance", element: <FinancialReports/>, errorElement: <NotFound />}, 
  {path:"/documents", element: <DocumentManagement/>, errorElement: <NotFound />},
  {path:"/communications", element: <CommunicationTools/>, errorElement: <NotFound />},
  {path:"/tenant_dash", element: <TenantDashboard/>, errorElement: <NotFound />} ])



function App() {
  return <RouterProvider router={router} />;
}

export default App;