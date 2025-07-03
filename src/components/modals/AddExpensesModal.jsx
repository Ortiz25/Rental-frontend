import React, { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { apiService } from "../../services/financialApiServices.jsx";

const AddExpenseModal = ({
  isOpen,
  onClose,
  onExpenseAdded,
  onError,
  properties = [],
  categories = [],
}) => {
  console.log(properties)
  const [formData, setFormData] = useState({
    propertyId: "",
    expenseType: "",
    amount: "",
    frequency: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    description: "",
    categoryId: "",
  });
  const [adding, setAdding] = useState(false);

  const resetForm = () => {
    setFormData({
      propertyId: "",
      expenseType: "",
      amount: "",
      frequency: "monthly",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      description: "",
      categoryId: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.propertyId || !formData.expenseType || !formData.amount) {
      onError(
        "Please fill in all required fields (Property, Expense Type, and Amount)"
      );
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      onError("Amount must be greater than 0");
      return;
    }

    if (formData.endDate && formData.endDate <= formData.startDate) {
      onError("End date must be after start date");
      return;
    }

    setAdding(true);

    try {
      await apiService.createPropertyExpense({
        propertyId: parseInt(formData.propertyId),
        expenseType: formData.expenseType.trim(),
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        description: formData.description.trim() || null,
        categoryId: formData.categoryId || null,
      });

      // Success - reset form and close modal
      resetForm();
      onClose();
      onExpenseAdded();
    } catch (err) {
      onError("Failed to add expense: " + (err.message || "Unknown error"));
      console.error("Error adding expense:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    if (!adding) {
      resetForm();
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getSelectedPropertyName = () => {
    const selectedProperty = properties.find(
      (p) => p.id.toString() === formData.propertyId
    );
    return selectedProperty
      ? selectedProperty.property_name || selectedProperty.name
      : "";
  };

  const calculateMonthlyEquivalent = () => {
    const amount = parseFloat(formData.amount) || 0;
    switch (formData.frequency) {
      case "monthly":
        return amount;
      case "quarterly":
        return amount / 3;
      case "annual":
        return amount / 12;
      case "one-time":
        return amount;
      default:
        return amount;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={handleClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto z-10">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Add New Expense</h3>
          <button
            onClick={handleClose}
            disabled={adding}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property *
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => handleInputChange("propertyId", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={adding}
            >
              <option value="">Select a property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.propertyName || property.name}
                </option>
              ))}
            </select>
            {properties.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No properties available
              </p>
            )}
          </div>

          {/* Expense Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense Type *
            </label>
            <input
              type="text"
              value={formData.expenseType}
              onChange={(e) => handleInputChange("expenseType", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Property Tax, Insurance, Utilities"
              required
              disabled={adding}
              maxLength={100}
            />
          </div>

          {/* Amount and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
                disabled={adding}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => handleInputChange("frequency", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={adding}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

          {/* Monthly Equivalent Display */}
          {formData.amount && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Monthly Equivalent:</strong> $
                {calculateMonthlyEquivalent().toFixed(2)}
                {formData.frequency !== "monthly" && (
                  <span className="text-blue-600 ml-1">
                    (${formData.amount} {formData.frequency})
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={adding}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={adding}
                min={formData.startDate}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Additional notes about this expense..."
              disabled={adding}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Category (if available) */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (Optional)
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  handleInputChange("categoryId", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={adding}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Summary Preview */}
          {formData.propertyId && formData.expenseType && formData.amount && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Expense Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Property:</strong> {getSelectedPropertyName()}
                </p>
                <p>
                  <strong>Expense:</strong> {formData.expenseType}
                </p>
                <p>
                  <strong>Amount:</strong> ${formData.amount} (
                  {formData.frequency})
                </p>
                <p>
                  <strong>Monthly Impact:</strong> $
                  {calculateMonthlyEquivalent().toFixed(2)}
                </p>
                {formData.endDate && (
                  <p>
                    <strong>Duration:</strong> {formData.startDate} to{" "}
                    {formData.endDate}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={adding}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center transition-colors disabled:opacity-50"
              disabled={adding}
            >
              {adding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {adding ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>

        {/* Loading Overlay */}
        {adding && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">Adding expense...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpenseModal;