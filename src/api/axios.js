import axios from "axios";

export const axiosInstance = axios.create({
  // baseURL: process.env.REACT_APP_API_URL,
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  // Only add auth token if it exists (for production)
  if (config.headers && process.env.REACT_APP_API_KEY) {
    config.headers["Authorization"] = `Bearer ${process.env.REACT_APP_API_KEY}`;
  }
  return config;
});
