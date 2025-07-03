// services/FinancialApiService.js

const API_BASE_URL = '/backend';

class FinancialApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/financial`;
  }

  getAuthToken() {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  }

  async apiCall(endpoint, options = {}) {
    try {
      const token = this.getAuthToken();
      const url = `${this.baseURL}${endpoint}`;
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers
        },
        ...options
      };

      // console.log(`🔗 API Call: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Financial Summary Methods
  async getFinancialSummary(period = 'month') {
    return this.apiCall(`/summary?period=${period}`);
  }

  async getMonthlyData(months = 12) {
    return this.apiCall(`/monthly-data?months=${months}`);
  }

  async getExpenseBreakdown(period = 'month', propertyId = null) {
    const params = new URLSearchParams();
    params.append('period', period);
    if (propertyId) params.append('propertyId', propertyId);
    
    return this.apiCall(`/expense-breakdown?${params.toString()}`);
  }

  async getRecentTransactions(limit = 20) {
    return this.apiCall(`/recent-transactions?limit=${limit}`);
  }

  // Analytics Methods
  async getAnalytics(period = 'month') {
    return this.apiCall(`/analytics?period=${period}`);
  }

  async getPaymentTrends(months = 6) {
    return this.apiCall(`/payment-trends?months=${months}`);
  }

  async getPropertyPerformance(period = 'month') {
    return this.apiCall(`/property-performance?period=${period}`);
  }

  // Report Generation
  async generateReport(reportSettings) {
    return this.apiCall('/generate-report', {
      method: 'POST',
      body: JSON.stringify(reportSettings)
    });
  }

  // Export Methods
  async exportFinancialData(format = 'csv', startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (format) params.append('format', format);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const endpoint = `/export?${params.toString()}`;
    
    if (format === 'csv') {
      const token = this.getAuthToken();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      
      const csvContent = await response.text();
      this.downloadFile(csvContent, 'financial-report.csv', 'text/csv');
      return { success: true };
    } else {
      return this.apiCall(endpoint);
    }
  }

  // Expense Management Methods
  async getPropertyExpenses(propertyId = null) {
    const endpoint = propertyId ? `/property-expenses?propertyId=${propertyId}` : '/property-expenses';
    return this.apiCall(endpoint);
  }

  async createPropertyExpense(expenseData) {
    return this.apiCall('/property-expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  }

  async updatePropertyExpense(id, expenseData) {
    return this.apiCall(`/property-expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData)
    });
  }

  async deletePropertyExpense(id, hardDelete = false) {
    return this.apiCall(`/property-expenses/${id}?hardDelete=${hardDelete}`, {
      method: 'DELETE'
    });
  }

  async getExpenseCategories() {
    return this.apiCall('/expense-categories');
  }

  // Properties API (assuming you have this)
  async getProperties() {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/properties`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return { properties: [] };
    }
  }

  // Utility Methods
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Currency formatting utility
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  // Percentage formatting utility
  formatPercentage(value) {
    return `${(value || 0).toFixed(1)}%`;
  }
}

// Create and export a singleton instance
export const apiService = new FinancialApiService();
export default apiService;