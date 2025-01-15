import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTask } from "../api/CreateTask";
import { getAllLovedOnes } from "../api/Users";
import { useUser } from "../api/UserContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const getMoodInfo = (completionRate, totalTasks = 0) => {
  if (totalTasks === 0) {
    return { emoji: "😌", text: "0%", color: "#8B5CF6" };
  }

  if (completionRate >= 80) {
    return {
      emoji: "😊",
      text: `${Math.round(completionRate)}%`,
      color: "#4CAF50",
    };
  } else if (completionRate >= 60) {
    return {
      emoji: "🙂",
      text: `${Math.round(completionRate)}%`,
      color: "#8BC34A",
    };
  } else if (completionRate >= 40) {
    return {
      emoji: "😐",
      text: `${Math.round(completionRate)}%`,
      color: "#FFC107",
    };
  } else if (completionRate >= 20) {
    return {
      emoji: "😕",
      text: `${Math.round(completionRate)}%`,
      color: "#FF9800",
    };
  } else if (totalTasks > 3) {
    return {
      emoji: "😟",
      text: `${Math.round(completionRate)}%`,
      color: "#F44336",
    };
  } else {
    return {
      emoji: "🙂",
      text: `${Math.round(completionRate)}%`,
      color: "#64748B",
    };
  }
};

const ProgressBar = ({ progress, color }) => (
  <View style={styles.progressBarContainer}>
    <View
      style={[
        styles.progressBar,
        { width: `${progress}%`, backgroundColor: color },
      ]}
    />
  </View>
);

const formatCategoryText = (category) => {
  return category.replace("_", " ");
};

