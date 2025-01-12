import instance from "./index";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// get all loved ones
const getAllLovedOnes = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      "https://seal-app-doaaw.ondigitalocean.app/api/caregivers/loved-ones",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    console.log("Initial Loved Ones Response:", data);

    // Fetch tasks for each loved one
    const lovedOnesWithTasks = await Promise.all(
      data.map(async (lovedOne) => {
        try {
          console.log(
            `Fetching tasks for loved one: ${lovedOne.name} (${lovedOne._id})`
          );
          const tasksResponse = await fetch(
            `https://seal-app-doaaw.ondigitalocean.app/api/tasks/loved-one/${lovedOne._id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const tasksData = await tasksResponse.json();
          console.log(`Tasks response for ${lovedOne.name}:`, tasksData);
          console.log(
            `Number of tasks for ${lovedOne.name}:`,
            Array.isArray(tasksData) ? tasksData.length : 0
          );

          const lovedOneWithTasks = {
            ...lovedOne,
            tasks: {
              ...tasksData,
              total:
                tasksData.total ||
                (tasksData.completed?.length || 0) +
                  (tasksData.pending?.length || 0),
            },
          };
          console.log(
            `Final loved one object with tasks for ${lovedOne.name}:`,
            lovedOneWithTasks
          );
          return lovedOneWithTasks;
        } catch (error) {
          console.error(
            `Error fetching tasks for loved one ${lovedOne.name} (${lovedOne._id}):`,
            error
          );
          return {
            ...lovedOne,
            tasks: [],
          };
        }
      })
    );

    console.log("Final lovedOnesWithTasks array:", lovedOnesWithTasks);
    return lovedOnesWithTasks;
  } catch (error) {
    console.error(
      "Get Loved Ones Error:",
      error.response?.data || error.message
    );
    throw error;
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

export const getLovedOneCaregivers = async (lovedOneId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `https://seal-app-doaaw.ondigitalocean.app/api/loved-ones/${lovedOneId}/caregivers`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    console.log("Caregivers response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch caregivers");
    }

    return data;
  } catch (error) {
    console.error("Error fetching caregivers:", error);
    throw error;
  }
};

export const inviteCaregiver = async (email, lovedOneId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      "https://seal-app-doaaw.ondigitalocean.app/api/caregivers/assign-role",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          lovedOneId,
        }),
      }
    );

    const data = await response.json();
    console.log("Invite caregiver response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to invite caregiver");
    }

    return data;
  } catch (error) {
    console.error("Error inviting caregiver:", error);
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
