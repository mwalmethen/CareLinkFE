import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  BackHandler,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { register } from "../api/auth";
import { useUser } from "../api/UserContext"; // Import UserContext
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveUser } = useUser(); // Access UserContext to save user data

  const [verificationModalVisible, setVerificationModalVisible] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const inputsSlideAnim = new Animated.Value(100);

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(inputsSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleVerification = async () => {
    if (!verificationCode) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    try {
      setVerificationLoading(true);
      console.log("Sending verification request:", {
        email: registeredEmail,
        code: verificationCode,
      });

      const response = await axios.post(
        "https://seal-app-doaaw.ondigitalocean.app/api/auth/verify-registration",
        {
          email: registeredEmail,
          code: verificationCode,
        }
      );

      console.log("Verification response:", response.data);

      if (response.data) {
        Alert.alert("Success", "Email verified successfully!", [
          {
            text: "OK",
            onPress: () => {
              setVerificationModalVisible(false);
              navigation.navigate("Login");
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
      }
    } catch (error) {
      console.log("Verification error:", error.response?.data || error.message);

      let errorMessage = "Failed to verify email. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      Alert.alert("Verification Failed", errorMessage);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPhoneNumber = phoneNumber.trim();

    // Debug logs
    console.log("Name:", trimmedName);
    console.log("Email:", trimmedEmail);
    console.log("Password:", trimmedPassword);
    console.log("Phone Number:", trimmedPhoneNumber);

    // Validation
    if (!trimmedName) {
      alert("Full Name is required.");
      return;
    }
    if (!trimmedEmail) {
      alert("Email Address is required.");
      return;
    }
    if (!trimmedPassword) {
      alert("Password is required.");
      return;
    }
    if (!trimmedPhoneNumber) {
      alert("Phone Number is required.");
      return;
    }

    // Email and phone validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex
    const phoneRegex = /^[0-9]{8,15}$/; // Digits only, 8-15 characters

    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!phoneRegex.test(trimmedPhoneNumber)) {
      alert("Please enter a valid phone number.");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending registration request with:", {
        name: trimmedName,
        email: trimmedEmail,
        phone_number: trimmedPhoneNumber,
      });

      const response = await axios.post(
        "https://seal-app-doaaw.ondigitalocean.app/api/auth/register",
        {
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
          phone_number: trimmedPhoneNumber,
        }
      );

      console.log("Registration response:", response.data);

      if (response.data) {
        setRegisteredEmail(trimmedEmail);
        setVerificationModalVisible(true);
      }
    } catch (error) {
      console.log("Registration error:", error.response?.data || error.message);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#f0f8ff", "#e6f3ff"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View
              style={[
                styles.headerContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Image
                source={require("../../assets/CareLink.webp")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitle}>
                Please fill in the form to continue
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: inputsSlideAnim }],
                },
              ]}
            >
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#4A90E2"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={name}
                    placeholderTextColor="#666"
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#4A90E2"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    value={email}
                    placeholderTextColor="#666"
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#4A90E2"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    placeholderTextColor="#666"
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#4A90E2"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={phoneNumber}
                    placeholderTextColor="#666"
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#4A90E2", "#357ABD"]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="person-add" size={24} color="white" />
                      <Text style={styles.buttonText}>Create Account</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.loginText}>
                  Already have an account?{" "}
                  <Text style={styles.loginTextBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={verificationModalVisible}
          onRequestClose={() => setVerificationModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Verify Your Email</Text>
              <Text style={styles.modalSubtitle}>
                Please enter the verification code sent to your email
              </Text>

              <View style={styles.verificationInputWrapper}>
                <TextInput
                  style={styles.verificationInput}
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor="#666"
                />
              </View>

              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerification}
                disabled={verificationLoading}
              >
                <LinearGradient
                  colors={["#4A90E2", "#357ABD"]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {verificationLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Verify</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    maxWidth: 180,
    maxHeight: 180,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  registerButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  loginLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  loginText: {
    fontSize: 16,
    color: "#666",
  },
  loginTextBold: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  verificationInputWrapper: {
    width: "100%",
    marginBottom: 24,
  },
  verificationInput: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    padding: 16,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  verifyButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default RegisterScreen;
