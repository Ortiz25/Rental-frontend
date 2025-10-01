import React from "react";
import {
  DollarSign,
  Calendar,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatCurrency } from "../utils/helperFunctions.jsx";

const UtilityChargeCard = ({ charge, onEdit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "billed":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {charge.tenant_name}
          </h3>
          <p className="text-sm text-gray-600">{charge.property_unit}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
            charge.charge_status
          )}`}
        >
          {getStatusIcon(charge.charge_status)}
          <span>{charge.charge_status.toUpperCase()}</span>
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-sm text-gray-600">Billing Month:</span>
          <span className="font-medium">
            {new Date(charge.billing_month).toLocaleDateString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {charge.water_charges > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Water:</span>
            <span className="font-medium">
              {formatCurrency(charge.water_charges)}
            </span>
          </div>
        )}

        {charge.electricity_charges > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Electricity:</span>
            <span className="font-medium">
              {formatCurrency(charge.electricity_charges)}
            </span>
          </div>
        )}

        {charge.gas_charges > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Gas:</span>
            <span className="font-medium">
              {formatCurrency(charge.gas_charges)}
            </span>
          </div>
        )}

        {charge.service_charges > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Service Charges:</span>
            <span className="font-medium">
              {formatCurrency(charge.service_charges)}
            </span>
          </div>
        )}

        {charge.garbage_charges > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Garbage:</span>
            <span className="font-medium">
              {formatCurrency(charge.garbage_charges)}
            </span>
          </div>
        )}

        {charge.other_charges > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Other:</span>
            <span className="font-medium">
              {formatCurrency(charge.other_charges)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(charge.total_utility_charges)}
          </span>
        </div>

        {charge.due_date && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Due Date:</span>
            <span className="font-medium">
              {new Date(charge.due_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(charge)}
          className={`flex-1 px-4 py-2 rounded flex items-center justify-center ${
            charge.charge_status === "billed" || charge.charge_status === "paid"
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          disabled={
            charge.charge_status === "billed" || charge.charge_status === "paid"
          }
        >
          <Edit className="w-4 h-4 mr-2" />
          {charge.charge_status === "billed" || charge.charge_status === "paid"
            ? "Billed"
            : "Edit"}
        </button>
      </div>
    </div>
  );
};

export default UtilityChargeCard;
