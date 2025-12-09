import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const UtilityChargeModal = ({
  isOpen,
  onClose,
  charge,
  activeLeases,
  onSubmit,
  processing,
}) => {
  //console.log(activeLeases);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    lease_id: "",
    billing_month: new Date().toISOString().split("T")[0].substring(0, 7),
    water_charges: 0,
    water_usage: "",
    electricity_charges: 0,
    electricity_usage: "",
    gas_charges: 0,
    service_charges: 0,
    garbage_charges: 0,
    common_area_charges: 0,
    other_charges: 0,
    other_charges_description: "",
    due_date: "",
    charge_status: "pending", // ADD THIS LINE
    notes: "",
  });
  useEffect(() => {
    if (charge) {
      setFormData({
        lease_id: charge.lease_id,
        billing_month: charge.billing_month.substring(0, 7),
        water_charges: charge.water_charges || 0,
        water_usage: charge.water_usage || "",
        electricity_charges: charge.electricity_charges || 0,
        electricity_usage: charge.electricity_usage || "",
        gas_charges: charge.gas_charges || 0,
        service_charges: charge.service_charges || 0,
        garbage_charges: charge.garbage_charges || 0,
        common_area_charges: charge.common_area_charges || 0,
        other_charges: charge.other_charges || 0,
        other_charges_description: charge.other_charges_description || "",
        due_date: charge.due_date || "",
        charge_status: charge.charge_status || "pending", // ADD THIS LINE
        notes: charge.notes || "",
      });
    }
  }, [charge]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      billing_month: formData.billing_month + "-01", // Convert to full date
      water_charges: parseFloat(formData.water_charges) || 0,
      electricity_charges: parseFloat(formData.electricity_charges) || 0,
      gas_charges: parseFloat(formData.gas_charges) || 0,
      service_charges: parseFloat(formData.service_charges) || 0,
      garbage_charges: parseFloat(formData.garbage_charges) || 0,
      common_area_charges: parseFloat(formData.common_area_charges) || 0,
      other_charges: parseFloat(formData.other_charges) || 0,
      water_usage: formData.water_usage
        ? parseFloat(formData.water_usage)
        : null,
      electricity_usage: formData.electricity_usage
        ? parseFloat(formData.electricity_usage)
        : null,
    };

    if (charge) {
      onSubmit(charge.id, submitData);
    } else {
      onSubmit(submitData);
    }
  };
  const filteredLeases = activeLeases.filter((lease) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lease.property_name?.toLowerCase().includes(searchLower) ||
      lease.tenant_name?.toLowerCase().includes(searchLower) ||
      lease.lease_number?.toLowerCase().includes(searchLower) ||
      lease.primary_tenant_name?.toLowerCase().includes(searchLower)
    );
  });

  const calculateTotal = () => {
    return (
      parseFloat(formData.water_charges || 0) +
      parseFloat(formData.electricity_charges || 0) +
      parseFloat(formData.gas_charges || 0) +
      parseFloat(formData.service_charges || 0) +
      parseFloat(formData.garbage_charges || 0) +
      parseFloat(formData.common_area_charges || 0) +
      parseFloat(formData.other_charges || 0)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto z-50">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {charge ? "Edit Utility Charge" : "New Utility Charge"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!charge && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Lease *
                </label>

                {/* Search Input */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Search by property, tenant, or lease number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Lease Selection */}
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                  <select
                    required
                    value={formData.lease_id}
                    onChange={(e) =>
                      setFormData({ ...formData, lease_id: e.target.value })
                    }
                    className="w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none max-h-64 cursor-pointer"
                    size="6"
                  >
                    <option value="" className="text-gray-500 py-2">
                      -- Select a lease --
                    </option>
                    {filteredLeases.map((lease) => (
                      <option
                        key={lease.id}
                        value={lease.id}
                        className="py-2 hover:bg-blue-50"
                      >
                        🏢 {lease.property_name} • {lease.primary_tenant_name} (
                        {lease.lease_number})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Results Counter */}
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {filteredLeases.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {activeLeases.length}
                    </span>{" "}
                    leases
                  </span>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Month *
              </label>
              <input
                type="month"
                required
                value={formData.billing_month}
                onChange={(e) =>
                  setFormData({ ...formData, billing_month: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.charge_status || "pending"}
                onChange={(e) =>
                  setFormData({ ...formData, charge_status: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="billed">Billed</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="waived">Waived</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Charges (KES)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.water_charges}
                onChange={(e) =>
                  setFormData({ ...formData, water_charges: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Usage (m³)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.water_usage}
                onChange={(e) =>
                  setFormData({ ...formData, water_usage: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Electricity Charges (KES)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.electricity_charges}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    electricity_charges: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Electricity Usage (kWh)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.electricity_usage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    electricity_usage: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gas Charges (KES)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.gas_charges}
                onChange={(e) =>
                  setFormData({ ...formData, gas_charges: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Charges (KES)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.service_charges}
                onChange={(e) =>
                  setFormData({ ...formData, service_charges: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Garbage Charges (KES)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.garbage_charges}
                onChange={(e) =>
                  setFormData({ ...formData, garbage_charges: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Common Area Charges (KES)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.common_area_charges}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    common_area_charges: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Charges (KES)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.other_charges}
                onChange={(e) =>
                  setFormData({ ...formData, other_charges: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Charges Description
              </label>
              <input
                type="text"
                value={formData.other_charges_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    other_charges_description: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Describe other charges"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                rows="3"
                placeholder="Additional notes"
              />
            </div>

            <div className="md:col-span-2 bg-blue-50 p-4 rounded">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  Total Utility Charges:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  KES {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center disabled:opacity-50"
              disabled={processing}
            >
              <Save className="w-4 h-4 mr-2" />
              {processing ? "Saving..." : charge ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UtilityChargeModal;
