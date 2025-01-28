import React, { useState } from "react";








const SystemSettings = () => {
    const [settings, setSettings] = useState({
      general: {
        systemName: 'Rental Management System',
        timezone: 'UTC-5',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        language: 'en',
        maintenanceMode: false
      },
      backup: {
        autoBackup: true,
        frequency: 'daily',
        retention: 30,
        lastBackup: '2024-01-27T10:00:00',
        storageLocation: 'cloud'
      },
      integrations: [
        {
          id: 1,
          name: 'Payment Gateway',
          provider: 'Stripe',
          status: 'connected',
          lastSync: '2024-01-28T08:30:00'
        },
        {
          id: 2,
          name: 'Email Service',
          provider: 'SendGrid',
          status: 'connected',
          lastSync: '2024-01-28T08:30:00'
        }
      ],
      api: {
        enabled: true,
        keyGenerated: true,
        lastRotated: '2024-01-01T00:00:00'
      }
    });
  
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">System Settings</h2>
  
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">General Settings</h3>
            <p className="text-sm text-gray-600 mt-1">Configure basic system settings</p>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">System Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={settings.general.systemName}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, systemName: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                className="w-full p-2 border rounded"
                value={settings.general.timezone}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, timezone: e.target.value }
                })}
              >
                <option value="UTC-5">Eastern Time (UTC-5)</option>
                <option value="UTC-6">Central Time (UTC-6)</option>
                <option value="UTC-7">Mountain Time (UTC-7)</option>
                <option value="UTC-8">Pacific Time (UTC-8)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Format</label>
              <select
                className="w-full p-2 border rounded"
                value={settings.general.dateFormat}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, dateFormat: e.target.value }
                })}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                className="w-full p-2 border rounded"
                value={settings.general.currency}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, currency: e.target.value }
                })}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>
  
        {/* Backup Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Backup & Recovery</h3>
            <p className="text-sm text-gray-600 mt-1">Configure system backup settings</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Automatic Backups</p>
                <p className="text-sm text-gray-600">System will create backups automatically</p>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => setSettings({
                    ...settings,
                    backup: { ...settings.backup, autoBackup: e.target.checked }
                  })}
                />
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  settings.backup.autoBackup ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-6 h-6 rounded-full bg-white shadow transform duration-200 ease-in-out ${
                    settings.backup.autoBackup ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Backup Frequency</label>
                <select
                  className="w-full p-2 border rounded"
                  value={settings.backup.frequency}
                  onChange={(e) => setSettings({
                    ...settings,
                    backup: { ...settings.backup, frequency: e.target.value }
                  })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Retention Period (Days)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={settings.backup.retention}
                  onChange={(e) => setSettings({
                    ...settings,
                    backup: { ...settings.backup, retention: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>
  
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">Last Backup</p>
                <p className="text-sm text-gray-600">
                  {new Date(settings.backup.lastBackup).toLocaleString()}
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Backup Now
              </button>
            </div>
          </div>
        </div>
  
        {/* Integrations
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">System Integrations</h3>
            <p className="text-sm text-gray-600 mt-1">Manage third-party service integrations</p>
          </div>
          <div className="divide-y">
            {settings.integrations.map(integration => (
              <div key={integration.id} className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{integration.name}</h4>
                  <p className="text-sm text-gray-600">Provider: {integration.provider}</p>
                  <p className="text-sm text-gray-600">
                    Last Sync: {new Date(integration.lastSync).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    integration.status === 'connected' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {integration.status}
                  </span>
                  <button className="text-blue-500 hover:text-blue-600">Configure</button>
                </div>
              </div>
            ))}
          </div>
        </div> */}
  
        {/* API Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">API Configuration</h3>
            <p className="text-sm text-gray-600 mt-1">Manage API access and keys</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">API Access</p>
                <p className="text-sm text-gray-600">Enable or disable API access</p>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={settings.api.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    api: { ...settings.api, enabled: e.target.checked }
                  })}
                />
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  settings.api.enabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-6 h-6 rounded-full bg-white shadow transform duration-200 ease-in-out ${
                    settings.api.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>
  
            <div className="p-4 bg-gray-50 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">API Key</p>
                  <p className="text-sm text-gray-600">
                    Last rotated: {new Date(settings.api.lastRotated).toLocaleDateString()}
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Rotate Key
                </button>
              </div>
            </div>
          </div>
        </div>
  
        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </div>
    );
  };
  
  export default SystemSettings;