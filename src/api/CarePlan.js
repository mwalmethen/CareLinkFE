import instance from "./index";

// Get all care plans for a loved one
export const getCarePlans = async (lovedOneId) => {
  try {
    const response = await instance.get(
      `/api/care-plans/loved-one/${lovedOneId}`
    );
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new care plan
export const createCarePlan = async (carePlanData) => {
  try {
    const response = await instance.post(
      `/api/care-plans/loved-one/${carePlanData.loved_one}`,
      carePlanData
    );
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update a care plan
export const updateCarePlan = async (carePlanId, updateData) => {
  try {
    const response = await instance.put(
      `/api/care-plans/loved-one/${updateData.loved_one}/${carePlanId}`,
      updateData
    );
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a care plan
export const deleteCarePlan = async (carePlanId, lovedOneId) => {
  try {
    const response = await instance.delete(
      `/api/care-plans/loved-one/${lovedOneId}/${carePlanId}`
    );
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
