import React, { useState, useEffect } from "react";

const PaymentMethodsManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    property_id: "",
    method_code: "",
    method_name: "",
    icon: "",
    details: {},
    instructions: [],
    requires_reference: true,
    auto_verify: false,
    processing_time_hours: 24,
    is_active: true,
    sort_order: 0,
  });

  const API_BASE_URL = "http://localhost:5020/api/payment-methods";

  // helper: get auth headers with token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // fetch properties + methods
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // fetch properties
        const propsRes = await fetch(`${API_BASE_URL}/properties`, {
          headers: getAuthHeaders(),
        });
        if (!propsRes.ok) throw new Error("Failed to fetch properties");
        const propsJson = await propsRes.json();
        console.log(propsJson)
        setProperties(propsJson.data || []);

        // fetch payment methods (if property selected)
        let methodsJson = { data: [] };
        if (selectedProperty !== "all") {
          const methodsRes = await fetch(
            `${API_BASE_URL}/property/${selectedProperty}`,
            { headers: getAuthHeaders() }
          );
          console.log(methodsJson)
          if (!methodsRes.ok) throw new Error("Failed to fetch methods");
          methodsJson = await methodsRes.json();
        }
        setPaymentMethods(methodsJson.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedProperty]);

  const handleEdit = (method) => {
    setEditingMethod(method.id);
    setFormData({
      property_id: method.property_id,
      method_code: method.method_code,
      method_name: method.method_name,
      icon: method.icon,
      details: method.details || {},
      instructions: method.instructions || [],
      requires_reference: method.requires_reference,
      auto_verify: method.auto_verify,
      processing_time_hours: method.processing_time_hours,
      is_active: method.is_active,
      sort_order: method.sort_order,
    });
    setShowAddForm(true);
  };

  const handleSave = async () => {
    try {
      const url = editingMethod
        ? `${API_BASE_URL}/${editingMethod}`
        : `${API_BASE_URL}`;
      const method = editingMethod ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save payment method");

      const saved = await res.json();
      const savedData = saved.data;

      if (editingMethod) {
        setPaymentMethods((prev) =>
          prev.map((m) => (m.id === editingMethod ? savedData : m))
        );
      } else {
        setPaymentMethods((prev) => [...prev, savedData]);
      }

      handleCancel();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingMethod(null);
    setFormData({
      property_id: "",
      method_code: "",
      method_name: "",
      icon: "",
      details: {},
      instructions: [],
      requires_reference: true,
      auto_verify: false,
      processing_time_hours: 24,
      is_active: true,
      sort_order: 0,
    });
  };

  const toggleStatus = async (id) => {
    try {
      const method = paymentMethods.find((m) => m.id === id);
      const updated = { ...method, is_active: !method.is_active };

      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const updatedRes = await res.json();

      setPaymentMethods((prev) =>
        prev.map((m) => (m.id === id ? updatedRes.data : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const updateInstruction = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.instructions];
      updated[index] = value;
      return { ...prev, instructions: updated };
    });
  };

  const removeDetailField = (key) => {
    setFormData((prev) => {
      const newDetails = { ...prev.details };
      delete newDetails[key];
      return { ...prev, details: newDetails };
    });
  };

  const filteredMethods =
    selectedProperty === "all"
      ? paymentMethods
      : paymentMethods.filter(
          (m) => m.property_id === parseInt(selectedProperty)
        );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Payment Methods Management
        </h2>
        <div className="flex items-center space-x-4">
          {/* Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter by Property
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.property_name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Add Payment Method
          </button>
        </div>
      </div>

      {/* Methods */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">Current Payment Methods</h3>
          <p className="text-sm text-gray-600">
            Manage available payment options for tenants
          </p>
        </div>
        {filteredMethods.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No payment methods found.
          </div>
        ) : (
          <div className="divide-y">
            {filteredMethods.map((method) => (
              <div key={method.id} className="p-6 flex justify-between">
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">{method.icon}</span>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {method.method_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Code: {method.method_code}
                    </p>
                    <p className="text-sm text-gray-600">
                      Property: {method.property_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Processing: {method.processing_time_hours}h
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      method.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {method.is_active ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => toggleStatus(method.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {method.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleEdit(method)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className=' fixed inset-0 bg-black opacity-60'></div>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto z-60">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Property */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Property *
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.property_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      property_id: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  <option value="">Choose a property...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.property_name} - {p.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Method Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Method Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    value={formData.method_code}
                    onChange={(e) =>
                      setFormData({ ...formData, method_code: e.target.value })
                    }
                    placeholder="e.g., mpesa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Method Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    value={formData.method_name}
                    onChange={(e) =>
                      setFormData({ ...formData, method_name: e.target.value })
                    }
                    placeholder="e.g., M-Pesa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="📱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Processing Time (hrs)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg shadow-sm"
                    value={formData.processing_time_hours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        processing_time_hours: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.requires_reference}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requires_reference: e.target.checked,
                      })
                    }
                  />
                  <span>Requires Reference</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.auto_verify}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        auto_verify: e.target.checked,
                      })
                    }
                  />
                  <span>Auto Verify</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  <span>Active</span>
                </label>
              </div>

              {/* Details Section */}
              {/* Details Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Method Details
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      // Add a new empty detail row
                      const newKey = `detail_${
                        Object.keys(formData.details).length + 1
                      }`;
                      setFormData({
                        ...formData,
                        details: {
                          ...formData.details,
                          [newKey]: "",
                        },
                      });
                    }}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    Add Detail
                  </button>
                </div>

                <div className="space-y-2">
                  {Object.entries(formData.details).map(([key, value]) => (
                    <div key={key} className="flex space-x-2">
                      <input
                        type="text"
                        className="w-1/3 p-2 border rounded"
                        value={key}
                        onChange={(e) => {
                          const newDetails = { ...formData.details };
                          const newKey = e.target.value;
                          // Rename the key while keeping the value
                          delete newDetails[key];
                          newDetails[newKey] = value;
                          setFormData({ ...formData, details: newDetails });
                        }}
                        placeholder="Detail key"
                      />
                      <input
                        type="text"
                        className="flex-1 p-2 border rounded"
                        value={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: {
                              ...formData.details,
                              [key]: e.target.value,
                            },
                          })
                        }
                        placeholder="Detail value"
                      />
                      <button
                        type="button"
                        onClick={() => removeDetailField(key)}
                        className="px-3 py-2 text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Instructions</h4>
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Instruction
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.instructions.map((inst, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2 bg-gray-50 p-2 rounded-lg"
                    >
                      <textarea
                        className="flex-1 px-2 py-1 border rounded"
                        value={inst}
                        onChange={(e) => updateInstruction(idx, e.target.value)}
                        rows={2}
                      />
                      <button
                        type="button"
                        onClick={() => removeInstruction(idx)}
                        className="px-2 py-1 text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                >
                  Save Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsManagement;
