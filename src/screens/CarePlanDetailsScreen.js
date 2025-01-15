import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCarePlan } from "../api/CarePlan";

const StatusBadge = ({ status, type = "plan" }) => {
  const getStatusColor = (status, type) => {
    const planStatusColors = {
      DRAFT: "#F59E0B",
      ACTIVE: "#059669",
      COMPLETED: "#2563EB",
      ARCHIVED: "#6B7280",
    };

    const goalStatusColors = {
      PENDING: "#F59E0B",
      IN_PROGRESS: "#2563EB",
      COMPLETED: "#059669",
    };

    return type === "plan"
      ? planStatusColors[status]
      : goalStatusColors[status];
  };

  return (
    <View
      style={[styles.badge, { backgroundColor: getStatusColor(status, type) }]}
    >
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

const CarePlanDetailsScreen = ({ route, navigation }) => {
  const { carePlan } = route.params;
  const queryClient = useQueryClient();

  const handleDelete = () => {
    Alert.alert(
      "Delete Care Plan",
      "Are you sure you want to delete this care plan?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCarePlan(carePlan._id, carePlan.loved_one);
              await queryClient.invalidateQueries([
                "carePlans",
                carePlan.loved_one,
              ]);
              navigation.goBack();
              Alert.alert("Success", "Care plan has been deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete care plan");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Care Plan Details</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <LinearGradient
          colors={["#ffffff", "#f8f9fa"]}
          style={styles.carePlanCard}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{carePlan.title}</Text>
            <StatusBadge status={carePlan.status} type="plan" />
          </View>

          <Text style={styles.description}>{carePlan.description}</Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Created by: {carePlan.created_by?.name || "Unknown"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Start Date:{" "}
                {format(new Date(carePlan.schedule.start_date), "MMM dd, yyyy")}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                End Date:{" "}
                {format(new Date(carePlan.schedule.end_date), "MMM dd, yyyy")}
              </Text>
            </View>
          </View>

          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>
              Goals ({carePlan.goals.length})
            </Text>
            {carePlan.goals.map((goal, index) => (
              <View key={index} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <StatusBadge status={goal.status} type="goal" />
                </View>
                <Text style={styles.goalDescription}>{goal.description}</Text>
                <View style={styles.goalFooter}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.goalDate}>
                    Target Date:{" "}
                    {format(new Date(goal.target_date), "MMM dd, yyyy")}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {carePlan.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notes}>{carePlan.notes}</Text>
            </View>
          )}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  carePlanCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 20,
    lineHeight: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: "#4B5563",
  },
  goalsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  goalDescription: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 12,
  },
  goalFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  notesSection: {
    marginTop: 8,
  },
  notes: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CarePlanDetailsScreen;
