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
  console.log(activeLeases)
  const [formData, setFormData] = useState({
    lease_id: '',
    billing_month: new Date().toISOString().split('T')[0].substring(0, 7),
    water_charges: 0,
    water_usage: '',
    electricity_charges: 0,
    electricity_usage: '',
    gas_charges: 0,
    service_charges: 0,
    garbage_charges: 0,
    common_area_charges: 0,
    other_charges: 0,
    other_charges_description: '',
    due_date: '',
    charge_status: 'pending',  // ADD THIS LINE
    notes: ''
  });
  useEffect(() => {
    if (charge) {
      setFormData({
        lease_id: charge.lease_id,
        billing_month: charge.billing_month.substring(0, 7),
        water_charges: charge.water_charges || 0,
        water_usage: charge.water_usage || '',
        electricity_charges: charge.electricity_charges || 0,
        electricity_usage: charge.electricity_usage || '',
        gas_charges: charge.gas_charges || 0,
        service_charges: charge.service_charges || 0,
        garbage_charges: charge.garbage_charges || 0,
        common_area_charges: charge.common_area_charges || 0,
        other_charges: charge.other_charges || 0,
        other_charges_description: charge.other_charges_description || '',
        due_date: charge.due_date || '',
        charge_status: charge.charge_status || 'pending',  // ADD THIS LINE
        notes: charge.notes || ''
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
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto z-60">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lease *
                </label>
                <select
                  required
                  value={formData.lease_id}
                  onChange={(e) =>
                    setFormData({ ...formData, lease_id: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select a lease</option>
                  {activeLeases.map((lease) => (
                    <option key={lease.id} value={lease.id}>
                      {lease.lease_number} - {lease.tenant_name} (
                      {lease.primary_tenant_name}-{lease.property_name})
                    </option>
                  ))}
                </select>
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
