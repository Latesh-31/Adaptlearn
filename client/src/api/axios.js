import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy will handle this
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract standardized error message if available
    const message = error.response?.data?.error?.message || error.message || 'An unexpected error occurred';
    // Attach it to the error object for easier access
    error.formattedMessage = message;
    return Promise.reject(error);
  }
);

export default api;
