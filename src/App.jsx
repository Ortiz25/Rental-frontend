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
import LoginPage from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AdminSettings from "./pages/AdminSettings";
import { loader as LoginLoader, action as LoginAction } from "./pages/Login";
import { loader as DashLoarder } from "./pages/Dashboard";
import { loader as propertyLoader } from "./pages/PropertyMgt";
import { loader as tenantLoader } from "./pages/TenantMgt";
import { loader as leaseLoader } from "./pages/LeaseMgt";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
    errorElement: <NotFound />,
    loader: LoginLoader,
    action: LoginAction,
  },
  { path: "/dashboard", element: <Dashboard />, errorElement: <NotFound />, loader:DashLoarder },
  { path: "/forgot", element: <ForgotPassword />, errorElement: <NotFound /> },
  {
    path: "/comms",
    element: <CommunicationTools />,
    errorElement: <NotFound />,
  },
  {
    path: "/property",
    element: <PropertyManagement />,
    errorElement: <NotFound />,
    loader:propertyLoader
  },
  {
    path: "/tenant",
    element: <TenantManagement />,
    errorElement: <NotFound />,
    loader:tenantLoader
  },
  { path: "/lease", element: <LeaseManagement />, errorElement: <NotFound />, loader:leaseLoader },
  { path: "/rent", element: <RentCollection />, errorElement: <NotFound /> },
  {
    path: "/maintenance",
    element: <MaintenanceManagement />,
    errorElement: <NotFound />,
  },
  {
    path: "/finance",
    element: <FinancialReports />,
    errorElement: <NotFound />,
  },
  {
    path: "/documents",
    element: <DocumentManagement />,
    errorElement: <NotFound />,
  },
  {
    path: "/communications",
    element: <CommunicationTools />,
    errorElement: <NotFound />,
  },
  {
    path: "/tenant_dash",
    element: <TenantDashboard />,
    errorElement: <NotFound />,
  },
  {
    path: "/admin_settings",
    element: <AdminSettings />,
    errorElement: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
