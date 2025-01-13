import { baseURL } from "./index";
import axios from "axios";

// Get all care plans for a loved one
export const getCarePlans = async (lovedOneId) => {
  try {
    const response = await axios.get(`${baseURL}/care-plans/${lovedOneId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new care plan
export const createCarePlan = async (carePlanData) => {
  try {
    const response = await axios.post(`${baseURL}/care-plans`, carePlanData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update a care plan
export const updateCarePlan = async (carePlanId, updateData) => {
  try {
    const response = await axios.put(`${baseURL}/care-plans/${carePlanId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a care plan
export const deleteCarePlan = async (carePlanId) => {
  try {
    const response = await axios.delete(`${baseURL}/care-plans/${carePlanId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 