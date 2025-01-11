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

const deleteTask = async (taskId) => {
  try {
    console.log("Deleting task with ID:", taskId);
    const response = await instance.delete(`/api/tasks/${taskId}`);

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

const createNote = async (lovedOneId, noteData) => {
  try {
    console.log("Creating note for loved one ID:", lovedOneId);
    const response = await instance.post(
      `/api/daily-notes/loved-one/${lovedOneId}`,
      noteData
    );
    console.log("Note creation response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating note:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const getNote = async (lovedOneId) => {
  try {
    console.log("Fetching notes for loved one ID:", lovedOneId);
    const response = await instance.get(
      `/api/daily-notes/loved-one/${lovedOneId}`
    );

    console.log("Raw notes response:", response);

    if (!response || !Array.isArray(response)) {
      console.error("Invalid notes response:", response);
      throw new Error("Invalid notes response from server");
    }

    // Sort notes by date in descending order
    const sortedNotes = response.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return sortedNotes;
  } catch (error) {
    console.error("Error fetching notes:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
      lovedOneId,
    });
    throw error;
  }
};

const deleteNote = async (lovedOneId, noteId) => {
  try {
    console.log("Deleting note:", { lovedOneId, noteId });
    const response = await instance.delete(
      `/api/daily-notes/loved-one/${lovedOneId}/note/${noteId}`
    );
    console.log("Delete note response:", response);
    return response;
  } catch (error) {
    console.error("Error deleting note:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export { createTask, getTask, deleteTask, createNote, getNote, deleteNote };
