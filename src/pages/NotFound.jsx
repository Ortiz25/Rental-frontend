import React from "react";
import { Home, Search, ArrowLeft } from "lucide-react";
import Navbar from "../layout/navbar";
import { NavLink } from "react-router";

const NotFound = () => {
  return (
    <Navbar>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto">
          {/* 404 Number */}
          <h1 className="text-8xl font-bold text-gray-900 mb-4">404</h1>

          {/* Main heading */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Page not found
          </h2>

          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <NavLink className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors" to={"/"}>
              <Home className="w-4 h-4" />
              Go home
            </NavLink>

            <NavLink to={"#"} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Go back
            </NavLink>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default NotFound;
