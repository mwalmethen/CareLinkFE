import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getAllLovedOnes, getLovedOneCaregivers } from "../api/Users";
import { useUser } from "../api/UserContext";

const RoleCard = ({ lovedOne, onPress }) => {
  const [role, setRole] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const caregivers = await getLovedOneCaregivers(lovedOne._id);
        console.log("Caregivers:", caregivers);
        console.log("Current user:", user?.email);

        // Find the current user's caregiver object by email
        const currentUserCaregiver = caregivers.find(
          (caregiver) => caregiver.user?.email === user?.email
        );
        console.log("Current user caregiver:", currentUserCaregiver);

        // Check if current user is the first caregiver in the array
        const isPrimary = caregivers[0]?.user?.email === user?.email;
        console.log("Is Primary:", isPrimary);

        setRole(isPrimary ? 0 : 1);
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };
    fetchRole();
  }, [lovedOne._id, user?.email]);

  if (role === null) {
    return <ActivityIndicator size="large" color="#5C6BC0" />;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.card}>
        <LinearGradient
          colors={role === 0 ? ["#5C6BC0", "#3949AB"] : ["#7986CB", "#5C6BC0"]}
          style={styles.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeaderContent}>
            <View style={styles.lovedOneInfo}>
              <Text style={styles.lovedOneName}>{lovedOne.name}</Text>
              <View style={styles.roleContainer}>
                <Ionicons
                  name={role === 0 ? "star" : "people"}
                  size={16}
                  color="white"
                />
                <Text style={styles.roleText}>
                  {role === 0 ? "Primary Caregiver" : "Secondary Caregiver"}
                </Text>
              </View>
            </View>
            <View style={styles.iconContainer}>
              <Ionicons
                name={role === 0 ? "shield-checkmark" : "heart"}
                size={24}
                color="white"
              />
            </View>
          </View>
        </LinearGradient>
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: "#E8EAF6" }]}>
              <Ionicons name="calendar-outline" size={20} color="#3949AB" />
            </View>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Age: </Text>
              {lovedOne.age || "N/A"} years
            </Text>
          </View>
          {lovedOne.medical_history && (
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: "#E8EAF6" }]}>
                <Ionicons name="medical-outline" size={20} color="#3949AB" />
              </View>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Medical History: </Text>
                {lovedOne.medical_history}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: "#E8EAF6" }]}>
              <Ionicons name="location-outline" size={20} color="#3949AB" />
            </View>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Location: </Text>
              {lovedOne.location || "Not specified"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MyRolesScreen = ({ navigation }) => {
  const {
    data: lovedOnes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5C6BC0" />
        <Text style={styles.loadingText}>Loading your care roles...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>
          Error loading roles: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#5C6BC0", "#3949AB"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>My Care Roles</Text>
            <Text style={styles.headerSubtitle}>
              Managing care with compassion and dedication
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {lovedOnes?.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Your Care Responsibilities</Text>
            {lovedOnes.map((lovedOne, index) => (
              <RoleCard
                key={lovedOne._id}
                lovedOne={lovedOne}
                onPress={() =>
                  navigation.navigate("LovedOneDetails", { lovedOne })
                }
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>No Roles Assigned</Text>
            <Text style={styles.emptyText}>
              You haven't been assigned as a caregiver yet. Roles will appear
              here once you're connected with loved ones.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    padding: 20,
  },
  cardHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lovedOneInfo: {
    flex: 1,
  },
  lovedOneName: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
    marginLeft: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    padding: 20,
    backgroundColor: "white",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#4B5563",
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#5C6BC0",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default MyRolesScreen;