const DailyTasksScreen = ({ navigation }) => {
  const { user, token } = useUser();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedLovedOne, setSelectedLovedOne] = useState(null);
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      try {
        // First get all loved ones
        const lovedOnes = await getAllLovedOnes(token);
        console.log("Fetched loved ones:", lovedOnes);

        // Then get tasks for each loved one
        const allTasksPromises = lovedOnes.map((lovedOne) => {
          console.log("Fetching tasks for loved one:", lovedOne._id);
          return getTask(lovedOne._id).catch((err) => {
            console.error(
              `Error fetching tasks for loved one ${lovedOne._id}:`,
              err
            );
            return { pending: [], completed: [] };
          });
        });

        const allTasksResults = await Promise.all(allTasksPromises);
        console.log("All tasks results:", allTasksResults);

        // Combine all tasks
        const combinedTasks = allTasksResults.reduce((acc, result) => {
          if (result.pending) acc.push(...result.pending);
          if (result.completed) acc.push(...result.completed);
          return acc;
        }, []);

        console.log("Combined tasks:", combinedTasks);
        return combinedTasks;
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }
    },
    select: (data) => {
      console.log("Raw tasks data:", data);
      if (!data) return { pending: [], completed: [], all: [] };

      const pending = data.filter((task) => task.status === "PENDING");
      const completed = data.filter((task) => task.status === "COMPLETED");
      console.log("Filtered tasks:", { pending, completed });
      return { pending, completed, all: data };
    },
    enabled: !!token,
  });

  const { data: lovedOnes, isLoading: lovedOnesLoading } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: () => getAllLovedOnes(token),
  });

  // Calculate completion rates for each loved one
  const getLovedOneStats = (lovedOneId) => {
    if (!tasks?.all) return { completed: 0, total: 0, rate: 0 };

    const lovedOneTasks = tasks.all.filter(
      (task) => task.loved_one?._id === lovedOneId
    );
    const completedTasks = lovedOneTasks.filter(
      (task) => task.status === "COMPLETED"
    );

    return {
      completed: completedTasks.length,
      total: lovedOneTasks.length,
      rate: lovedOneTasks.length
        ? (completedTasks.length / lovedOneTasks.length) * 100
        : 0,
    };
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries(["tasks"]);
    setRefreshing(false);
  }, []);

  const getTaskCategoryIcon = (category) => {
    const icons = {
      MEDICATION: "medical",
      "HEALTH CHECK": "fitness",
      APPOINTMENT: "calendar",
      EXERCISE: "walk",
      DIET: "nutrition",
      HYGIENE: "water",
      SOCIAL: "people",
    };
    return icons[category] || "list";
  };

  const getTaskPriorityColor = (priority) => {
    const colors = {
      High: "#FF6B6B",
      Medium: "#FFB169",
      Low: "#4ECDC4",
    };
    return colors[priority] || "#4ECDC4";
  };

  const getTaskCategoryInfo = (category) => {
    const categories = {
      MEDICATION: {
        icon: "medical",
        color: "#E11D48",
        gradientColors: ["#E11D48", "#BE123C"],
        lightColor: "#FFF1F2",
      },
      "HEALTH CHECK": {
        icon: "fitness",
        color: "#0891B2",
        gradientColors: ["#0891B2", "#0E7490"],
        lightColor: "#ECFEFF",
      },
      APPOINTMENT: {
        icon: "calendar",
        color: "#7C3AED",
        gradientColors: ["#7C3AED", "#6D28D9"],
        lightColor: "#F5F3FF",
      },
      EXERCISE: {
        icon: "walk",
        color: "#059669",
        gradientColors: ["#059669", "#047857"],
        lightColor: "#ECFDF5",
      },
      DIET: {
        icon: "nutrition",
        color: "#D97706",
        gradientColors: ["#D97706", "#B45309"],
        lightColor: "#FFFBEB",
      },
      HYGIENE: {
        icon: "water",
        color: "#0284C7",
        gradientColors: ["#0284C7", "#0369A1"],
        lightColor: "#F0F9FF",
      },
      SOCIAL: {
        icon: "people",
        color: "#7E22CE",
        gradientColors: ["#7E22CE", "#6B21A8"],
        lightColor: "#FAF5FF",
      },
    };
    return (
      categories[category] || {
        icon: "list",
        color: "#3B82F6",
        gradientColors: ["#3B82F6", "#2563EB"],
        lightColor: "#EFF6FF",
      }
    );
  };

  const renderTaskItem = (task) => {
    const categoryInfo = getTaskCategoryInfo(task.category);

    return (
      <Pressable
        key={task._id}
        style={({ pressed }) => [
          styles.taskItem,
          { backgroundColor: categoryInfo.lightColor },
          pressed && styles.pressed,
        ]}
        onPress={() => navigation.navigate("TaskDetails", { task })}
      >
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <View style={styles.categoryBadge}>
              <LinearGradient
                colors={categoryInfo.gradientColors}
                style={styles.categoryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons
                  name={getTaskCategoryIcon(task.category)}
                  size={16}
                  color="white"
                />
                <Text style={styles.categoryText}>
                  {formatCategoryText(task.category)}
                </Text>
              </LinearGradient>
            </View>
            <View
              style={[
                styles.statusBadge,
                task.status === "COMPLETED" && styles.completedStatusBadge,
                task.status === "PENDING" && styles.pendingStatusBadge,
              ]}
            >
              <Ionicons
                name={task.status === "COMPLETED" ? "checkmark-circle" : "time"}
                size={14}
                color={task.status === "COMPLETED" ? "#2E7D32" : "#F57C00"}
              />
              <Text
                style={[
                  styles.statusText,
                  task.status === "COMPLETED" && styles.completedStatusText,
                  task.status === "PENDING" && styles.pendingStatusText,
                ]}
              >
                {task.status}
              </Text>
            </View>
          </View>

          <Text style={styles.taskTitle} numberOfLines={2}>
            {task.title}
          </Text>

          {task.description && (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>
          )}

          <View style={styles.taskMetadata}>
            <View style={styles.metadataRow}>
              <View style={styles.timeContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={categoryInfo.color}
                />
                <View style={styles.timeTextContainer}>
                  <Text
                    style={[styles.timeText, { color: categoryInfo.color }]}
                  >
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
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getTaskPriorityColor(task.priority) },
                ]}
              >
                <Text style={styles.priorityText}>{task.priority}</Text>
              </View>
            </View>

            <View style={styles.metadataRow}>
              <View style={styles.assigneeContainer}>
                <Ionicons
                  name="heart-outline"
                  size={16}
                  color={categoryInfo.color}
                />
                <View style={styles.assigneeInfo}>
                  <Text
                    style={[
                      styles.assigneeLabel,
                      { color: categoryInfo.color },
                    ]}
                  >
                    Loved One:
                  </Text>
                  <Text
                    style={[styles.assigneeText, { color: categoryInfo.color }]}
                  >
                    {task.loved_one?.name || "Not assigned"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.metadataRow}>
              <View style={styles.assigneeContainer}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={categoryInfo.color}
                />
                <View style={styles.assigneeInfo}>
                  <Text
                    style={[
                      styles.assigneeLabel,
                      { color: categoryInfo.color },
                    ]}
                  >
                    Assigned To:
                  </Text>
                  <Text
                    style={[styles.assigneeText, { color: categoryInfo.color }]}
                  >
                    {task.assigned_to?.user?.name ||
                      task.assigned_to?.name ||
                      "Not assigned"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderLovedOneCard = (lovedOne) => {
    const stats = getLovedOneStats(lovedOne._id);
    const mood = getMoodInfo(stats.rate, stats.total);

    return (
      <View key={lovedOne._id} style={[styles.lovedOneCard, styles.elevation]}>
        <View style={styles.lovedOneHeader}>
          <View>
            <Text style={styles.lovedOneName}>{lovedOne.name}</Text>
            <Text style={styles.taskCount}>
              {stats.completed}/{stats.total} Tasks
            </Text>
          </View>
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
        </View>
        <View style={styles.lovedOneStats}>
          <ProgressBar progress={stats.rate} color={mood.color} />
          <Text style={[styles.moodText, { color: mood.color }]}>
            {mood.text}
          </Text>
        </View>
      </View>
    );
  };

  // Filter tasks based on selected loved one
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return { pending: [], completed: [] };
    if (!selectedLovedOne) return tasks;

    return {
      pending: tasks.pending.filter(
        (task) => task.loved_one?._id === selectedLovedOne._id
      ),
      completed: tasks.completed.filter(
        (task) => task.loved_one?._id === selectedLovedOne._id
      ),
      all: tasks.all.filter(
        (task) => task.loved_one?._id === selectedLovedOne._id
      ),
    };
  }, [tasks, selectedLovedOne]);

  if (tasksLoading || lovedOnesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const pendingTasksCount = tasks?.pending?.length || 0;
  const completedTasksCount = tasks?.completed?.length || 0;
  const totalTasks = pendingTasksCount + completedTasksCount;
  const completionRate = totalTasks
    ? Math.round((completedTasksCount / totalTasks) * 100)
    : 0;

  console.log("Current tasks state:", tasks);
  console.log("Active tab:", activeTab);
  console.log("Pending tasks:", tasks?.pending);
  console.log("Completed tasks:", tasks?.completed);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Hello there,</Text>
            <Text style={styles.userName}>{user?.name || "Caregiver"} 👋</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
            onPress={() => navigation.navigate("CreateTask")}
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, styles.elevation]}>
            <LinearGradient
              colors={["#FB923C", "#EA580C"]}
              style={styles.statsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.statsNumber}>
                {selectedLovedOne
                  ? filteredTasks.pending.length
                  : pendingTasksCount}
              </Text>
              <Text style={styles.statsLabel}>Pending</Text>
              <Ionicons
                name="time"
                size={24}
                color="white"
                style={styles.statsIcon}
              />
            </LinearGradient>
          </View>
          <View style={[styles.statsCard, styles.elevation]}>
            <LinearGradient
              colors={["#22C55E", "#16A34A"]}
              style={styles.statsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.statsNumber}>
                {selectedLovedOne
                  ? Math.round(
                      (filteredTasks.completed.length /
                        (filteredTasks.completed.length +
                          filteredTasks.pending.length)) *
                        100
                    ) || 0
                  : completionRate}
                %
              </Text>
              <Text style={styles.statsLabel}>Completed</Text>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="white"
                style={styles.statsIcon}
              />
            </LinearGradient>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <Pressable
            style={[
              styles.filterButton,
              !selectedLovedOne && styles.activeFilter,
            ]}
            onPress={() => setSelectedLovedOne(null)}
          >
            <Text
              style={[
                styles.filterText,
                !selectedLovedOne && styles.activeFilterText,
              ]}
            >
              All Tasks
            </Text>
          </Pressable>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterScrollContent}
          >
            {lovedOnes?.map((lovedOne) => (
              <Pressable
                key={lovedOne._id}
                style={[
                  styles.filterButton,
                  selectedLovedOne?._id === lovedOne._id && styles.activeFilter,
                ]}
                onPress={() => setSelectedLovedOne(lovedOne)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedLovedOne?._id === lovedOne._id &&
                      styles.activeFilterText,
                  ]}
                >
                  {lovedOne.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.lovedOnesHeaderContainer}>
          <Text style={styles.lovedOnesHeaderTitle}>CareLink</Text>
          <Text style={styles.lovedOnesHeaderSubtitle}>
            Providing care with love and dedication
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Loved Ones</Text>
          <Pressable
            style={({ pressed }) => [
              styles.seeAllButton,
              pressed && styles.pressed,
            ]}
            onPress={() => navigation.navigate("LovedOnesList")}
          >
            <Text style={styles.seeAllText}>See Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#4A90E2" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.lovedOnesScroll}
          contentContainerStyle={styles.lovedOnesContainer}
        >
          {lovedOnes?.map(renderLovedOneCard)}
        </ScrollView>

        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === "pending" && styles.activeTab]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              Pending (
              {selectedLovedOne
                ? filteredTasks.pending.length
                : pendingTasksCount}
              )
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
            onPress={() => setActiveTab("completed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" && styles.activeTabText,
              ]}
            >
              Completed (
              {selectedLovedOne
                ? filteredTasks.completed.length
                : completedTasksCount}
              )
            </Text>
          </Pressable>
        </View>

        <View style={styles.taskList}>
          <View style={styles.sectionContainer}>
            {activeTab === "pending" ? (
              filteredTasks?.pending && filteredTasks.pending.length > 0 ? (
                filteredTasks.pending.map((task) => (
                  <View key={task._id}>{renderTaskItem(task)}</View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="list" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No pending tasks</Text>
                  <Text style={styles.emptySubtext}>
                    {selectedLovedOne
                      ? `No pending tasks for ${selectedLovedOne.name}`
                      : "Tap the + button to create a new task"}
                  </Text>
                </View>
              )
            ) : filteredTasks?.completed &&
              filteredTasks.completed.length > 0 ? (
              filteredTasks.completed.map((task) => (
                <View key={task._id}>{renderTaskItem(task)}</View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No completed tasks</Text>
                <Text style={styles.emptySubtext}>
                  {selectedLovedOne
                    ? `No completed tasks for ${selectedLovedOne.name}`
                    : "Complete some tasks to see them here"}
                </Text>
              </View>
            )}
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  userName: {
    fontSize: 26,
    fontWeight: "800",
    color: "white",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statsCard: {
    width: CARD_WIDTH,
    height: 130,
    borderRadius: 16,
    overflow: "hidden",
  },
  statsGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  statsNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "white",
  },
  statsLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.95)",
    marginTop: 6,
    fontWeight: "600",
  },
  statsIcon: {
    position: "absolute",
    right: 16,
    bottom: 16,
    opacity: 0.5,
  },
  elevation: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
  },
  activeTab: {
    borderBottomColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#3B82F6",
  },
  taskList: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 12,
    color: "#4A90E2",
    marginLeft: 4,
    fontWeight: "600",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 24,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assigneeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  assigneeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: "#4A90E2",
    marginRight: 4,
  },
  lovedOnesScroll: {
    marginBottom: 20,
  },
  lovedOnesContainer: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  lovedOneCard: {
    width: width * 0.75,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
  },
  lovedOneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  lovedOneName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 14,
    color: "#666",
  },
  moodEmoji: {
    fontSize: 24,
  },
  lovedOneStats: {
    marginTop: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  moodText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  taskItem: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  taskContent: {
    padding: 20,
    gap: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
  },
  completedStatusBadge: {
    backgroundColor: "#DCFCE7",
    borderColor: "rgba(22, 163, 74, 0.2)",
  },
  pendingStatusBadge: {
    backgroundColor: "#FEF3C7",
    borderColor: "rgba(217, 119, 6, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  completedStatusText: {
    color: "#15803D",
  },
  pendingStatusText: {
    color: "#B45309",
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 24,
  },
  taskDescription: {
    fontSize: 14,
    color: "#374151",
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
  timeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  assigneeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  assigneeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  lovedOnesHeaderContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  lovedOnesHeaderTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  lovedOnesHeaderSubtitle: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 22,
    fontWeight: "500",
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    marginTop: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeFilter: {
    backgroundColor: "#3B82F6",
    borderColor: "#2563EB",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  activeFilterText: {
    color: "white",
  },
  assigneeInfo: {
    flex: 1,
  },
  assigneeLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  assigneeText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DailyTasksScreen;
