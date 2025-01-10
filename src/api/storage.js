import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";

const setToken = async (token) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (error) {
    console.error("Error saving token:", error);
  }
};

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

const deleteToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.error("Error deleting token:", error);
  }
};

const checkToken = async () => {
  try {
    const token = await getToken();
    if (token) {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        await deleteToken();
        return false;
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking token:", error);
    return false;
  }
};

const clearUserData = async () => {
  try {
    console.log("Clearing user data from storage");
    await AsyncStorage.multiRemove(["token", "user", "userProfileImage"]);
    console.log("Successfully cleared user data from storage");
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
};

const setProfileImage = async (imageUrl) => {
  try {
    console.log("Saving profile image to storage:", imageUrl);
    await AsyncStorage.setItem("userProfileImage", imageUrl);
    console.log("Successfully saved profile image to storage");
  } catch (error) {
    console.error("Error saving profile image:", error);
  }
};

const getProfileImage = async () => {
  try {
    console.log("Getting profile image from storage");
    const imageUrl = await AsyncStorage.getItem("userProfileImage");
    console.log("Retrieved profile image from storage:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error retrieving profile image:", error);
    return null;
  }
};

export {
  deleteToken,
  getToken,
  setToken,
  checkToken,
  clearUserData,
  setProfileImage,
  getProfileImage,
};
