import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { login } from "../api/auth";
import { useUser } from "../api/UserContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { saveUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation values using useRef to persist across renders
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const response = await login(email, password);
      if (response.token && response.user) {
        await saveUser(response.user, response.token);
        Alert.alert("Success", "Login successful!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("HomeTabs"),
          },
        ]);
      } else {
        Alert.alert("Error", response.message || "Login failed.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred during login.");
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
          style={styles.content}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.scrollContainer}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Image
                source={require("../../assets/CareLink.webp")}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.welcomeBack}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Please sign in to continue</Text>

              <View style={styles.inputContainer}>
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
                    placeholderTextColor="#666"
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
                    color="#4A90E2"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Password"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#4A90E2"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
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
                      <Ionicons name="log-in-outline" size={24} color="white" />
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerPrompt}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.registerText}>
                  Don't have an account?{" "}
                  <Text style={styles.registerLink}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    maxWidth: 180,
    maxHeight: 180,
  },
  formContainer: {
    justifyContent: "center",
    paddingTop: 20,
  },
  welcomeBack: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(74, 144, 226, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  inputContainer: {
    gap: 20,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E1E1E1",
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
  eyeButton: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    marginBottom: 24,
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
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  registerPrompt: {
    alignItems: "center",
    paddingVertical: 8,
  },
  registerText: {
    fontSize: 16,
    color: "#666",
  },
  registerLink: {
    color: "#4A90E2",
    fontWeight: "600",
  },
});

export default LoginScreen;
