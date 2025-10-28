import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import {
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Loader,
  HousePlus,
} from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link. Please request a new password reset.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/backend/api/password/resetpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Network error. Please try again later.");
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
            Set New Password
          </h1>

          {message && (
            <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{message}</p>
                <p className="text-sm text-green-700 mt-1">Redirecting to login...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label
              className="block text-gray-700 text-lg font-bold mb-2"
              htmlFor="newPassword"
            >
              New Password:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="shadow appearance-none border-2 rounded w-full py-2 pl-10 pr-10 text-gray-700 leading-tight focus:border-blue-400 focus:outline-none focus:shadow-outline"
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isLoading || !token}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Minimum 8 characters
            </p>
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-lg font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="shadow appearance-none border-2 rounded w-full py-2 pl-10 pr-10 text-gray-700 leading-tight focus:border-blue-400 focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isLoading || !token}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading || !token}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2 h-5 w-5" />
                  Resetting...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" /> Reset Password
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

export default ResetPassword;