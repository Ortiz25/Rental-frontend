import React, { useState } from "react";
import { Plus, } from "lucide-react";
import EmailTemplateModal from "./modals/EmailTemplateModal";






const NotificationSettings = () => {
    const [settings, setSettings] = useState({
      emailNotifications: {
        newTenant: true,
        rentDue: true,
        maintenanceUpdates: true,
        leaseExpiry: true,
        paymentReceived: true
      },
      emailTemplates: [
        {
          id: 1,
          name: 'Welcome Email',
          subject: 'Welcome to Our Property',
          type: 'tenant_welcome',
          isActive: true
        },
        {
          id: 2,
          name: 'Rent Due Reminder',
          subject: 'Rent Payment Due',
          type: 'rent_reminder',
          isActive: true
        },
        {
          id: 3,
          name: 'Maintenance Request Update',
          subject: 'Update on Your Maintenance Request',
          type: 'maintenance_update',
          isActive: true
        }
      ],
      systemNotifications: {
        browser: true,
        sound: true,
        desktop: false
      },
      notificationPreferences: {
        frequency: 'immediate',
        digest: 'never',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        }
      }
    });
  
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
   
  
    const handleSaveTemplate = (templateData) => {
      if (selectedTemplate) {
        // Update existing template
        setEmailTemplates(templates => templates.map(template =>
          template.id === selectedTemplate.id ? { ...templateData, id: template.id } : template
        ));
      } else {
        // Add new template
        setEmailTemplates(templates => [...templates, { ...templateData, id: Date.now() }]);
      }
    };
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Notification Settings</h2>
          <button 
        onClick={() => setShowTemplateModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
      >
        <Plus className="w-5 h-5 mr-2" /> New Template
      </button>
        </div>
  
        {/* Email Notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Email Notifications</h3>
            <p className="text-sm text-gray-600 mt-1">Configure which events trigger email notifications</p>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(settings.emailNotifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={value}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailNotifications: {
                        ...settings.emailNotifications,
                        [key]: e.target.checked
                      }
                    })}
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${value ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white shadow transform duration-200 ease-in-out ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
  
        {/* Email Templates */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Email Templates</h3>
          </div>
          <div className="divide-y">
            {settings.emailTemplates.map(template => (
              <div key={template.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-600">Subject: {template.subject}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <button 
        onClick={() => {
          setSelectedTemplate(template);
          setShowTemplateModal(true);
        }}
        className="text-blue-500 hover:text-blue-600"
      >
        Edit
      </button>

                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* System Notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">System Notifications</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Notification Frequency</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={settings.notificationPreferences.frequency}
                  onChange={(e) => setSettings({
                    ...settings,
                    notificationPreferences: {
                      ...settings.notificationPreferences,
                      frequency: e.target.value
                    }
                  })}
                >
                  <option value="immediate">Immediate</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Daily Digest</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={settings.notificationPreferences.digest}
                  onChange={(e) => setSettings({
                    ...settings,
                    notificationPreferences: {
                      ...settings.notificationPreferences,
                      digest: e.target.value
                    }
                  })}
                >
                  <option value="never">Never</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>
  
            <div>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  className="rounded text-blue-500"
                  checked={settings.notificationPreferences.quietHours.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    notificationPreferences: {
                      ...settings.notificationPreferences,
                      quietHours: {
                        ...settings.notificationPreferences.quietHours,
                        enabled: e.target.checked
                      }
                    }
                  })}
                />
                <span className="ml-2">Enable Quiet Hours</span>
              </label>
  
              {settings.notificationPreferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <input
                      type="time"
                      className="w-full p-2 border rounded"
                      value={settings.notificationPreferences.quietHours.start}
                      onChange={(e) => setSettings({
                        ...settings,
                        notificationPreferences: {
                          ...settings.notificationPreferences,
                          quietHours: {
                            ...settings.notificationPreferences.quietHours,
                            start: e.target.value
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Time</label>
                    <input
                      type="time"
                      className="w-full p-2 border rounded"
                      value={settings.notificationPreferences.quietHours.end}
                      onChange={(e) => setSettings({
                        ...settings,
                        notificationPreferences: {
                          ...settings.notificationPreferences,
                          quietHours: {
                            ...settings.notificationPreferences.quietHours,
                            end: e.target.value
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <EmailTemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onSave={handleSaveTemplate}
      />
      </div>
    );
  };

  export default NotificationSettings