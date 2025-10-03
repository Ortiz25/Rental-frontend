import React, { useState, useEffect } from "react";
import axios from "axios";

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    general: {},
    financial: {},
    leases: {},
    maintenance: {},
    security: {},
  });
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [backups, setBackups] = useState([]);
  const [backingUp, setBackingUp] = useState(false);

  const URL = "/backend";

  // Fetch backups function (moved outside)
  const fetchBackups = async () => {
    try {
      const response = await axios.get(`${URL}/api/system-settings/backup/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.status === 200) {
        setBackups(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching backups:", error);
    }
  };

  // Backup handler (moved outside)
  const handleBackupNow = async () => {
    setBackingUp(true);
    try {
      const response = await axios.post(
        `${URL}/api/system-settings/backup/manual`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );



      if (response.data.status === 200) {
        showMessage(
          "success",
          `Backup created: ${response.data.data.filename} (${response.data.data.size})`
        );
        fetchBackups(); // Refresh backup list
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to create backup"
      );
    } finally {
      setBackingUp(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchStats();
    fetchBackups();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${URL}/api/system-settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.status === 200) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      showMessage("error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${URL}/api/system-settings/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.status === 200) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: prev[category].map((setting) =>
        setting.key === key ? { ...setting, value } : setting
      ),
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const flatSettings = {};
      Object.values(settings).forEach((categorySettings) => {
        if (Array.isArray(categorySettings)) {
          categorySettings.forEach((setting) => {
            if (setting.isEditable) {
              flatSettings[setting.key] = setting.value;
            }
          });
        }
      });

      const response = await axios.put(
        `${URL}/api/system-settings`,
        { settings: flatSettings },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.status === 200) {
        showMessage("success", "Settings saved successfully");
        fetchSettings();
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const renderSettingInput = (setting, category) => {
    if (!setting.isEditable) {
      return (
        <div className="p-2 bg-gray-100 rounded text-gray-600">
          {setting.value}
        </div>
      );
    }

    switch (setting.type) {
      case "boolean":
        return (
          <div className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              className="sr-only"
              checked={setting.value === "true"}
              onChange={(e) =>
                handleSettingChange(
                  category,
                  setting.key,
                  e.target.checked.toString()
                )
              }
            />
            <div
              onClick={() =>
                handleSettingChange(
                  category,
                  setting.key,
                  setting.value === "true" ? "false" : "true"
                )
              }
              className={`cursor-pointer w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                setting.value === "true" ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow transform duration-200 ease-in-out ${
                  setting.value === "true" ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={setting.value}
            onChange={(e) =>
              handleSettingChange(category, setting.key, e.target.value)
            }
          />
        );

      default:
        return (
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={setting.value}
            onChange={(e) =>
              handleSettingChange(category, setting.key, e.target.value)
            }
          />
        );
    }
  };

  const renderCategory = (categoryName, categoryLabel) => {
    const categorySettings = settings[categoryName];

    if (
      !categorySettings ||
      !Array.isArray(categorySettings) ||
      categorySettings.length === 0
    ) {
      return null;
    }

    const filteredSettings = categorySettings.filter(
      (setting) =>
        !setting.key.includes("two_factor") && !setting.key.includes("2fa")
    );

    if (filteredSettings.length === 0) {
      return null;
    }

    return (
      <div key={categoryName} className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">{categoryLabel}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure {categoryLabel.toLowerCase()} settings
          </p>
        </div>
        <div className="p-6 space-y-6">
          {filteredSettings.map((setting) => (
            <div
              key={setting.key}
              className="grid grid-cols-2 gap-4 items-start"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  {setting.key
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </label>
                {setting.description && (
                  <p className="text-xs text-gray-500">{setting.description}</p>
                )}
              </div>
              <div>{renderSettingInput(setting, categoryName)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Settings</h2>
        {message.text && (
          <div
            className={`px-4 py-2 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">System Overview</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total_properties}
              </div>
              <div className="text-sm text-gray-600">Properties</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {stats.total_units}
              </div>
              <div className="text-sm text-gray-600">Units</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {stats.active_leases}
              </div>
              <div className="text-sm text-gray-600">Active Leases</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-orange-600">
                {stats.open_maintenance_requests}
              </div>
              <div className="text-sm text-gray-600">Open Requests</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Database Size: {stats.database_size}</p>
            <p>Total Users: {stats.total_users}</p>
          </div>
        </div>
      )}

      {renderCategory("general", "General Settings")}
      {renderCategory("financial", "Financial Settings")}
      {renderCategory("leases", "Lease Settings")}
      {renderCategory("security", "Security Settings")}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Database Backups</h3>
          <p className="text-sm text-gray-600 mt-1">Manage database backups</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
            <div>
              <p className="text-sm font-medium">Create Backup</p>
              <p className="text-sm text-gray-600">
                Manually create a database backup
              </p>
            </div>
            <button
              onClick={handleBackupNow}
              disabled={backingUp}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {backingUp ? "Creating..." : "Backup Now"}
            </button>
          </div>

          {backups.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Available Backups</h4>
              <div className="space-y-2">
                {backups.slice(0, 5).map((backup) => (
                  <div
                    key={backup.filename}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded text-sm"
                  >
                    <div>
                      <p className="font-medium">{backup.filename}</p>
                      <p className="text-gray-600 text-xs">
                        {new Date(backup.created).toLocaleString()} • {backup.size}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;