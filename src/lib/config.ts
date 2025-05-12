
// Configure the API base URL to your server address
export const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' // Development server
  : ''; // Production server (empty string means same origin)
