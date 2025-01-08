import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };
    loadUserData();
  }, []);

  // Save user and token in AsyncStorage
  const saveUser = async (userData, authToken) => {
    try {
      setUser(userData);
      setToken(authToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("token", authToken);
    } catch (error) {
      console.error("Failed to save user data", error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, token, saveUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook to use UserContext
export const useUser = () => useContext(UserContext);
