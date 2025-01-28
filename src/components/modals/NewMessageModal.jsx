import React, { useState } from "react";

import {
  X,
} from "lucide-react";











const NewMessageModal = ({ isOpen, onClose }) => {
    const [messageData, setMessageData] = useState({
      recipient: "",
      subject: "",
      content: "",
      priority: "normal",
    });

    return (
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 ${
          !isOpen && "hidden"
        }`}
      >
        <div
          className="absolute inset-0 bg-black opacity-50"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-lg shadow-xl w-2/3 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">New Message</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">To</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Recipient name or unit"
                value={messageData.recipient}
                onChange={(e) =>
                  setMessageData({ ...messageData, recipient: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={messageData.subject}
                onChange={(e) =>
                  setMessageData({ ...messageData, subject: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={6}
                value={messageData.content}
                onChange={(e) =>
                  setMessageData({ ...messageData, content: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                className="w-full p-2 border rounded"
                value={messageData.priority}
                onChange={(e) =>
                  setMessageData({ ...messageData, priority: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
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
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default NewMessageModal








