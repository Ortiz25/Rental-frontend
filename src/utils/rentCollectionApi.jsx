




// API service functions
const API_BASE_URL = "/backend";





export const rentCollectionAPI = {
  // Existing API functions...

  processPayment: async (id, paymentData) => {
    const response = await fetch(
      `${API_BASE_URL}/rent-collection/${id}/process`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      }
    );
    return response.json();
  },

  generatePayments: async (month, year) => {
    const response = await fetch(`${API_BASE_URL}/rent-collection/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ month, year }),
    });
    return response.json();
  },

  sendReminders: async (paymentIds, reminderType = "overdue") => {
    const response = await fetch(
      `${API_BASE_URL}/rent-collection/send-reminders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_ids: paymentIds,
          reminder_type: reminderType,
        }),
      }
    );
    return response.json();
  },

  updateOverdue: async () => {
    const response = await fetch(
      `${API_BASE_URL}/rent-collection/update-overdue`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },

  getActiveLeases: async () => {
    const response = await fetch(`${API_BASE_URL}/leases/active-for-billing`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  },

  createPayment: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/rent-collection`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });
    return response.json();
  },

  getPayments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/rent/rent-collection?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },

  getSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/rent/rent-collection/summary?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },

  // Verification API functions
  getPendingSubmissions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/payment-verification/payment-submissions/pending?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },

  getSubmissionHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/payment-verification/payment-submissions/history?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },

  verifyPaymentSubmission: async (submissionId, verificationData) => {
    const response = await fetch(
      `${API_BASE_URL}/payment-verification/payment-submissions/${submissionId}/verify`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationData),
      }
    );
    return response.json();
  },

  rejectPaymentSubmission: async (submissionId, rejectionData) => {
    const response = await fetch(
      `${API_BASE_URL}/payment-verification/payment-submissions/${submissionId}/reject`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rejectionData),
      }
    );
    return response.json();
  },

  getSubmissionDetails: async (submissionId) => {
    const response = await fetch(
      `${API_BASE_URL}/payment-verification/payment-submissions/${submissionId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },

  bulkVerifySubmissions: async (submissionIds, verificationData) => {
    const response = await fetch(
      `${API_BASE_URL}/payment-verification/payment-submissions/bulk-verify`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_ids: submissionIds,
          ...verificationData,
        }),
      }
    );
    return response.json();
  },

  getVerificationStats: async () => {
    const response = await fetch(
      `${API_BASE_URL}/payment-verification/payment-submissions/stats`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },
  // Utility charges API
  getUtilityCharges: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/utility-charges?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },

  getUtilitySummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_BASE_URL}/utility-charges/summary?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  },

  createUtilityCharge: async (data) => {
    const response = await fetch(`${API_BASE_URL}/utility-charges`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateUtilityCharge: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/utility-charges/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteUtilityCharge: async (id) => {
    const response = await fetch(`${API_BASE_URL}/utility-charges/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  },

  generateUtilityCharges: async (month, year, defaultCharges) => {
    const response = await fetch(`${API_BASE_URL}/utility-charges/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ month, year, default_charges: defaultCharges }),
    });
    return response.json();
  },
  billUtilitiesToRent: async (month, year) => {
    const response = await fetch(`${API_BASE_URL}/utility-charges/bill-to-rent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ month, year })
    });
    return response.json();
  }
};