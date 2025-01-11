import instance from "./index";

const createTask = async (lovedOneId, taskData) => {
  try {
    const response = await instance.post(
      `/api/tasks/loved-one/${lovedOneId}`,
      taskData
    );
    return response;
  } catch (error) {
    console.error(
      "Error creating task:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const getTask = async (lovedOneId) => {
  try {
    console.log("Making API request for loved one ID:", lovedOneId);

    // Make the request using the baseURL from the instance
    const response = await instance.get(`/api/tasks/loved-one/${lovedOneId}`);

    console.log("Response from API:", response);

    // The response is already the data due to the interceptor
    if (!response) {
      throw new Error("No data received from server");
    }

    // Validate the response structure
    if (!response.pending || !Array.isArray(response.pending)) {
      console.error("Unexpected response structure:", response);
      throw new Error("Invalid response structure from server");
    }

    return response;
  } catch (error) {
    console.error("Error fetching tasks:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export { createTask, getTask };
