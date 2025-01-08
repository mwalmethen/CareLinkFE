import instance from "./index";

// get all loved ones
const getAllLovedOnes = async () => {
  try {
    const response = await instance.get(
      "/api/caregivers/loved-ones" // Correct endpoint
    );
    console.log("Loved Ones Response:", response); // Debugging log
    return response; // Return response
  } catch (error) {
    console.error(
      "Get Loved Ones Error:",
      error.response?.data || error.message
    );
    throw error; // Ensure errors are thrown for React Query to handle
  }
};

// add loved one
const addLovedOne = async (lovedOne, token) => {
  const response = await instance.post(
    "https://seal-app-doaaw.ondigitalocean.app/api/caregivers/add-loved-one",
    lovedOne,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the token
      },
    }
  );
  return response;
};

export { getAllLovedOnes, addLovedOne };
