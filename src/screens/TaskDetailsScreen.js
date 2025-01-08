import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const TaskDetailsScreen = ({ route, navigation }) => {
  const { task } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View
              style={[
                styles.statusBadge,
                task.completed ? styles.completedBadge : styles.pendingBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  task.completed ? styles.completedText : styles.pendingText,
                ]}
              >
                {task.completed ? "Completed" : "Pending"}
              </Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={24} color="#4A90E2" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{task.time}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="person-outline" size={24} color="#4A90E2" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Assigned To</Text>
                <Text style={styles.detailValue}>{task.assignedTo}</Text>
              </View>
            </View>

            {task.note && (
              <View style={styles.detailItem}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#4A90E2"
                />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Note</Text>
                  <Text style={styles.detailValue}>{task.note}</Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              task.completed ? styles.reopenButton : styles.completeButton,
            ]}
          >
            <Ionicons
              name={task.completed ? "refresh" : "checkmark-circle"}
              size={24}
              color="white"
            />
            <Text style={styles.actionButtonText}>
              {task.completed ? "Reopen Task" : "Mark as Complete"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  completedBadge: {
    backgroundColor: "#E8F5E9",
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  completedText: {
    color: "#4CAF50",
  },
  pendingText: {
    color: "#FF9800",
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 16,
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
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButton: {
    backgroundColor: "#4CAF50",
  },
  reopenButton: {
    backgroundColor: "#FF9800",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TaskDetailsScreen;
