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

export { deleteToken, getToken, setToken, checkToken };
