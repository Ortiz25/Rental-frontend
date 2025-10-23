/**
 * Format financial figures to fit in dashboard cards
 * @param {string|number} value - The financial value to format
 * @returns {string} - Formatted value that fits in the card
 */
const formatFinancialValue = (value) => {
    // Handle non-financial values (numbers without currency)
    if (typeof value === 'number') {
      return value.toString();
    }
  
    // Handle string values
    if (typeof value === 'string') {
      // Check if it's a financial value (contains currency)
      const currencyMatch = value.match(/(KES|USD|EUR|GBP|₹|$|€|£)\s*([\d,]+(?:\.\d{2})?)/i);
      
      if (!currencyMatch) {
        // Not a financial value, return as is
        return value;
      }
  
      const currency = currencyMatch[1].toUpperCase();
      const numericValue = parseFloat(currencyMatch[2].replace(/,/g, ''));
  
      // Format based on value size
      if (numericValue >= 1000000000) {
        // Billions
        return `${currency} ${(numericValue / 1000000000).toFixed(1)}B`;
      } else if (numericValue >= 1000000) {
        // Millions
        return `${currency} ${(numericValue / 1000000).toFixed(1)}M`;
      } else if (numericValue >= 100000) {
        // Hundreds of thousands - show in K with 1 decimal if needed
        const kValue = numericValue / 1000;
        return `${currency} ${kValue % 1 === 0 ? kValue.toFixed(0) : kValue.toFixed(1)}K`;
      } else if (numericValue >= 10000) {
        // Ten thousands - show in K without decimal
        return `${currency} ${Math.round(numericValue / 1000)}K`;
      } else if (numericValue >= 1000) {
        // Thousands - show with comma or K based on preference
        return `${currency} ${numericValue.toLocaleString()}`;
      } else {
        // Less than 1000 - show as is
        return `${currency} ${numericValue.toLocaleString()}`;
      }
    }
  
    // Fallback - return original value
    return value;
  };
  
  /**
   * Enhanced formatting with additional options
   * @param {string|number} value - The value to format
   * @param {object} options - Formatting options
   * @returns {string} - Formatted value
   */
  const formatDashboardValue = (value, options = {}) => {
    const {
      maxLength = 8, // Maximum character length for the display
      forceShort = false, // Force abbreviated format even for smaller numbers
      decimalPlaces = 1 // Number of decimal places for abbreviated numbers
    } = options;
  
    // Handle non-financial values
    if (typeof value === 'number') {
      if (forceShort && value >= 1000) {
        if (value >= 1000000000) {
          return `${(value / 1000000000).toFixed(decimalPlaces)}B`;
        } else if (value >= 1000000) {
          return `${(value / 1000000).toFixed(decimalPlaces)}M`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(decimalPlaces)}K`;
        }
      }
      return value.toString();
    }
  
    if (typeof value === 'string') {
      const currencyMatch = value.match(/(KES|USD|EUR|GBP|₹|$|€|£)\s*([\d,]+(?:\.\d{2})?)/i);
      
      if (!currencyMatch) {
        // Not a financial value - check if it's too long
        return value.length > maxLength ? value.substring(0, maxLength - 3) + '...' : value;
      }
  
      const currency = currencyMatch[1].toUpperCase();
      const numericValue = parseFloat(currencyMatch[2].replace(/,/g, ''));
  
      // Create formatted string and check length
      let formatted = formatFinancialValue(value);
      
      // If still too long, make more aggressive abbreviations
      if (formatted.length > maxLength) {
        if (numericValue >= 1000000000) {
          formatted = `${(numericValue / 1000000000).toFixed(0)}B`;
        } else if (numericValue >= 1000000) {
          formatted = `${(numericValue / 1000000).toFixed(0)}M`;
        } else if (numericValue >= 1000) {
          formatted = `${(numericValue / 1000).toFixed(0)}K`;
        }
        
        // Add currency back if space allows
        if ((currency + ' ' + formatted).length <= maxLength) {
          formatted = currency + ' ' + formatted;
        }
      }
      
      return formatted;
    }
  
    return value;
  };
  
  // Usage examples for your backend data:
  const exampleUsage = () => {
    // Your backend financial data
    const financialStats = [
      { label: "Collected Revenue", value: "KES 1,030,000" },
      { label: "Expected Revenue", value: "KES 1,131,000" },
      { label: "Outstanding Rent", value: "KES 1,345,000" },
      { label: "Maintenance Costs", value: "KES 1,500" }
    ];
  
    console.log("=== Basic Formatting ===");
    financialStats.forEach(stat => {
      console.log(`${stat.label}: ${stat.value} → ${formatFinancialValue(stat.value)}`);
    });
  
    console.log("\n=== Enhanced Formatting (max 6 chars) ===");
    financialStats.forEach(stat => {
      console.log(`${stat.label}: ${stat.value} → ${formatDashboardValue(stat.value, { maxLength: 6 })}`);
    });
  
    // Expected output:
    // Collected Revenue: KES 1,030,000 → KES 1.0M
    // Expected Revenue: KES 1,131,000 → KES 1.1M  
    // Outstanding Rent: KES 1,345,000 → KES 1.3M
    // Maintenance Costs: KES 1,500 → KES 1,500
  };
  
  // Integration example for your dashboard component:
//   const integrateToDashboard = (dashboardData) => {
//     return {
//       ...dashboardData,
//       moduleSummaries: dashboardData.moduleSummaries.map(module => ({
//         ...module,
//         stats: module.stats.map(stat => ({
//           ...stat,
//           value: formatFinancialValue(stat.value),
//           // Store original value if needed for tooltips
//           originalValue: stat.value
//         }))
//       }))
//     };
//   };


  /**
 * Format a date to a readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "N/A";
  
  const d = new Date(date);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

/**
 * Format a date and time to a readable string
 * @param {string|Date} datetime - DateTime to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return "N/A";
  
  const d = new Date(datetime);
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  
  return `${d.toLocaleDateString('en-US', dateOptions)} at ${d.toLocaleTimeString('en-US', timeOptions)}`;
};

/**
 * Format currency to Kenyan Shillings
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "0";
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/**
 * Get relative time string (e.g., "2 days ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return "N/A";
  
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return "just now";
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Get status badge color class
 * @param {string} status - Status value
 * @returns {string} Tailwind CSS classes for badge
 */
export const getStatusBadgeClass = (status) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    contacted: "bg-blue-100 text-blue-800 border-blue-200",
    scheduled: "bg-purple-100 text-purple-800 border-purple-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    vacant: "bg-blue-100 text-blue-800 border-blue-200",
    occupied: "bg-green-100 text-green-800 border-green-200",
  };
  
  return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (Kenya)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const isValidPhone = (phone) => {
  // Accepts formats like: +254700000000, 0700000000, 254700000000
  const phoneRegex = /^(\+?254|0)?[17]\d{8}$/;
  return phoneRegex.test(phone?.replace(/\s/g, ''));
};

/**
 * Format phone number to standard format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Convert to international format
  if (cleaned.startsWith('0')) {
    cleaned = '+254' + cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+254' + cleaned;
  }
  
  return cleaned;
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Download data as CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header];
        // Handle cells with commas, quotes, or newlines
        if (cell === null || cell === undefined) return '';
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  export { formatFinancialValue, formatDashboardValue };



