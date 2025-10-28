import React, { useState, useEffect } from "react";
import { X, Save, User, Phone, Mail, Building, Briefcase, Users, FileText, Calendar, DollarSign, MapPin, Plus, Edit3 } from "lucide-react";




const EditTenantModal = ({ isOpen, onClose, tenant, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    dateOfBirth: "",
    identificationType: "",
    identificationNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    employmentStatus: "",
    employerName: "",
    monthlyIncome: "",
    previousAddress: "",
  });

  // Lease management state
  const [leaseData, setLeaseData] = useState(null);
  const [availableLeases, setAvailableLeases] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [leaseFormData, setLeaseFormData] = useState({
    lease_type: "Fixed Term",
    lease_status: "draft",
    start_date: "",
    end_date: "",
    monthly_rent: "",
    security_deposit: "",
    pet_deposit: "0",
    late_fee: "0",
    grace_period_days: "5",
    rent_due_day: "1",
    lease_terms: "",
    special_conditions: "",
    signed_date: "",
    move_in_date: "",
  });
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [leaseAction, setLeaseAction] = useState(""); // "edit", "create", "assign"

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLeaseData, setIsLoadingLeaseData] = useState(false);
  const [errors, setErrors] = useState({});
  // Initialize lease form with default values - MOVED TO TOP
  const initializeLeaseForm = (leaseData = null) => {
    if (leaseData) {
      // Populate with existing lease data
      return {
        lease_type: leaseData.lease_type || "Fixed Term",
        lease_status: leaseData.lease_status || "active",
        start_date: leaseData.start_date ? leaseData.start_date.split('T')[0] : "",
        end_date: leaseData.end_date ? leaseData.end_date.split('T')[0] : "",
        monthly_rent: leaseData.monthly_rent || "",
        security_deposit: leaseData.security_deposit || "",
        pet_deposit: leaseData.pet_deposit || "0",
        late_fee: leaseData.late_fee || "0",
        grace_period_days: leaseData.grace_period_days || "5",
        rent_due_day: leaseData.rent_due_day || "1",
        lease_terms: leaseData.lease_terms || "",
        special_conditions: leaseData.special_conditions || "",
        signed_date: leaseData.signed_date ? leaseData.signed_date.split('T')[0] : "",
        move_in_date: leaseData.move_in_date ? leaseData.move_in_date.split('T')[0] : "",
      };
    } else {
      // Default values for new lease
      return {
        lease_type: "Fixed Term",
        lease_status: "draft",
        start_date: "",
        end_date: "",
        monthly_rent: "",
        security_deposit: "",
        pet_deposit: "0",
        late_fee: "0",
        grace_period_days: "5",
        rent_due_day: "1",
        lease_terms: "",
        special_conditions: "",
        signed_date: "",
        move_in_date: "",
      };
    }
  };

  // Helper function to sanitize lease data for API - MOVED TO TOP
  const sanitizeLeaseData = (data) => {
    const sanitized = { ...data };
    
    // Convert empty strings to null for date fields
    const dateFields = ['start_date', 'end_date', 'signed_date', 'move_in_date'];
    dateFields.forEach(field => {
      if (sanitized[field] === '') {
        sanitized[field] = null;
      }
    });

    // Convert empty strings to null or proper values for numeric fields
    const numericFields = ['monthly_rent', 'security_deposit', 'pet_deposit', 'late_fee', 'grace_period_days', 'rent_due_day'];
    numericFields.forEach(field => {
      if (sanitized[field] === '' || sanitized[field] === undefined) {
        if (field === 'pet_deposit' || field === 'late_fee') {
          sanitized[field] = 0;
        } else if (field === 'grace_period_days') {
          sanitized[field] = 5;
        } else if (field === 'rent_due_day') {
          sanitized[field] = 1;
        } else {
          sanitized[field] = null;
        }
      } else {
        sanitized[field] = parseFloat(sanitized[field]) || 0;
      }
    });

    // Convert empty strings to null for text fields
    const textFields = ['lease_terms', 'special_conditions'];
    textFields.forEach(field => {
      if (sanitized[field] === '') {
        sanitized[field] = null;
      }
    });

    return sanitized;
  };

  const handleUnitSelection = (unitId) => {
    setSelectedUnitId(unitId);
    
    // Auto-populate lease form with unit's default values
    if (unitId) {
      const selectedUnit = availableUnits
        .flatMap(property => property.units)
        .find(unit => unit.id.toString() === unitId);
      
      if (selectedUnit) {
        setLeaseFormData(prev => ({
          ...prev,
          monthly_rent: selectedUnit.monthlyRent?.toString() || "",
          security_deposit: selectedUnit.securityDeposit?.toString() || "",
        }));
      }
    }
  };

  // Initialize form data when tenant changes
  useEffect(() => {
    if (tenant) {
      setFormData({
        firstName: tenant.name?.split(" ")[0] || "",
        lastName: tenant.name?.split(" ").slice(1).join(" ") || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        alternatePhone: tenant.alternatePhone || "",
        dateOfBirth: tenant.dateOfBirth || "",
        identificationType: tenant.identificationType || "",
        identificationNumber: tenant.identificationNumber || "",
        emergencyContactName: tenant.emergencyContact?.name || "",
        emergencyContactPhone: tenant.emergencyContact?.phone || "",
        emergencyContactRelationship: tenant.emergencyContact?.relationship || "",
        employmentStatus: tenant.employmentStatus || "",
        employerName: tenant.employerName || "",
        monthlyIncome: tenant.monthlyIncome || "",
        previousAddress: tenant.previousAddress || "",
      });

      // Load lease data when tenant changes and automatically set to edit mode if lease exists
      loadTenantLeaseData();
    }
  }, [tenant]);

  const loadTenantLeaseData = async () => {
    if (!tenant?.id) return;
  
    setIsLoadingLeaseData(true);
    try {
      const token = localStorage.getItem("token");
      
      // Try multiple approaches to find the tenant's lease
      let currentLease = null;
      
      // Method 1: Search by tenant email
      try {
        const leasesResponse = await fetch(`http://localhost:5020/api/leases?search=${encodeURIComponent(tenant.email)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (leasesResponse.ok) {
          const leasesResult = await leasesResponse.json();
          //console.log("Search results:", leasesResult); // Debug log
          
          if (leasesResult.success && leasesResult.data) {
            currentLease = leasesResult.data.find(lease => 
              lease.lease_status === 'active' && 
              (lease.primary_tenant_email === tenant.email || 
               lease.all_tenant_names?.toLowerCase().includes(tenant.name?.toLowerCase()))
            );
          }
        }
      } catch (error) {
        console.log("Search method failed, trying direct fetch:", error);
      }
      
      // Method 2: If search fails, get all active leases and filter
      if (!currentLease) {
        try {
          const allLeasesResponse = await fetch(`http://localhost:5020/api/leases?status=active`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (allLeasesResponse.ok) {
            const allLeasesResult = await allLeasesResponse.json();
            //console.log("All active leases:", allLeasesResult); // Debug log
            
            if (allLeasesResult.success && allLeasesResult.data) {
              currentLease = allLeasesResult.data.find(lease => 
                lease.primary_tenant_email === tenant.email ||
                lease.all_tenant_names?.toLowerCase().includes(tenant.name?.toLowerCase()) ||
                lease.primary_tenant_name?.toLowerCase() === tenant.name?.toLowerCase()
              );
            }
          }
        } catch (error) {
          console.log("Active leases fetch failed:", error);
        }
      }
      
      // Method 3: Direct tenant lookup (if you have a tenant-specific endpoint)
      if (!currentLease) {
        try {
          const tenantLeasesResponse = await fetch(`http://localhost:5020/api/tenants/${tenant.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (tenantLeasesResponse.ok) {
            const tenantResult = await tenantLeasesResponse.json();
            //console.log("Tenant data:", tenantResult); // Debug log
            
            // Check if tenant data includes lease information
            if (tenantResult.status === 200 && tenantResult.data?.lease_id) {
              // Fetch the specific lease
              const leaseResponse = await fetch(`http://localhost:5020/api/leases/${tenantResult.data.lease_id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (leaseResponse.ok) {
                const leaseResult = await leaseResponse.json();
                if (leaseResult.success && leaseResult.data?.lease_status === 'active') {
                  currentLease = leaseResult.data;
                }
              }
            }
          }
        } catch (error) {
          console.log("Tenant-specific fetch failed:", error);
        }
      }
      
     // console.log("Final current lease found:", currentLease); // Debug log
      
      if (currentLease) {
        setLeaseData(currentLease);
        setLeaseFormData(initializeLeaseForm(currentLease));
        // Automatically set to edit mode for existing leases
        setLeaseAction("edit");
      } else {
        setLeaseData(null);
        setLeaseFormData(initializeLeaseForm());
        setLeaseAction(""); // No lease action for tenants without leases
        // Load available options for creating new lease
        await loadAvailableOptions();
      }
    } catch (error) {
      console.error("Error loading tenant lease data:", error);
      setLeaseFormData(initializeLeaseForm()); // Initialize with defaults on error
    } finally {
      setIsLoadingLeaseData(false);
    }
  };

  const loadAvailableOptions = async () => {
    try {
      const token = localStorage.getItem("token");

      // Load available units
      const unitsResponse = await fetch(`http://localhost:5020/api/tenants/onboarding/available-units`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (unitsResponse.ok) {
        const unitsResult = await unitsResponse.json();
        setAvailableUnits(unitsResult.data?.properties || []);
      }

      // Load draft/unassigned leases
      const leasesResponse = await fetch(`http://localhost:5020/api/leases?status=draft`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (leasesResponse.ok) {
        const leasesResult = await leasesResponse.json();
        console.log(leasesResult)
        // Filter leases that have no tenants assigned
        const unassignedLeases = leasesResult.data?.filter(lease => 
          !lease.all_tenant_names || lease.all_tenant_names.trim() === ""
        ) || [];
        setAvailableLeases(unassignedLeases);
      }
    } catch (error) {
      console.error("Error loading available options:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleLeaseInputChange = (e) => {
    const { name, value } = e.target;
    setLeaseFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    setErrors({});
    setActiveTab("personal");
    setLeaseAction("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5020/api/tenants/${tenant.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status === 200) {
        // Success
        if (onUpdate) {
          await onUpdate(); // Refresh tenant data
        }
        onClose();
      } else {
        throw new Error(result.message || "Failed to update tenant");
      }
    } catch (error) {
      console.error("Error updating tenant:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaseAction = async () => {
    if (!validateLeaseForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const sanitizedLeaseData = sanitizeLeaseData(leaseFormData);

      if (leaseAction === "edit" && leaseData) {
        // Update existing lease
        const response = await fetch(`http://localhost:5020/api/leases/${leaseData.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedLeaseData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update lease");
        }

      } else if (leaseAction === "create") {
        // Create new lease and assign tenant
        const response = await fetch(`http://localhost:5020/api/leases`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            unit_id: parseInt(selectedUnitId),
            tenant_ids: [tenant.id],
            ...sanitizedLeaseData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create lease");
        }

      } else if (leaseAction === "assign") {
        // First, get the selected lease details
        const leaseResponse = await fetch(`http://localhost:5020/api/leases/${selectedLeaseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!leaseResponse.ok) {
          throw new Error("Failed to fetch lease details");
        }

        const leaseDetails = await leaseResponse.json();

        // Update the lease to assign the tenant
        const response = await fetch(`http://localhost:5020/api/leases/${selectedLeaseId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lease_status: "active", // Activate the lease when assigning tenant
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to assign lease");
        }
      }

      // Reload lease data
      await loadTenantLeaseData();
      setLeaseAction("");
      
      if (onUpdate) {
        await onUpdate();
      }

    } catch (error) {
      console.error("Error handling lease action:", error);
      setErrors({ lease: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLeaseForm = () => {
    const newErrors = {};

    if (leaseAction === "create") {
      if (!selectedUnitId) {
        newErrors.selectedUnitId = "Please select a unit";
      }
      if (!leaseFormData.start_date || leaseFormData.start_date.trim() === '') {
        newErrors.start_date = "Start date is required";
      }
      if (leaseFormData.lease_type === "Fixed Term" && (!leaseFormData.end_date || leaseFormData.end_date.trim() === '')) {
        newErrors.end_date = "End date is required for Fixed Term leases";
      }
      if (!leaseFormData.monthly_rent || leaseFormData.monthly_rent.toString().trim() === '') {
        newErrors.monthly_rent = "Monthly rent is required";
      } else if (parseFloat(leaseFormData.monthly_rent) <= 0) {
        newErrors.monthly_rent = "Monthly rent must be greater than 0";
      }
      if (!leaseFormData.security_deposit || leaseFormData.security_deposit.toString().trim() === '') {
        newErrors.security_deposit = "Security deposit is required";
      } else if (parseFloat(leaseFormData.security_deposit) < 0) {
        newErrors.security_deposit = "Security deposit must be 0 or greater";
      }
      
      // Validate date logic
      if (leaseFormData.start_date && leaseFormData.end_date) {
        const startDate = new Date(leaseFormData.start_date);
        const endDate = new Date(leaseFormData.end_date);
        if (endDate <= startDate) {
          newErrors.end_date = "End date must be after start date";
        }
      }
      
      // Validate move-in date
      if (leaseFormData.move_in_date && leaseFormData.start_date) {
        const moveInDate = new Date(leaseFormData.move_in_date);
        const startDate = new Date(leaseFormData.start_date);
        if (moveInDate < startDate) {
          newErrors.move_in_date = "Move-in date cannot be before lease start date";
        }
      }
    } else if (leaseAction === "assign") {
      if (!selectedLeaseId) {
        newErrors.selectedLeaseId = "Please select a lease to assign";
      }
    } else if (leaseAction === "edit") {
      // Similar validations for edit mode
      if (!leaseFormData.start_date || leaseFormData.start_date.trim() === '') {
        newErrors.start_date = "Start date is required";
      }
      if (leaseFormData.lease_type === "Fixed Term" && (!leaseFormData.end_date || leaseFormData.end_date.trim() === '')) {
        newErrors.end_date = "End date is required for Fixed Term leases";
      }
      if (!leaseFormData.monthly_rent || leaseFormData.monthly_rent.toString().trim() === '') {
        newErrors.monthly_rent = "Monthly rent is required";
      } else if (parseFloat(leaseFormData.monthly_rent) <= 0) {
        newErrors.monthly_rent = "Monthly rent must be greater than 0";
      }
      if (leaseFormData.security_deposit && parseFloat(leaseFormData.security_deposit) < 0) {
        newErrors.security_deposit = "Security deposit must be 0 or greater";
      }
      
      // Validate date logic for edit mode
      if (leaseFormData.start_date && leaseFormData.end_date) {
        const startDate = new Date(leaseFormData.start_date);
        const endDate = new Date(leaseFormData.end_date);
        if (endDate <= startDate) {
          newErrors.end_date = "End date must be after start date";
        }
      }
      
      // Validate move-in date for edit mode
      if (leaseFormData.move_in_date && leaseFormData.start_date) {
        const moveInDate = new Date(leaseFormData.move_in_date);
        const startDate = new Date(leaseFormData.start_date);
        if (moveInDate < startDate) {
          newErrors.move_in_date = "Move-in date cannot be before lease start date";
        }
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "lease", label: "Lease Management", icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-gray-900 opacity-75 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <User className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Edit Tenant Information
              </h3>
              <p className="text-sm text-gray-500">
                Update {tenant?.name}'s details and manage lease
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <nav className="flex px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Error message */}
            {(errors.submit || errors.lease) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{errors.submit || errors.lease}</p>
              </div>
            )}

            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <form id="edit-tenant-form" onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <div className="mb-6">
                  <h4 className="flex items-center text-md font-medium text-gray-900 mb-4">
                    <User className="w-4 h-4 mr-2" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="First Name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Last Name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Email Address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Phone Number"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Phone
                      </label>
                      <input
                        type="tel"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Alternate Phone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Identification Section */}
                <div className="mb-6">
                  <h4 className="flex items-center text-md font-medium text-gray-900 mb-4">
                    <Building className="w-4 h-4 mr-2" />
                    Identification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Type
                      </label>
                      <select
                        name="identificationType"
                        value={formData.identificationType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select ID Type</option>
                        <option value="National ID">National ID</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver License">Driver License</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Number
                      </label>
                      <input
                        type="text"
                        name="identificationNumber"
                        value={formData.identificationNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ID Number"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="mb-6">
                  <h4 className="flex items-center text-md font-medium text-gray-900 mb-4">
                    <Users className="w-4 h-4 mr-2" />
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Emergency Contact Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Emergency Contact Phone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <input
                        type="text"
                        name="emergencyContactRelationship"
                        value={formData.emergencyContactRelationship}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Relationship"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Section */}
                <div className="mb-6">
                  <h4 className="flex items-center text-md font-medium text-gray-900 mb-4">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Employment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Status
                      </label>
                      <select
                        name="employmentStatus"
                        value={formData.employmentStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="Employed">Employed</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Student">Student</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer Name
                      </label>
                      <input
                        type="text"
                        name="employerName"
                        value={formData.employerName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Employer Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Income (KSh)
                      </label>
                      <input
                        type="number"
                        name="monthlyIncome"
                        value={formData.monthlyIncome}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Monthly Income"
                      />
                    </div>
                  </div>
                </div>

                {/* Previous Address Section */}
                <div className="mb-6">
                  <h4 className="flex items-center text-md font-medium text-gray-900 mb-4">
                    <Building className="w-4 h-4 mr-2" />
                    Previous Address
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous Address
                    </label>
                    <textarea
                      name="previousAddress"
                      value={formData.previousAddress}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Previous residential address"
                    />
                  </div>
                </div>
              </form>
            )}
            {/* Lease Management Tab */}
            {activeTab === "lease" && (
              <div>
                {isLoadingLeaseData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading lease information...</span>
                  </div>
                ) : (
                  <div>
                    {/* Current Lease Information */}
                    {leaseData ? (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="flex items-center text-md font-medium text-gray-900">
                            <FileText className="w-4 h-4 mr-2" />
                            Current Lease Information
                          </h4>
                          <div className="flex space-x-2">
                            {leaseAction === "edit" ? (
                              <button
                                onClick={() => setLeaseAction("")}
                                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                              >
                                <X className="w-4 h-4 mr-1" />
                                View Only
                              </button>
                            ) : (
                              <button
                                onClick={() => setLeaseAction("edit")}
                                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <Edit3 className="w-4 h-4 mr-1" />
                                Edit Mode
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Always show edit form for active leases */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Property & Unit
                              </label>
                              <input
                                type="text"
                                value={`${leaseData.property_name} - Unit ${leaseData.unit_number}`}
                                disabled
                                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-600"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lease Number
                              </label>
                              <input
                                type="text"
                                value={leaseData.lease_number || 'Auto-generated'}
                                disabled
                                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-600"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lease Type
                              </label>
                              <select
                                name="lease_type"
                                value={leaseFormData.lease_type}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300'
                                }`}
                              >
                                <option value="Fixed Term">Fixed Term</option>
                                <option value="Month-to-Month">Month-to-Month</option>
                                <option value="Week-to-Week">Week-to-Week</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lease Status
                              </label>
                              <div className="flex items-center space-x-2">
                                <select
                                  name="lease_status"
                                  value={leaseFormData.lease_status}
                                  onChange={handleLeaseInputChange}
                                  disabled={leaseAction !== "edit"}
                                  className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="draft">Draft</option>
                                  <option value="active">Active</option>
                                  <option value="pending">Pending</option>
                                  <option value="expired">Expired</option>
                                  <option value="terminated">Terminated</option>
                                </select>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  leaseData.lease_status === 'active' ? 'bg-green-100 text-green-800' :
                                  leaseData.lease_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  leaseData.lease_status === 'expired' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  Current: {leaseData.lease_status}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date *
                              </label>
                              <input
                                type="date"
                                name="start_date"
                                value={leaseFormData.start_date}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 
                                  errors.start_date ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors.start_date && leaseAction === "edit" && (
                                <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date {leaseFormData.lease_type === "Fixed Term" && "*"}
                              </label>
                              <input
                                type="date"
                                name="end_date"
                                value={leaseFormData.end_date}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 
                                  errors.end_date ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors.end_date && leaseAction === "edit" && (
                                <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Monthly Rent (KSh) *
                              </label>
                              <input
                                type="number"
                                name="monthly_rent"
                                value={leaseFormData.monthly_rent}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 
                                  errors.monthly_rent ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors.monthly_rent && leaseAction === "edit" && (
                                <p className="mt-1 text-xs text-red-600">{errors.monthly_rent}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Security Deposit (KSh) *
                              </label>
                              <input
                                type="number"
                                name="security_deposit"
                                value={leaseFormData.security_deposit}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 
                                  errors.security_deposit ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors.security_deposit && leaseAction === "edit" && (
                                <p className="mt-1 text-xs text-red-600">{errors.security_deposit}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pet Deposit (KSh)
                              </label>
                              <input
                                type="number"
                                name="pet_deposit"
                                value={leaseFormData.pet_deposit}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Late Fee (KSh)
                              </label>
                              <input
                                type="number"
                                name="late_fee"
                                value={leaseFormData.late_fee}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grace Period (Days)
                              </label>
                              <input
                                type="number"
                                name="grace_period_days"
                                value={leaseFormData.grace_period_days}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rent Due Day
                              </label>
                              <select
                                name="rent_due_day"
                                value={leaseFormData.rent_due_day}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300'
                                }`}
                              >
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Signed Date
                              </label>
                              <input
                                type="date"
                                name="signed_date"
                                value={leaseFormData.signed_date}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Move-in Date
                              </label>
                              <input
                                type="date"
                                name="move_in_date"
                                value={leaseFormData.move_in_date}
                                onChange={handleLeaseInputChange}
                                disabled={leaseAction !== "edit"}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 
                                  errors.move_in_date ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors.move_in_date && leaseAction === "edit" && (
                                <p className="mt-1 text-xs text-red-600">{errors.move_in_date}</p>
                              )}
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Lease Terms
                            </label>
                            <textarea
                              name="lease_terms"
                              value={leaseFormData.lease_terms}
                              onChange={handleLeaseInputChange}
                              disabled={leaseAction !== "edit"}
                              rows={3}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300'
                              }`}
                              placeholder="Enter lease terms and conditions..."
                            />
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Special Conditions
                            </label>
                            <textarea
                              name="special_conditions"
                              value={leaseFormData.special_conditions}
                              onChange={handleLeaseInputChange}
                              disabled={leaseAction !== "edit"}
                              rows={2}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                leaseAction !== "edit" ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-gray-300'
                              }`}
                              placeholder="Any special conditions or notes..."
                            />
                          </div>

                          {leaseAction === "edit" && (
                            <div className="flex space-x-3 pt-4 border-t border-gray-200">
                              <button
                                onClick={handleLeaseAction}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Update Lease
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setLeaseAction("");
                                  setLeaseFormData(initializeLeaseForm(leaseData)); // Reset form
                                }}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // No current lease - show options to create or assign
                      <div className="mb-6">
                        <h4 className="flex items-center text-md font-medium text-gray-900 mb-4">
                          <FileText className="w-4 h-4 mr-2" />
                          No Active Lease
                        </h4>
                        <p className="text-gray-600 mb-4">This tenant doesn't have an active lease. Choose an option below:</p>

                        {!leaseAction && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => {
                                setLeaseAction("create");
                                loadAvailableOptions();
                              }}
                              className="flex items-center justify-center px-6 py-3 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              <Plus className="w-5 h-5 mr-2" />
                              Create New Lease
                            </button>
                            <button
                              onClick={() => {
                                setLeaseAction("assign");
                                loadAvailableOptions();
                              }}
                              className="flex items-center justify-center px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <FileText className="w-5 h-5 mr-2" />
                              Assign Existing Lease
                            </button>
                          </div>
                        )}

                        {/* Create New Lease Form */}
                        {leaseAction === "create" && (
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-4">
                            <h5 className="text-lg font-medium text-gray-900 mb-4">Create New Lease</h5>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Property & Unit *
                              </label>
                              <select
                                value={selectedUnitId}
                                onChange={(e) => handleUnitSelection(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.selectedUnitId ? 'border-red-300' : 'border-gray-300'
                                }`}
                              >
                                <option value="">Select a unit...</option>
                                {availableUnits.map(property => 
                                  property.units.map(unit => (
                                    <option key={unit.id} value={unit.id}>
                                      {property.propertyName} - Unit {unit.unitNumber} (KSh {unit.monthlyRent?.toLocaleString()}/month)
                                    </option>
                                  ))
                                )}
                              </select>
                              {errors.selectedUnitId && (
                                <p className="mt-1 text-xs text-red-600">{errors.selectedUnitId}</p>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Lease Type
                                </label>
                                <select
                                  name="lease_type"
                                  value={leaseFormData.lease_type}
                                  onChange={handleLeaseInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="Fixed Term">Fixed Term</option>
                                  <option value="Month-to-Month">Month-to-Month</option>
                                  <option value="Week-to-Week">Week-to-Week</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Lease Status
                                </label>
                                <select
                                  name="lease_status"
                                  value={leaseFormData.lease_status}
                                  onChange={handleLeaseInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="draft">Draft</option>
                                  <option value="active">Active</option>
                                  <option value="pending">Pending</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Start Date *
                                </label>
                                <input
                                  type="date"
                                  name="start_date"
                                  value={leaseFormData.start_date}
                                  onChange={handleLeaseInputChange}
                                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.start_date ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors.start_date && (
                                  <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  End Date {leaseFormData.lease_type === "Fixed Term" && "*"}
                                </label>
                                <input
                                  type="date"
                                  name="end_date"
                                  value={leaseFormData.end_date}
                                  onChange={handleLeaseInputChange}
                                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.end_date ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors.end_date && (
                                  <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Monthly Rent (KSh) *
                                </label>
                                <input
                                  type="number"
                                  name="monthly_rent"
                                  value={leaseFormData.monthly_rent}
                                  onChange={handleLeaseInputChange}
                                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.monthly_rent ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors.monthly_rent && (
                                  <p className="mt-1 text-xs text-red-600">{errors.monthly_rent}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Security Deposit (KSh) *
                                </label>
                                <input
                                  type="number"
                                  name="security_deposit"
                                  value={leaseFormData.security_deposit}
                                  onChange={handleLeaseInputChange}
                                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.security_deposit ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors.security_deposit && (
                                  <p className="mt-1 text-xs text-red-600">{errors.security_deposit}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Pet Deposit (KSh)
                                </label>
                                <input
                                  type="number"
                                  name="pet_deposit"
                                  value={leaseFormData.pet_deposit}
                                  onChange={handleLeaseInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Late Fee (KSh)
                                </label>
                                <input
                                  type="number"
                                  name="late_fee"
                                  value={leaseFormData.late_fee}
                                  onChange={handleLeaseInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Grace Period (Days)
                                </label>
                                <input
                                  type="number"
                                  name="grace_period_days"
                                  value={leaseFormData.grace_period_days}
                                  onChange={handleLeaseInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Rent Due Day
                                </label>
                                <select
                                  name="rent_due_day"
                                  value={leaseFormData.rent_due_day}
                                  onChange={handleLeaseInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{day}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Signed Date
                                </label>
                                <input
                                  type="date"
                                  name="signed_date"
                                  value={leaseFormData.signed_date}
                                  onChange={handleLeaseInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Move-in Date
                                </label>
                                <input
                                  type="date"
                                  name="move_in_date"
                                  value={leaseFormData.move_in_date}
                                  onChange={handleLeaseInputChange}
                                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.move_in_date ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {errors.move_in_date && (
                                  <p className="mt-1 text-xs text-red-600">{errors.move_in_date}</p>
                                )}
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lease Terms
                              </label>
                              <textarea
                                name="lease_terms"
                                value={leaseFormData.lease_terms}
                                onChange={handleLeaseInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter lease terms and conditions..."
                              />
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Special Conditions
                              </label>
                              <textarea
                                name="special_conditions"
                                value={leaseFormData.special_conditions}
                                onChange={handleLeaseInputChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Any special conditions or notes..."
                              />
                            </div>

                            <div className="flex space-x-3">
                              <button
                                onClick={handleLeaseAction}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmitting ? "Creating..." : "Create Lease"}
                              </button>
                              <button
                                onClick={() => setLeaseAction("")}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Assign Existing Lease Form */}
                        {leaseAction === "assign" && (
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-4">
                            <h5 className="text-lg font-medium text-gray-900 mb-4">Assign Existing Lease</h5>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Available Lease *
                              </label>
                              <select
                                value={selectedLeaseId}
                                onChange={(e) => setSelectedLeaseId(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.selectedLeaseId ? 'border-red-300' : 'border-gray-300'
                                }`}
                              >
                                <option value="">Select a lease...</option>
                                {availableLeases.map(lease => (
                                  <option key={lease.id} value={lease.id}>
                                    {lease.lease_number} - {lease.property_name} Unit {lease.unit_number} 
                                    (KSh {parseFloat(lease.monthly_rent || 0).toLocaleString()}/month)
                                  </option>
                                ))}
                              </select>
                              {errors.selectedLeaseId && (
                                <p className="mt-1 text-xs text-red-600">{errors.selectedLeaseId}</p>
                              )}
                            </div>

                            {availableLeases.length === 0 && (
                              <p className="text-sm text-gray-500 mb-4">
                                No unassigned leases available. Create a new lease instead.
                              </p>
                            )}

                            <div className="flex space-x-3">
                              <button
                                onClick={handleLeaseAction}
                                disabled={isSubmitting || availableLeases.length === 0}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmitting ? "Assigning..." : "Assign Lease"}
                              </button>
                              <button
                                onClick={() => setLeaseAction("")}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            {activeTab === "personal" && (
              <button
                type="submit"
                form="edit-tenant-form"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Tenant
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTenantModal;