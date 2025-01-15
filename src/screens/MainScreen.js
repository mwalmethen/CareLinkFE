import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const QuickActionButton = ({ icon, title, subtitle, onPress, colors }) => (
  <TouchableOpacity
    style={styles.quickActionButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={colors}
      style={styles.quickActionGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name={icon} size={32} color="white" />
      <View style={styles.quickActionText}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const StatisticCard = ({ icon, title, value, colors }) => (
  <View style={styles.statisticCard}>
    <LinearGradient
      colors={colors}
      style={styles.statisticGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name={icon} size={24} color="white" />
      <Text style={styles.statisticValue}>{value}</Text>
      <Text style={styles.statisticTitle}>{title}</Text>
    </LinearGradient>
  </View>
);

const MainScreen = ({ navigation }) => {
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.3);

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Fade in and scale up logo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Slide up content
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#ffffff", "#f0f8ff", "#e6f3ff"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
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
                styles.titleContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.appName}>CareLink</Text>
              <Text style={styles.subtitle}>
                Connecting Hearts, Supporting Care
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.statisticsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.statisticsRow}>
                <StatisticCard
                  icon="people-outline"
                  title="Caregivers"
                  value="24+"
                  colors={["#4A90E2", "#357ABD"]}
                />
                <StatisticCard
                  icon="heart-outline"
                  title="Loved Ones"
                  value="100+"
                  colors={["#34A853", "#2E8B4A"]}
                />
              </View>
              <View style={styles.statisticsRow}>
                <StatisticCard
                  icon="calendar-outline"
                  title="Daily Tasks"
                  value="500+"
                  colors={["#FBBC05", "#F5A623"]}
                />
                <StatisticCard
                  icon="medkit-outline"
                  title="Medical Records"
                  value="1000+"
                  colors={["#EA4335", "#D32F2F"]}
                />
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.quickActionsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <QuickActionButton
                icon="person-add-outline"
                title="Sign Up"
                subtitle="Create a new account"
                onPress={() => navigation.navigate("Register")}
                colors={["#4A90E2", "#357ABD"]}
              />
              <QuickActionButton
                icon="log-in-outline"
                title="Sign In"
                subtitle="Access your account"
                onPress={() => navigation.navigate("Login")}
                colors={["#34A853", "#2E8B4A"]}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.footer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.footerText}>
                Join our caring community today
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 24,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#4A90E2",
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: "rgba(74, 144, 226, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
  },
  statisticsContainer: {
    marginBottom: 32,
  },
  statisticsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statisticCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statisticGradient: {
    padding: 16,
    alignItems: "center",
  },
  statisticValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginVertical: 8,
  },
  statisticTitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  quickActionButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  quickActionText: {
    marginLeft: 16,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  footer: {
    alignItems: "center",
    marginBottom: 24,
  },
  footerText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
});

export default MainScreen;
