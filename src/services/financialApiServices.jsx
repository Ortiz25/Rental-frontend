// Updated FinancialApiService.js with month filtering support

const API_BASE_URL = 'http://localhost:5020/api';

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

  // ==========================================
  // ENHANCED: Financial Summary with Month Filter
  // ==========================================
  
  /**
   * Get financial summary with flexible filtering
   * @param {Object} options - Filter options
   * @param {string} options.period - 'month', 'quarter', 'year' (default: 'month')
   * @param {string|number} options.month - Specific month (1-12 or 'january', 'february', etc.)
   * @param {number} options.year - Specific year (e.g., 2025)
   * @param {string} options.startDate - Custom start date (YYYY-MM-DD)
   * @param {string} options.endDate - Custom end date (YYYY-MM-DD)
   * @param {string} options.propertyId - Property filter
   * @returns {Promise} Financial summary data
   */
  async getFinancialSummary(options = {}) {
    // Handle both old format (period, propertyId) and new format (options object)
    let filters;
    
    if (typeof options === 'string') {
      // Old format: getFinancialSummary('quarter', propertyId)
      filters = {
        period: options,
        propertyId: arguments[1] || null
      };
    } else {
      // New format: getFinancialSummary({ period: 'quarter', month: 'january', ... })
      filters = {
        period: options.period || 'month',
        month: options.month || null,
        year: options.year || null,
        startDate: options.startDate || null,
        endDate: options.endDate || null,
        propertyId: options.propertyId || null
      };
    }

    const params = new URLSearchParams();
    
    // Add all non-null filters
    if (filters.period) params.append('period', filters.period);
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
    
    console.log('📊 Fetching summary with filters:', filters);
    
    return this.apiCall(`/summary?${params.toString()}`);
  }

  // ==========================================
  // ENHANCED: Monthly Data with Month Filter
  // ==========================================
  
  async getMonthlyData(months = 12, propertyId = null, options = {}) {
    const params = new URLSearchParams();
    params.append('months', months);
    if (propertyId) params.append('propertyId', propertyId);
    
    // Support additional filters
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    
    return this.apiCall(`/monthly-data?${params.toString()}`);
  }

  // ==========================================
  // ENHANCED: Expense Breakdown with Month Filter
  // ==========================================
  
  async getExpenseBreakdown(options = {}) {
    // Handle both old format and new format
    let filters;
    
    if (typeof options === 'string') {
      // Old format: getExpenseBreakdown('quarter', propertyId)
      filters = {
        period: options,
        propertyId: arguments[1] || null
      };
    } else {
      // New format: getExpenseBreakdown({ period: 'quarter', month: 'january', ... })
      filters = {
        period: options.period || 'month',
        month: options.month || null,
        year: options.year || null,
        propertyId: options.propertyId || null
      };
    }

    const params = new URLSearchParams();
    
    if (filters.period) params.append('period', filters.period);
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
    
    return this.apiCall(`/expense-breakdown?${params.toString()}`);
  }

  async getRecentTransactions(limit = 20, propertyId = null) {
    const params = new URLSearchParams();
    params.append('limit', limit);
    if (propertyId) params.append('propertyId', propertyId);
    
    return this.apiCall(`/recent-transactions?${params.toString()}`);
  }

  // ==========================================
  // Analytics Methods
  // ==========================================
  
  async getAnalytics(options = {}) {
    // Handle both formats
    let filters;
    
    if (typeof options === 'string') {
      filters = { period: options, propertyId: arguments[1] || null };
    } else {
      filters = {
        period: options.period || 'month',
        month: options.month || null,
        year: options.year || null,
        propertyId: options.propertyId || null
      };
    }

    const params = new URLSearchParams();
    if (filters.period) params.append('period', filters.period);
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
    
    return this.apiCall(`/analytics?${params.toString()}`);
  }

  async getPaymentTrends(months = 6, propertyId = null) {
    const params = new URLSearchParams();
    params.append('months', months);
    if (propertyId) params.append('propertyId', propertyId);
    
    return this.apiCall(`/payment-trends?${params.toString()}`);
  }

  async getPropertyPerformance(options = {}) {
    let filters;
    
    if (typeof options === 'string') {
      filters = { period: options, propertyId: arguments[1] || null };
    } else {
      filters = {
        period: options.period || 'month',
        month: options.month || null,
        year: options.year || null,
        propertyId: options.propertyId || null
      };
    }

    const params = new URLSearchParams();
    if (filters.period) params.append('period', filters.period);
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
    
    return this.apiCall(`/property-performance?${params.toString()}`);
  }

  // ==========================================
  // Report Generation
  // ==========================================
  
  async generateReport(reportSettings) {
    return this.apiCall('/generate-report', {
      method: 'POST',
      body: JSON.stringify(reportSettings)
    });
  }

  // ==========================================
  // Export Methods
  // ==========================================
  
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

  // ==========================================
  // Expense Management Methods
  // ==========================================
  
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

  // ==========================================
  // Properties API
  // ==========================================
  
  async getProperties() {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response structures
      if (data.data && Array.isArray(data.data.properties)) {
        return { properties: data.data.properties };
      } else if (data.data && Array.isArray(data.data)) {
        return { properties: data.data };
      } else if (Array.isArray(data.properties)) {
        return { properties: data.properties };
      } else if (Array.isArray(data)) {
        return { properties: data };
      } else {
        console.warn('Unexpected properties response structure:', data);
        return { properties: [] };
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      return { properties: [] };
    }
  }

  // ==========================================
  // Utility Methods
  // ==========================================
  
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

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  formatPercentage(value) {
    return `${(value || 0).toFixed(1)}%`;
  }

  // ==========================================
  // HELPER: Get Month Names for Dropdown
  // ==========================================
  
  getMonthOptions() {
    return [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' }
    ];
  }

  getCurrentMonth() {
    return new Date().getMonth() + 1; // Returns 1-12
  }

  getCurrentYear() {
    return new Date().getFullYear();
  }
}

// Create and export a singleton instance
export const apiService = new FinancialApiService();
export default apiService;