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
  AsyncStorage,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { register } from "../api/auth";
import { useUser } from "../api/UserContext";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
}) => (
  <View style={styles.inputWrapper}>
    <LinearGradient
      colors={["#4A90E2", "#357ABD"]}
      style={styles.iconContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name={icon} size={20} color="white" />
    </LinearGradient>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      placeholderTextColor="#666"
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </View>
);

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveUser } = useUser();

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
      const response = await axios.post(
        "https://seal-app-doaaw.ondigitalocean.app/api/auth/verify-registration",
        {
          email: registeredEmail,
          code: verificationCode,
        }
      );

      if (response.data) {
        if (response.data.token) {
          await AsyncStorage.setItem("token", response.data.token);
        }
        if (response.data.user) {
          await AsyncStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
          saveUser(response.data.user);
        }

        Alert.alert("Success", "Email verified successfully!", [
          {
            text: "OK",
            onPress: () => {
              setVerificationModalVisible(false);
              navigation.navigate("DailyTasks");
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
      }
    } catch (error) {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{8,15}$/;

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
      const response = await axios.post(
        "https://seal-app-doaaw.ondigitalocean.app/api/auth/register",
        {
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
          phone_number: trimmedPhoneNumber,
        }
      );

      if (response.data) {
        setRegisteredEmail(trimmedEmail);
        setVerificationModalVisible(true);
      }
    } catch (error) {
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
          <LinearGradient
            colors={["#4A90E2", "#357ABD"]}
            style={styles.backButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </LinearGradient>
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
                Join our community of caregivers today
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
                <InputField
                  icon="person-outline"
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                />
                <InputField
                  icon="mail-outline"
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <InputField
                  icon="lock-closed-outline"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <InputField
                  icon="call-outline"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
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
                onPress={() => navigation.navigate("DailyTasks")}
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
    margin: 16,
    alignSelf: "flex-start",
    borderRadius: 20,
    overflow: "hidden",
  },
  backButtonGradient: {
    padding: 8,
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
    width: width * 0.35,
    height: width * 0.35,
    maxWidth: 150,
    maxHeight: 150,
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
    overflow: "hidden",
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
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
