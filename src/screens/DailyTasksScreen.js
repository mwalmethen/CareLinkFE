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
import { useQuery } from "@tanstack/react-query";
import { getAllLovedOnes } from "../api/Users";
import { getTask } from "../api/CreateTask";
import { useUser } from "../api/UserContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const DailyTasksScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLovedOne, setSelectedLovedOne] = useState(null);
  const [tasks, setTasks] = useState({ pending: [], completed: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const { data: lovedOnes = [] } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
  });

  useEffect(() => {
    if (selectedLovedOne) {
      fetchTasks();
    }
  }, [selectedLovedOne]);

  const fetchTasks = async () => {
    if (!selectedLovedOne?._id) {
      console.log("No loved one selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching tasks for loved one:", selectedLovedOne._id);
      const response = await getTask(selectedLovedOne._id);
      console.log("Tasks response received:", response);

      if (!response) {
        throw new Error("No response received");
      }

      setTasks({
        pending: response.pending || [],
        completed: response.completed || [],
        total: response.total || 0,
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(error.message);
      setTasks({ pending: [], completed: [], total: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTaskItem = (task) => (
    <Pressable
      key={task._id}
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
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.taskDetails}>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.timeText}>
                {new Date(task.due_date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
            <View style={styles.assigneeContainer}>
              <View style={styles.assigneeInfo}>
                <Text style={styles.assigneeLabel}>Created by</Text>
                <Text style={styles.assigneeName}>
                  {task.created_by?.name || "Unknown"}
                </Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{task.category}</Text>
              </View>
            </View>
            <View style={styles.assigneeContainer}>
              <View style={styles.assigneeInfo}>
                <Text style={styles.assigneeLabel}>Priority</Text>
                <Text style={styles.assigneeName}>{task.priority}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{task.status}</Text>
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
                {error}
              </Text>
            </View>
          ) : tasks.pending.length > 0 || tasks.completed.length > 0 ? (
            <>
              {tasks.pending.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Pending Tasks</Text>
                  {tasks.pending.map(renderTaskItem)}
                </View>
              )}

              {tasks.completed.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Completed Tasks</Text>
                  {tasks.completed.map(renderTaskItem)}
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
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taskGradient: {
    padding: 15,
  },
  taskContent: {
    gap: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  taskDetails: {
    gap: 12,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
  },
  assigneeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assigneeInfo: {
    gap: 4,
  },
  assigneeLabel: {
    fontSize: 12,
    color: "#999",
  },
  assigneeName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#34A853",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F57C00",
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
