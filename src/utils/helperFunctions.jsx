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
  
  export { formatFinancialValue, formatDashboardValue };