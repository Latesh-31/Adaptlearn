import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const apiError = err?.response?.data?.error;
    if (apiError) {
      err.message = apiError.message;
      err.code = apiError.code;
    }
    return Promise.reject(err);
  }
);
