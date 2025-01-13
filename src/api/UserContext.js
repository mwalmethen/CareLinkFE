import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getProfileImage,
  setProfileImage as saveProfileImageToStorage,
} from "./storage";

// Create Context
const UserContext = createContext();

// Provider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  // Load user and token from AsyncStorage when the app starts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");
        const savedProfileImage = await getProfileImage();

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);

          // If we have a saved profile image, use it
          if (savedProfileImage) {
            console.log("Found saved profile image:", savedProfileImage);
            parsedUser.profileImage = savedProfileImage;
            // Update stored user data with the saved image
            await AsyncStorage.setItem("user", JSON.stringify(parsedUser));
          } else if (parsedUser.profileImage) {
            // If user has a profile image but it's not in storage, format and save it
            const formattedImageUrl = formatImageUrl(parsedUser.profileImage);
            console.log(
              "Formatting and saving profile image:",
              formattedImageUrl
            );
            parsedUser.profileImage = formattedImageUrl;
            await saveProfileImageToStorage(formattedImageUrl);
            await AsyncStorage.setItem("user", JSON.stringify(parsedUser));
          }

          setUser(parsedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };
    loadUserData();
  }, []);

  const formatImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;

    // Remove any leading slashes
    const cleanPath = imageUrl.replace(/^\/+/, "");

    // Ensure we include the uploads directory
    return `https://seal-app-doaaw.ondigitalocean.app/uploads/${cleanPath}`;
  };

  // Save user and token in AsyncStorage
  const saveUser = async (userData, authToken) => {
    try {
      const formattedUser = {
        ...userData,
        profileImage: formatImageUrl(userData.profileImage),
      };

      console.log(
        "Saving user with profile image:",
        formattedUser.profileImage
      );

      // Save profile image first
      if (formattedUser.profileImage) {
        console.log("Saving profile image to storage");
        await saveProfileImageToStorage(formattedUser.profileImage);
      }

      // Then save user data
      console.log("Saving user data to AsyncStorage");
      await AsyncStorage.setItem("user", JSON.stringify(formattedUser));
      await AsyncStorage.setItem("token", authToken);

      // Update state last
      console.log("Updating state");
      setUser(formattedUser);
      setToken(authToken);

      console.log("User data saved successfully");
    } catch (error) {
      console.error("Failed to save user data:", error);
      throw error;
    }
  };

  // Update user data
  const updateUser = async (updatedUserData) => {
    try {
      const formattedUser = {
        ...updatedUserData,
        profileImage: formatImageUrl(updatedUserData.profileImage),
      };

      console.log(
        "Updating user with profile image:",
        formattedUser.profileImage
      );

      // Save profile image first
      if (formattedUser.profileImage) {
        console.log("Saving profile image to storage");
        await saveProfileImageToStorage(formattedUser.profileImage);
      }

      // Then save user data
      console.log("Saving user data to AsyncStorage");
      await AsyncStorage.setItem("user", JSON.stringify(formattedUser));

      // Update state last
      console.log("Updating state");
      setUser(formattedUser);

      console.log("User data updated successfully");
    } catch (error) {
      console.error("Failed to update user data:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log("Logging out, clearing user data and profile image");
      await AsyncStorage.multiRemove(["token", "user", "userProfileImage"]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, token, saveUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook to use UserContext
export const useUser = () => useContext(UserContext);
