import React, { useState } from "react";
import Navbar from "../../layout/navbar";

import { X } from "lucide-react";

const AnnouncementModal = ({ isOpen, onClose }) => {
  const [announcementData, setAnnouncementData] = useState({
    title: "",
    content: "",
    priority: "normal",
    recipients: "all",
  });

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-2/3">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">New Announcement</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={announcementData.title}
              onChange={(e) =>
                setAnnouncementData({
                  ...announcementData,
                  title: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              value={announcementData.content}
              onChange={(e) =>
                setAnnouncementData({
                  ...announcementData,
                  content: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                className="w-full p-2 border rounded"
                value={announcementData.priority}
                onChange={(e) =>
                  setAnnouncementData({
                    ...announcementData,
                    priority: e.target.value,
                  })
                }
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Recipients
              </label>
              <select
                className="w-full p-2 border rounded"
                value={announcementData.recipients}
                onChange={(e) =>
                  setAnnouncementData({
                    ...announcementData,
                    recipients: e.target.value,
                  })
                }
              >
                <option value="all">All Tenants</option>
                <option value="building1">Building 1</option>
                <option value="building2">Building 2</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Send Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default AnnouncementModal
