import instance from "./index";
import axios from "axios";

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

const deleteLovedOne = async (lovedOneId, token) => {
  try {
    const response = await axios.delete(
      `https://seal-app-doaaw.ondigitalocean.app/api/caregivers/loved-one/${lovedOneId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting loved one:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// upload profile image
const uploadProfileImage = async (imageUri, token) => {
  try {
    // Create form data
    const formData = new FormData();
    const filename = imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image";

    formData.append("image", {
      uri: imageUri,
      name: filename,
      type: type,
    });

    const response = await axios.post(
      "https://seal-app-doaaw.ondigitalocean.app/api/caregivers/upload-profile-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error uploading profile image:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export { getAllLovedOnes, addLovedOne, deleteLovedOne, uploadProfileImage };
