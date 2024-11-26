import axios from "axios";

interface ServerRequestData {
  ip_address?: string;
  port?: number;
  // Add other filter parameters as needed
}

// Create axios instance with interceptors
const axiosInstance = axios.create();

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth headers or other configurations here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const serverService = {
  // Get current server data
  getCurrentData: async (serverData: ServerRequestData) => {
    try {
      const response = await axiosInstance.get(
        `http://${serverData.ip_address}:${
          serverData.port || 5000
        }/current_data`
      );
      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error("Error in getCurrentData:", error);
      throw error;
    }
  },

  // Get historical data
  getHistoricalData: async (serverData: ServerRequestData) => {
    try {
      const response = await axiosInstance.post(
        `http://${serverData.ip_address}:${
          serverData.port || 5000
        }/historical-data`,
        serverData
      );
      return response.data;
    } catch (error) {
      console.error("Error in getHistoricalData:", error);
      throw error;
    }
  },

  // Test server connection
  testConnection: async (serverData: ServerRequestData) => {
    try {
      const response = await axiosInstance.post(
        `http://${serverData.ip_address}:${
          serverData.port || 5000
        }/test-connection`,
        serverData
      );
      return response.data;
    } catch (error) {
      console.error("Error in testConnection:", error);
      throw error;
    }
  },
};
