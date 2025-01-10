import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const DetailItem = ({ icon, label, value, color = "#4A90E2" }) => (
  <View style={styles.detailItem}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const ActionButton = ({ icon, text, onPress, colors, style }) => (
  <Pressable
    style={({ pressed }) => [
      styles.actionButton,
      style,
      pressed && styles.pressed,
    ]}
    onPress={onPress}
  >
    <LinearGradient
      colors={colors}
      style={styles.actionGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Ionicons name={icon} size={24} color="white" />
      <Text style={styles.actionButtonText}>{text}</Text>
    </LinearGradient>
  </Pressable>
);

const LovedOneDetailsScreen = ({ route, navigation }) => {
  const { lovedOne } = route.params;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCreateCaregiver = () => {
    navigation.navigate("CreateCaregiver", { lovedOneId: lovedOne._id });
  };

  const handleEditLovedOne = () => {
    navigation.navigate("EditLovedOne", { lovedOne });
  };

  const handleViewTasks = () => {
    navigation.navigate("DailyTasks", { lovedOneId: lovedOne._id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Loved One Details</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {lovedOne.profileImage ? (
                <Image
                  source={{ uri: lovedOne.profileImage }}
                  style={styles.profileImage}
                  onError={(error) => {
                    console.error(
                      "Image loading error:",
                      error.nativeEvent.error
                    );
                  }}
                />
              ) : (
                <LinearGradient
                  colors={["#4A90E2", "#357ABD"]}
                  style={styles.profileIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.profileIcon}>
                    <Ionicons name="person" size={40} color="white" />
                  </View>
                </LinearGradient>
              )}
            </View>
            <Text style={styles.name}>{lovedOne.name}</Text>
          </View>

          <View style={styles.detailsSection}>
            <DetailItem
              icon="calendar-outline"
              label="Age"
              value={lovedOne.age}
            />
            <DetailItem
              icon="medical-outline"
              label="Medical History"
              value={lovedOne.medical_history}
              color="#EA4335"
            />
            <DetailItem
              icon="time-outline"
              label="Member Since"
              value={new Date().toLocaleDateString()}
              color="#34A853"
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Caregivers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <ActionButton
              icon="add-circle-outline"
              text="Add Caregiver"
              onPress={handleCreateCaregiver}
              colors={["#4A90E2", "#357ABD"]}
              style={styles.mainAction}
            />
            <View style={styles.secondaryActions}>
              <ActionButton
                icon="create-outline"
                text="Edit Details"
                onPress={handleEditLovedOne}
                colors={["#34A853", "#2E8B4A"]}
                style={styles.secondaryAction}
              />
              <ActionButton
                icon="list-outline"
                text="View Tasks"
                onPress={handleViewTasks}
                colors={["#FBBC05", "#F5A623"]}
                style={styles.secondaryAction}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  profileIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E1E1E1",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A90E2",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  actionsContainer: {
    gap: 12,
  },
  mainAction: {
    marginBottom: 12,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default LovedOneDetailsScreen;
