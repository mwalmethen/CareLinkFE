import AsyncStorage from "@react-native-async-storage/async-storage";

export const getInvitations = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      "https://seal-app-doaaw.ondigitalocean.app/api/caregivers/invitations",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    console.log("Invitations response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch invitations");
    }

    return data;
  } catch (error) {
    console.error("Error fetching invitations:", error);
    throw error;
  }
};

export const acceptInvitation = async (invitationId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `https://seal-app-doaaw.ondigitalocean.app/api/caregivers/invitations/${invitationId}/accept`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to accept invitation");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
};
