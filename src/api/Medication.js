import instance from "./index";

const createMedication = async (lovedOneId, newMedication) => {
  try {
    const response = await instance.post(
      `/api/medications/loved-one/${lovedOneId}`,
      newMedication
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

const getMedication = async (lovedOneId) => {
  try {
    console.log("Making API request for loved one ID:", lovedOneId);

    const response = await instance.get(
      `/api/medications/loved-one/${lovedOneId}`
    );

    console.log("Response from API:", response);

    if (!response) {
      throw new Error("No data received from server");
    }

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

const deleteMedication = async (medicationId) => {
  try {
    console.log("Deleting task with ID:", medicationId);
    const response = await instance.delete(`/api/medications/${medicationId}`);

    console.log("Delete response:", response);
    return response;
  } catch (error) {
    console.error("Error deleting task:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export { createMedication, getMedication, deleteMedication };
