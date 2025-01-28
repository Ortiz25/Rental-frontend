import React, { useState } from "react";









const SecuritySettings = () => {
    const [settings, setSettings] = useState({
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90
      },
      twoFactorAuth: {
        required: true,
        allowedMethods: ['authenticator', 'sms']
      },
      sessionPolicy: {
        timeout: 30,
        maxAttempts: 5,
        lockoutDuration: 15
      },
      ipWhitelist: []
    });
  
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Security Settings</h2>
  
        {/* Password Policy */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Password Policy</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordPolicy: {
                      ...settings.passwordPolicy,
                      minLength: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password Expiry (Days)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={settings.passwordPolicy.expiryDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordPolicy: {
                      ...settings.passwordPolicy,
                      expiryDays: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              {[
                { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                { key: 'requireNumbers', label: 'Require Numbers' },
                { key: 'requireSpecialChars', label: 'Require Special Characters' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-blue-500"
                    checked={settings.passwordPolicy[key]}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings.passwordPolicy,
                        [key]: e.target.checked
                      }
                    })}
                  />
                  <span className="ml-2 text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
  
        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded text-blue-500"
                checked={settings.twoFactorAuth.required}
                onChange={(e) => setSettings({
                  ...settings,
                  twoFactorAuth: {
                    ...settings.twoFactorAuth,
                    required: e.target.checked
                  }
                })}
              />
              <span className="ml-2">Require Two-Factor Authentication</span>
            </label>
  
            <div className="pl-6">
              <p className="text-sm font-medium mb-2">Allowed Methods</p>
              <div className="space-y-2">
                {['authenticator', 'sms', 'email'].map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-blue-500"
                      checked={settings.twoFactorAuth.allowedMethods.includes(method)}
                      onChange={(e) => {
                        const newMethods = e.target.checked
                          ? [...settings.twoFactorAuth.allowedMethods, method]
                          : settings.twoFactorAuth.allowedMethods.filter(m => m !== method);
                        setSettings({
                          ...settings,
                          twoFactorAuth: {
                            ...settings.twoFactorAuth,
                            allowedMethods: newMethods
                          }
                        });
                      }}
                    />
                    <span className="ml-2 text-sm capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
  
        {/* Session Policy */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Session Policy</h3>
          </div>
          <div className="p-6 grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Session Timeout (Minutes)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={settings.sessionPolicy.timeout}
                onChange={(e) => setSettings({
                  ...settings,
                  sessionPolicy: {
                    ...settings.sessionPolicy,
                    timeout: parseInt(e.target.value)
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={settings.sessionPolicy.maxAttempts}
                onChange={(e) => setSettings({
                  ...settings,
                  sessionPolicy: {
                    ...settings.sessionPolicy,
                    maxAttempts: parseInt(e.target.value)
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Lockout Duration (Minutes)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={settings.sessionPolicy.lockoutDuration}
                onChange={(e) => setSettings({
                  ...settings,
                  sessionPolicy: {
                    ...settings.sessionPolicy,
                    lockoutDuration: parseInt(e.target.value)
                  }
                })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };



  export default SecuritySettings