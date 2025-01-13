import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Easing,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllLovedOnes } from "../api/Users";
import { getTask } from "../api/CreateTask";
import { useUser } from "../api/UserContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const DailyTasksScreen = ({ navigation, route }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLovedOne, setSelectedLovedOne] = useState(
    route.params?.lovedOne || null
  );
  const { token } = useUser();
  const queryClient = useQueryClient();

  // Set initial selected loved one from route params
  useEffect(() => {
    if (route.params?.lovedOne) {
      setSelectedLovedOne(route.params.lovedOne);
    }
  }, [route.params?.lovedOne]);

  const { data: lovedOnes = [] } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
  });

  const {
    data: tasks = { pending: [], completed: [], total: 0 },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", selectedLovedOne?._id],
    queryFn: () => getTask(selectedLovedOne._id),
    enabled: !!selectedLovedOne?._id,
  });

  useEffect(() => {
    if (selectedLovedOne) {
      // Prefetch tasks when loved one is selected
      queryClient.prefetchQuery({
        queryKey: ["tasks", selectedLovedOne._id],
        queryFn: () => getTask(selectedLovedOne._id),
      });
    }
  }, [selectedLovedOne]);

  const renderTaskItem = (task) => (
    <Pressable
      style={styles.taskItem}
      onPress={() => navigation.navigate("TaskDetails", { task })}
    >
      <LinearGradient
        colors={["#ffffff", "#f8f9fa"]}
        style={styles.taskGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleContainer}>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {task.title}
              </Text>
              <View
                style={[
                  styles.priorityBadge,
                  task.priority === "HIGH" && styles.highPriorityBadge,
                  task.priority === "MEDIUM" && styles.mediumPriorityBadge,
                  task.priority === "LOW" && styles.lowPriorityBadge,
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    task.priority === "HIGH" && styles.highPriorityText,
                    task.priority === "MEDIUM" && styles.mediumPriorityText,
                    task.priority === "LOW" && styles.lowPriorityText,
                  ]}
                >
                  {task.priority}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                task.status === "COMPLETED" && styles.completedStatusBadge,
                task.status === "IN_PROGRESS" && styles.inProgressStatusBadge,
                task.status === "PENDING" && styles.pendingStatusBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  task.status === "COMPLETED" && styles.completedStatusText,
                  task.status === "IN_PROGRESS" && styles.inProgressStatusText,
                  task.status === "PENDING" && styles.pendingStatusText,
                ]}
              >
                {task.status}
              </Text>
            </View>
          </View>

          {task.description && (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>
          )}

          <View style={styles.taskMetadata}>
            <View style={styles.metadataRow}>
              <View style={styles.timeContainer}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <View style={styles.timeTextContainer}>
                  <Text style={styles.timeLabel}>Due</Text>
                  <Text style={styles.timeText}>
                    {new Date(task.due_date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                    {" • "}
                    {new Date(task.due_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.categoryContainer}>
                <Ionicons name="bookmark-outline" size={16} color="#666" />
                <Text style={styles.categoryText}>{task.category}</Text>
              </View>
            </View>

            <View style={styles.metadataRow}>
              <View style={styles.assigneeContainer}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.assigneeText} numberOfLines={1}>
                  {task.assigned_to?.name || "Unassigned"}
                </Text>
              </View>
              <View style={styles.creatorContainer}>
                <Ionicons name="create-outline" size={16} color="#666" />
                <Text style={styles.creatorText} numberOfLines={1}>
                  {task.created_by?.name || "Unknown"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Tasks</Text>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => navigation.navigate("CreateTask")}
        >
          <LinearGradient
            colors={["#4A90E2", "#357ABD"]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add" size={24} color="white" />
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.lovedOneSelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.lovedOneList}
        >
          {lovedOnes.map((lovedOne) => (
            <Pressable
              key={lovedOne._id}
              style={[
                styles.lovedOneItem,
                selectedLovedOne?._id === lovedOne._id &&
                  styles.selectedLovedOne,
              ]}
              onPress={() => setSelectedLovedOne(lovedOne)}
            >
              <Text
                style={[
                  styles.lovedOneName,
                  selectedLovedOne?._id === lovedOne._id &&
                    styles.selectedLovedOneName,
                ]}
              >
                {lovedOne.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {selectedLovedOne ? (
        <ScrollView style={styles.taskList}>
          {isLoading ? (
            <View style={styles.noTasksContainer}>
              <Text style={styles.noTasksText}>Loading tasks...</Text>
            </View>
          ) : error ? (
            <View style={styles.noTasksContainer}>
              <Text style={[styles.noTasksText, styles.errorText]}>
                {error.message}
              </Text>
            </View>
          ) : tasks.pending.length > 0 || tasks.completed.length > 0 ? (
            <>
              {tasks.pending.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Pending Tasks</Text>
                  {tasks.pending.map((task, index) => (
                    <View key={task._id || `pending-${index}`}>
                      {renderTaskItem(task)}
                    </View>
                  ))}
                </View>
              )}

              {tasks.completed.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Completed Tasks</Text>
                  {tasks.completed.map((task, index) => (
                    <View key={task._id || `completed-${index}`}>
                      {renderTaskItem(task)}
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.noTasksContainer}>
              <Ionicons name="calendar-outline" size={48} color="#999" />
              <Text style={styles.noTasksText}>No tasks for today</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>Please select a loved one</Text>
        </View>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    padding: 12,
    borderRadius: 12,
  },
  lovedOneSelector: {
    marginBottom: 20,
  },
  lovedOneList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  lovedOneItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  selectedLovedOne: {
    backgroundColor: "#4A90E2",
  },
  lovedOneName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  selectedLovedOneName: {
    color: "white",
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taskGradient: {
    padding: 16,
  },
  taskContent: {
    gap: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
  },
  highPriorityBadge: {
    backgroundColor: "#FFEBEE",
  },
  mediumPriorityBadge: {
    backgroundColor: "#FFF3E0",
  },
  lowPriorityBadge: {
    backgroundColor: "#E8F5E9",
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
  },
  highPriorityText: {
    color: "#D32F2F",
  },
  mediumPriorityText: {
    color: "#F57C00",
  },
  lowPriorityText: {
    color: "#2E7D32",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
  },
  completedStatusBadge: {
    backgroundColor: "#E8F5E9",
  },
  inProgressStatusBadge: {
    backgroundColor: "#E3F2FD",
  },
  pendingStatusBadge: {
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
  },
  completedStatusText: {
    color: "#2E7D32",
  },
  inProgressStatusText: {
    color: "#1976D2",
  },
  pendingStatusText: {
    color: "#F57C00",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  taskMetadata: {
    gap: 8,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeTextContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "flex-end",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  assigneeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  assigneeText: {
    fontSize: 14,
    color: "#666",
  },
  creatorContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "flex-end",
  },
  creatorText: {
    fontSize: 14,
    color: "#666",
  },
  noTasksContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noTasksText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginLeft: 4,
  },
  errorText: {
    color: "#F57C00",
  },
});

export default DailyTasksScreen;
