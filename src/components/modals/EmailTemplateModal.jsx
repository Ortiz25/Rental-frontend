import React, { useState } from "react";
import { Camera, X } from "lucide-react";










const EmailTemplateModal = ({ isOpen, onClose, template, onSave }) => {
    const [templateData, setTemplateData] = useState(template || {
      name: '',
      subject: '',
      content: '',
      type: '',
      isActive: true,
      variables: []
    });
  
    const availableVariables = {
      tenant: ['{{tenant.name}}', '{{tenant.email}}', '{{tenant.phone}}'],
      property: ['{{property.name}}', '{{property.address}}', '{{property.unit}}'],
      lease: ['{{lease.startDate}}', '{{lease.endDate}}', '{{lease.rentAmount}}'],
      payment: ['{{payment.amount}}', '{{payment.dueDate}}', '{{payment.lateFee}}']
    };
  
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">
              {template ? 'Edit Email Template' : 'New Email Template'}
            </h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Template Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Template Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={templateData.name}
                    onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                    required
                  />
                </div>
  
                <div>
                  <label className="block text-sm font-medium mb-2">Email Subject</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={templateData.subject}
                    onChange={(e) => setTemplateData({...templateData, subject: e.target.value})}
                    required
                  />
                </div>
  
                <div>
                  <label className="block text-sm font-medium mb-2">Template Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={templateData.type}
                    onChange={(e) => setTemplateData({...templateData, type: e.target.value})}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="tenant_welcome">Welcome Email</option>
                    <option value="rent_reminder">Rent Reminder</option>
                    <option value="maintenance_update">Maintenance Update</option>
                    <option value="lease_expiry">Lease Expiry</option>
                    <option value="payment_confirmation">Payment Confirmation</option>
                  </select>
                </div>
  
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="text-blue-500"
                        checked={templateData.isActive}
                        onChange={() => setTemplateData({...templateData, isActive: true})}
                      />
                      <span className="ml-2">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="text-blue-500"
                        checked={!templateData.isActive}
                        onChange={() => setTemplateData({...templateData, isActive: false})}
                      />
                      <span className="ml-2">Inactive</span>
                    </label>
                  </div>
                </div>
  
                <div>
                  <label className="block text-sm font-medium mb-2">Available Variables</label>
                  <div className="border rounded p-4 space-y-4">
                    {Object.entries(availableVariables).map(([category, vars]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium capitalize mb-2">{category} Variables</h4>
                        <div className="flex flex-wrap gap-2">
                          {vars.map(variable => (
                            <button
                              key={variable}
                              onClick={() => {
                                const textarea = document.getElementById('template-content');
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const text = textarea.value;
                                const before = text.substring(0, start);
                                const after = text.substring(end);
                                setTemplateData({
                                  ...templateData,
                                  content: before + variable + after
                                });
                              }}
                              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                              type="button"
                            >
                              {variable}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
  
              {/* Template Content */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Content</label>
                  <textarea
                    id="template-content"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    rows={20}
                    value={templateData.content}
                    onChange={(e) => setTemplateData({...templateData, content: e.target.value})}
                    required
                  />
                </div>
  
                <div>
                  <label className="block text-sm font-medium mb-2">Preview</label>
                  <div 
                    className="border rounded p-4 prose max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: templateData.content
                        .replace(/{{([^}]+)}}/g, '<span class="text-blue-500">$&</span>')
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
  
          <div className="flex justify-end space-x-2 p-6 bg-gray-50 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(templateData);
                onClose();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default EmailTemplateModal