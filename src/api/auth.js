import AsyncStorage from "@react-native-async-storage/async-storage";

// register function
const register = async (name, email, password, phone_number) => {
  try {
    console.log("Sending request to register:", { name, email, phone_number }); // Debug log

    const response = await fetch(
      "https://seal-app-doaaw.ondigitalocean.app/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone_number }),
      }
    );

    console.log("Raw response:", response); // Log raw response

    // Handle HTTP errors explicitly
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server Error Response:", errorData); // Log server error
      throw new Error(errorData.message || "Failed to register.");
    }

    const data = await response.json();
    console.log("Parsed response data:", data); // Log parsed data

    // Save token to AsyncStorage
    if (data.token) {
      await AsyncStorage.setItem("token", data.token);
      console.log("Token saved successfully!");
    }

    return data; // Return data for further processing
  } catch (error) {
    console.error("Registration Error:", error); // Log the error
    Alert.alert(
      "Error",
      error.message || "An error occurred during registration."
    );
    throw error; // Rethrow to handle elsewhere
  }
};

// const register = async (name, email, password, phone_number) => {
//   try {
//     const response = await fetch("http://192.168.2.96:5000/api/auth/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name, email, password, phone_number }),
//     });
//     const data = await response.json();
//     if (data.token) {
//       await AsyncStorage.setItem("token", data.token);
//     }
//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

// login function

const login = async (email, password) => {
  try {
    const response = await fetch(
      "https://seal-app-doaaw.ondigitalocean.app/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    const data = await response.json();
    if (data.token) {
      await AsyncStorage.setItem("token", data.token);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export { register, login };
