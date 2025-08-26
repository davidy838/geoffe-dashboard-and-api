// API Configuration
export const API_CONFIG = {
  // Development - local backend
  development: 'http://localhost:8000',
  
  // Production - Render backend (update this with your actual Render URL)
  production: 'https://your-service-name.onrender.com',
  
  // Get current environment
  getBaseUrl: () => {
    if (import.meta.env.DEV) {
      return API_CONFIG.development
    }
    return API_CONFIG.production
  },
  
  // API endpoints
  endpoints: {
    calculateDistancesAndCosts: '/api/calculate-distances-and-merge-costs'
  }
}

// Full API URL for the main endpoint
export const API_URL = `${API_CONFIG.getBaseUrl()}${API_CONFIG.endpoints.calculateDistancesAndCosts}` 