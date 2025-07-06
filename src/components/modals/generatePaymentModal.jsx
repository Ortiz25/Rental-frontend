import React, { useState } from 'react';
import { X, Plus, RefreshCw } from 'lucide-react';

const GeneratePaymentsModal = ({ isOpen, onClose, onSubmit, processing }) => {
  const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear());

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(generateMonth, generateYear);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Generate Rent Payments</h2>
          <button onClick={onClose} disabled={processing}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Month</label>
            <select 
              className="w-full p-2 border rounded"
              value={generateMonth}
              onChange={(e) => setGenerateMonth(parseInt(e.target.value))}
              disabled={processing}
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={generateYear}
              onChange={(e) => setGenerateYear(parseInt(e.target.value))}
              min="2020"
              max="2030"
              disabled={processing}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">What this will do:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Create rent payment records for all active leases</li>
              <li>• Set due dates based on lease agreements</li>
              <li>• Initialize with "pending" status</li>
              <li>• Skip leases that already have payments for this period</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded flex items-center disabled:opacity-50"
              disabled={processing}
            >
              {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              {processing ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratePaymentsModal;