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
    "/api/caregivers/add-loved-one",
    lovedOne,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

const deleteLovedOne = async (lovedOneId, token) => {
  try {
    const response = await instance.delete(`/api/loved-ones/${lovedOneId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
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

    console.log("Sending image upload request with formData:", formData);

    const response = await instance.post(
      "/api/caregivers/upload-profile-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Raw upload response:", JSON.stringify(response, null, 2));

    // Handle different response formats
    if (response) {
      let profileImage = null;

      if (response.caregiver && response.caregiver.profileImage) {
        profileImage = response.caregiver.profileImage;
      } else if (response.image) {
        profileImage = response.image;
      } else if (typeof response === "string") {
        profileImage = response;
      } else if (response.profileImage) {
        profileImage = response.profileImage;
      }

      if (profileImage) {
        // Remove any leading slashes
        profileImage = profileImage.replace(/^\/+/, "");

        // Ensure the image URL is absolute
        const imageUrl = profileImage.startsWith("http")
          ? profileImage
          : `https://seal-app-doaaw.ondigitalocean.app/uploads/${profileImage}`;

        console.log("Formatted image URL:", imageUrl);
        return {
          caregiver: {
            profileImage: imageUrl,
          },
        };
      }
    }

    console.error("Unexpected response format:", response);
    throw new Error("Invalid response format from server");
  } catch (error) {
    console.error("Error uploading profile image:", error);
    console.error("Error response data:", error.response?.data);
    throw error;
  }
};

// upload loved one profile image
const uploadLovedOneProfileImage = async (lovedOneId, imageUri, token) => {
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

    const response = await instance.post(
      `/api/loved-ones/${lovedOneId}/upload-profile-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Raw upload response:", response); // Log the entire response
    console.log("Upload response data:", response.data); // Log just the data

    // If the response doesn't include imageUrl, construct it from the response
    if (response.data && !response.data.imageUrl && response.data.image) {
      return { imageUrl: response.data.image };
    }

    return response.data;
  } catch (error) {
    console.error(
      "Error uploading loved one profile image:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export {
  getAllLovedOnes,
  addLovedOne,
  deleteLovedOne,
  uploadProfileImage,
  uploadLovedOneProfileImage,
};
