import React, { useState } from "react";
import {
  Mail,
  AlertTriangle,
  CheckCircle,
  Loader,
  HousePlus,
} from "lucide-react";
import { Link } from "react-router";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:5020/api/password/forgotpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmail(""); // Clear form on success
      } else {
        setError(data.message || data.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="absolute top-10 lg:left-20 flex items-center justify-center bg-gray-100">
        <HousePlus className="mr-2 size-12 text-blue-600" />
        <h1 className="text-4xl font-bold text-gray-800">Rental Manager</h1>
      </div>
      
      <div className="w-full max-w-sm md:max-w-lg px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 shadow-2xl"
        >
          <h1 className="text-center p-4 text-4xl font-semibold">
            Reset Password
          </h1>

          <p className="text-center text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {message && (
            <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-sm font-medium text-green-800">
                {message}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label
              className="block text-gray-700 text-lg font-bold mb-2"
              htmlFor="email"
            >
              Email:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="shadow appearance-none border-2 rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:border-blue-400 focus:outline-none focus:shadow-outline"
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2 h-5 w-5" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" /> Send Reset Link
                </>
              )}
            </button>
            <Link
              className="inline-block align-baseline font-bold text-md text-blue-500 hover:text-blue-800 transition-colors duration-200"
              to="/"
            >
              Back to Sign in
            </Link>
          </div>
        </form>
        
        <p className="text-center text-gray-500 text-md">
          &copy;2025 LiveCrib. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;