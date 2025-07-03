import React, { useEffect, useState } from "react";
import { Shield, Eye, EyeOff, Loader, HousePlus, AlertCircle } from "lucide-react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigate,
  useNavigation,
} from "react-router";
import { Mail } from "lucide-react";

const LoginPage = () => {
  const [showPassword, updateShowPassword] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";
  const navigate = useNavigate();

  const errors = useActionData();

  useEffect(() => {
    if (
      errors?.email ===
      "Please reset your Registration Password, Redirecting..."
    ) {
      const timeoutId = setTimeout(() => {
        navigate("/resetpassword");
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [errors, navigate]);

  function handleClick() {
    updateShowPassword(!showPassword);
  }

  // Show different loading states
  const getSubmitButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Signing In...
        </>
      );
    }
    if (isLoading) {
      return (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      );
    }
    return "Sign In";
  };

  // Determine error message styling and icon
  const getErrorDisplay = () => {
    if (!errors?.email) return null;

    const isRedirectMessage = errors.email === "Please reset your Registration Password, Redirecting...";
    
    return (
      <div className={`flex items-start gap-2 text-sm ${isRedirectMessage ? 'text-amber-600' : 'text-red-500'}`}>
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p className="italic font-medium">
          {errors.email}
          {isRedirectMessage && (
            <span className="block text-xs mt-1 text-amber-500">
              Redirecting in 5 seconds...
            </span>
          )}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="absolute top-10 lg:left-20 flex items-center justify-center bg-gray-100">
          <HousePlus className="mr-2 size-12 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-800">Rental Manager</h1>
        </div>

        <div className="w-full max-w-sm md:max-w-lg">
          <Form
            method="post"
            className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 shadow-2xl"
          >
            <h1 className="text-center p-4 text-4xl font-semibold text-gray-800">
              Login
            </h1>
            
            {/* Email Field */}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="email"
              >
                Email:
              </label>
              <input
                className={`shadow appearance-none border-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:border-blue-400 focus:outline-none focus:shadow-outline ${
                  errors?.email && !errors.email.includes("Redirecting") ? 'border-red-300' : ''
                }`}
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                disabled={isSubmitting || isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="relative mb-6">
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="password"
              >
                Password:
              </label>
              <input
                className={`shadow appearance-none border-2 focus:border-blue-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
                  errors?.email && !errors.email.includes("Redirecting") ? 'border-red-300' : ''
                }`}
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                required
                minLength="8"
                disabled={isSubmitting || isLoading}
              />
              
              {/* Error Display */}
              {errors?.email && (
                <div className="mb-3">
                  {getErrorDisplay()}
                </div>
              )}

              {/* Password Toggle */}
              <button
                type="button"
                className={`absolute right-3 ${
                  errors?.email ? "bottom-12" : "bottom-5"
                } text-gray-500 hover:text-gray-700 focus:outline-none`}
                onClick={handleClick}
                disabled={isSubmitting || isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Submit and Forgot Password */}
            <div className="flex items-center justify-between">
              <button
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center ${
                  isSubmitting || isLoading 
                    ? 'opacity-75 cursor-not-allowed' 
                    : ''
                }`}
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {getSubmitButtonContent()}
              </button>
              
              <Link
                className={`inline-block align-baseline font-bold text-md text-blue-500 hover:text-blue-800 transition-colors duration-200 ${
                  isSubmitting || isLoading ? 'pointer-events-none opacity-50' : ''
                }`}
                to="/forgot"
              >
                Forgot Password?
              </Link>
            </div>
          </Form>
          
          <p className="text-center text-gray-500 text-md">
            &copy;2025 Teqova. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

export async function action({ request, params }) {
  const data = await request.formData();
  const errors = {};
  const loginData = {
    email: data.get("email"),
    password: data.get("password").trim(),
  };

  // Validate input before sending to API
  if (!loginData.email || !loginData.password) {
    errors.email = "Email and password are required";
    return errors;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(loginData.email)) {
    errors.email = "Please enter a valid email address";
    return errors;
  }

  if (loginData.password.length < 8) {
    errors.email = "Password must be at least 8 characters long";
    return errors;
  }

  try {
    const url = "http://localhost:5020/api/login";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const resData = await response.json();
    console.log('Login response:', resData);

    // Handle different response statuses
    switch (resData.status) {
      case 400:
        errors.email = resData.message || "Invalid input provided";
        return errors;

      case 401:
        errors.email = resData.message || "Invalid email or password";
        return errors;

      case 403:
        errors.email = resData.message || "Account access denied";
        return errors;

      case 404:
        errors.email = resData.message || "User does not exist";
        return errors;

      case 423:
        errors.email = resData.message || "Account temporarily locked";
        return errors;

      case 429:
        errors.email = resData.message || "Too many login attempts. Please try again later";
        return errors;

      case 500:
        errors.email = "Server error. Please try again later";
        return errors;

      case 200:
        // Handle successful login
        if (resData.message === "Please reset your Registration Password, Redirecting...") {
          errors.email = "Please reset your Registration Password, Redirecting...";
          return errors;
        }
         console.log(resData.user.role)

         if(resData.user.role === "Tenant"){

          localStorage.setItem("token", resData.token);
          localStorage.setItem("user", JSON.stringify(resData.user));
          localStorage.setItem("name", resData.user.name);
          
          // Optional: Store additional user data
          localStorage.setItem("userRole", resData.user.role);
          localStorage.setItem("userId", resData.user.id.toString());

          return redirect("/tenant_dash");

         }
        // Store token and user data
        if (resData.token) {
          localStorage.setItem("token", resData.token);
          localStorage.setItem("user", JSON.stringify(resData.user));
          localStorage.setItem("name", resData.user.name);
          
          // Optional: Store additional user data
          localStorage.setItem("userRole", resData.user.role);
          localStorage.setItem("userId", resData.user.id.toString());
          
          console.log('Login successful, redirecting to dashboard');
          return redirect("/dashboard");
        } else {
          errors.email = "Login successful but no token received";
          return errors;
        }

      default:
        errors.email = "Unexpected response from server";
        return errors;
    }

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errors.email = "Unable to connect to server. Please check your connection";
    } else if (error.name === 'AbortError') {
      errors.email = "Request timed out. Please try again";
    } else {
      errors.email = "An unexpected error occurred. Please try again";
    }
    
    return errors;
  }
}

export async function loader() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const url = "http://localhost:5020/api/auth/verifyToken";
    const data = { token: token };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const userData = await response.json();
    console.log('Token verification response:', userData);

    // Handle different verification responses
    switch (userData.status) {
      case 200:
        // Token is valid, redirect to dashboard
        return redirect("/dashboard");

      case 401:
        // Token expired or invalid
        console.log('Token verification failed:', userData.message);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("name");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        return null;

      case 403:
        // Account deactivated
        console.log('Account deactivated');
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("name");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        return null;

      default:
        // Other errors
        console.log('Unexpected verification response:', userData);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("name");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        return null;
    }

  } catch (error) {
    console.error('Token verification error:', error);
    // Clear stored data on error
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("name");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    return null;
  }
}