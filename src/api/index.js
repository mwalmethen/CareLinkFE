import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const instance = axios.create({
  baseURL: "https://seal-app-doaaw.ondigitalocean.app",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Handle response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Handle request interceptor
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`Request to ${config.url}:`, config);
    } catch (error) {
      console.error("Failed to fetch token", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add this function to handle emergency alerts
export const createEmergencyAlert = async (lovedOneId, alertData) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `https://seal-app-doaaw.ondigitalocean.app/api/emergency-alerts/loved-one/${lovedOneId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alertData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create emergency alert");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating emergency alert:", error);
    throw error;
  }
};

// Add function to get emergency alerts
export const getEmergencyAlerts = async (lovedOneId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `https://seal-app-doaaw.ondigitalocean.app/api/emergency-alerts/loved-one/${lovedOneId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch emergency alerts");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching emergency alerts:", error);
    throw error;
  }
};

export default instance;

// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// const instance = axios.create({
//   baseURL: "https://seal-app-doaaw.ondigitalocean.app",
// });

// instance.interceptors.response.use((response) => {
//   return response.data;
// });

// instance.interceptors.request.use((config) => {
//   const token = AsyncStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
// export default instance;

// http://172.20.10.12:5000
