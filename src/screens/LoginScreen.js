import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { login } from "../api/auth"; // Ensure the import path is correct

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const response = await login(email, password);
      if (response.token) {
        Alert.alert("Success", "Login successful!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("HomeTabs"),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "Login failed. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred during login. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <Image
          source={require("../../assets/CareLink.webp")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.formContainer}>
          <Text style={styles.welcomeBack}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Please sign in to continue</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  backButton: {
    padding: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 32,
  },
  formContainer: {
    flex: 1,
    paddingTop: 20,
  },
  welcomeBack: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  inputContainer: {
    gap: 20,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E1E1E1",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  registerPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#666",
    fontSize: 16,
  },
  registerLink: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LoginScreen;

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   BackHandler,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   return (
//     <SafeAreaView style={styles.container}>
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => navigation.goBack()}
//       >
//         <Ionicons name="arrow-back" size={24} color="#000" />
//       </TouchableOpacity>

//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.content}
//       >
//         <Image
//           source={require("../../assets/CareLink.webp")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={styles.formContainer}>
//           <Text style={styles.welcomeBack}>Welcome Back!</Text>
//           <Text style={styles.subtitle}>Please sign in to continue</Text>

//           <View style={styles.inputContainer}>
//             <View style={styles.inputWrapper}>
//               <Ionicons
//                 name="mail-outline"
//                 size={20}
//                 color="#666"
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Email Address"
//                 value={email}
//                 onChangeText={setEmail}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 autoComplete="email"
//               />
//             </View>

//             <View style={styles.inputWrapper}>
//               <Ionicons
//                 name="lock-closed-outline"
//                 size={20}
//                 color="#666"
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={[styles.input, { flex: 1 }]}
//                 placeholder="Password"
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry={!showPassword}
//               />
//               <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                 <Ionicons
//                   name={showPassword ? "eye-off-outline" : "eye-outline"}
//                   size={20}
//                   color="#666"
//                 />
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity style={styles.forgotPassword}>
//               <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={styles.loginButton}
//             onPress={() => navigation.navigate("HomeTabs")}
//           >
//             <Text style={styles.loginButtonText}>Sign In</Text>
//           </TouchableOpacity>

//           <View style={styles.registerPrompt}>
//             <Text style={styles.registerText}>Don't have an account? </Text>
//             <TouchableOpacity onPress={() => navigation.navigate("Register")}>
//               <Text style={styles.registerLink}>Sign Up</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   backButton: {
//     padding: 16,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 24,
//   },
//   logo: {
//     width: 120,
//     height: 120,
//     alignSelf: "center",
//     marginBottom: 32,
//   },
//   formContainer: {
//     flex: 1,
//     paddingTop: 20,
//   },
//   welcomeBack: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#333",
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#666",
//     marginBottom: 32,
//   },
//   inputContainer: {
//     gap: 20,
//     marginBottom: 32,
//   },
//   inputWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F5F6FA",
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#E1E1E1",
//   },
//   inputIcon: {
//     marginRight: 12,
//   },
//   input: {
//     flex: 1,
//     paddingVertical: 16,
//     fontSize: 16,
//     color: "#333",
//   },
//   forgotPassword: {
//     alignSelf: "flex-end",
//   },
//   forgotPasswordText: {
//     color: "#4A90E2",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   loginButton: {
//     backgroundColor: "#4A90E2",
//     paddingVertical: 16,
//     borderRadius: 12,
//     shadowColor: "#4A90E2",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   loginButtonText: {
//     color: "white",
//     textAlign: "center",
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   registerPrompt: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 24,
//   },
//   registerText: {
//     color: "#666",
//     fontSize: 16,
//   },
//   registerLink: {
//     color: "#4A90E2",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

// export default LoginScreen;
