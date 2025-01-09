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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getAllLovedOnes } from "../api/Users";
import { useUser } from "../api/UserContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const DailyTasksScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("6");
  const [selectedLovedOne, setSelectedLovedOne] = useState(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const { token } = useUser();

  const handleTaskPress = (task) => {
    navigation.navigate("TaskDetails", { task });
  };

  // Add dates array back
  const dates = [
    { day: "SUN", date: "5" },
    { day: "MON", date: "6" },
    { day: "TUE", date: "7" },
    { day: "WED", date: "8" },
    { day: "THU", date: "9" },
  ];

  // Fetch loved ones
  const { data: lovedOnes, isLoading: loadingLovedOnes } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
    enabled: true,
  });

  // Get tasks from React Query cache
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    // This is a placeholder until we have the API endpoint
    queryFn: () => [],
    enabled: true,
  });

  // Sample tasks for demonstration
  const sampleTasks = [
    {
      id: 1,
      title: "Physiotherapy session",
      time: "07:30 AM - 08:00 AM",
      assignedTo: "Me",
      completed: true,
      date: "6",
      note: "",
    },
    {
      id: 2,
      title: "Medication for heart condition",
      time: "01:30 PM - 03:00 PM",
      assignedTo: "Abdullah",
      completed: false,
      date: "6",
      note: "",
    },
    {
      id: 3,
      title: "Walk in the neighborhood",
      time: "04:30 PM - 05:00 PM",
      assignedTo: "Mother",
      completed: false,
      date: "7",
      note: "",
    },
    {
      id: 4,
      title: "Blood pressure check",
      time: "09:00 AM - 09:30 AM",
      assignedTo: "Father",
      completed: false,
      date: "8",
      note: "",
    },
    {
      id: 5,
      title: "Doctor's appointment",
      time: "11:00 AM - 12:00 PM",
      assignedTo: "Mother",
      completed: false,
      date: "5",
      note: "",
    },
  ];

  // Combine tasks from cache with sample tasks
  const allTasks = [...(tasks || []), ...sampleTasks];

  // Filter tasks by loved one and date
  const filteredTasks = allTasks
    .filter((task) => {
      if (!selectedLovedOne) return true;
      // Check both lovedOne._id and lovedOne.id
      return (
        task.lovedOne?._id === selectedLovedOne._id ||
        task.lovedOne?.id === selectedLovedOne.id
      );
    })
    .filter((task) => task.date === selectedDate)
    .sort((a, b) => {
      // Sort by time
      const timeA = a.time.split(" - ")[0];
      const timeB = b.time.split(" - ")[0];
      return timeA.localeCompare(timeB);
    });

  // Calculate progress
  const completedTasks = filteredTasks.filter((task) => task.completed).length;
  const totalTasks = filteredTasks.length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Animation values with proper initialization
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const calendarSlideAnim = useRef(new Animated.Value(50)).current;
  const taskItemAnims = useRef(
    filteredTasks.map(() => new Animated.Value(0))
  ).current;

  // Initial animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(calendarSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  // Task items animation
  useEffect(() => {
    // Reset animation values
    taskItemAnims.forEach((anim) => anim.setValue(0));

    // Start new animations
    const animations = taskItemAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  }, [selectedDate, selectedLovedOne]); // Only re-run when filters change

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Daily Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
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
        </TouchableOpacity>
      </Animated.View>

      {/* Calendar Section */}
      <Animated.View
        style={[
          styles.calendarSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: calendarSlideAnim }],
          },
        ]}
      >
        <View style={styles.monthSelector}>
          <Text style={styles.monthText}>January 2025</Text>
          <Ionicons name="chevron-down" size={20} color="#000" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.datesContainer}>
            {dates.map((item) => (
              <TouchableOpacity
                key={item.date}
                style={[
                  styles.dateItem,
                  selectedDate === item.date && styles.selectedDate,
                ]}
                onPress={() => setSelectedDate(item.date)}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDate === item.date && styles.selectedDateText,
                  ]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.dateText,
                    selectedDate === item.date && styles.selectedDateText,
                  ]}
                >
                  {item.date}
                </Text>
                {allTasks.filter((task) => task.date === item.date).length >
                  0 && <View style={styles.taskIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Progress Section */}
      <Animated.View style={[styles.progressSection, { opacity: fadeAnim }]}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressPercentage}>
            {progressPercentage.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Loved One Selector */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setSelectorVisible(true)}
      >
        <LinearGradient
          colors={["#4A90E2", "#357ABD"]}
          style={styles.selectorGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="people" size={20} color="white" />
          <Text style={styles.selectorText}>
            {selectedLovedOne ? selectedLovedOne.name : "View All Members"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Tasks List */}
      <ScrollView style={styles.taskList}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, index) => (
            <Animated.View
              key={task.id}
              style={[
                styles.taskItemContainer,
                {
                  opacity: taskItemAnims[index] || fadeAnim,
                  transform: [
                    {
                      translateY: taskItemAnims[index]
                        ? taskItemAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          })
                        : 0,
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.taskItem}
                onPress={() => handleTaskPress(task)}
              >
                <LinearGradient
                  colors={["#ffffff", "#f8f9fa"]}
                  style={styles.taskGradient}
                >
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={styles.taskDetails}>
                      <View style={styles.timeContainer}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color="#4A90E2"
                        />
                        <Text style={styles.timeText}>{task.time}</Text>
                      </View>
                      <View style={styles.assigneeContainer}>
                        <View style={styles.assigneeInfo}>
                          <Text style={styles.assigneeLabel}>Loved one</Text>
                          <Text style={styles.assigneeName}>
                            {task.lovedOne?.name || "Unknown"}
                          </Text>
                        </View>
                        <View style={styles.assigneeInfo}>
                          <Text style={styles.assigneeLabel}>Assigned to</Text>
                          <Text style={styles.assigneeName}>
                            {task.assignedTo}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))
        ) : (
          <Animated.View
            style={[styles.noTasksContainer, { opacity: fadeAnim }]}
          >
            <Ionicons name="calendar-outline" size={48} color="#666" />
            <Text style={styles.noTasksText}>No tasks for this date</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Emergency Button */}
      <View style={styles.emergencyButtonContainer}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => navigation.navigate("EmergencyButton")}
        >
          <LinearGradient
            colors={["#ff4b4b", "#ff0000"]}
            style={styles.emergencyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons
              name="warning"
              size={24}
              color="white"
              style={styles.emergencyIcon}
            />
            <Text style={styles.emergencyButtonText}>Emergency</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Loved One Selector Modal */}
      <Modal
        visible={selectorVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectorVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Member</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectorVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.lovedOnesList}>
              <TouchableOpacity
                style={styles.lovedOneItem}
                onPress={() => {
                  setSelectedLovedOne(null);
                  setSelectorVisible(false);
                }}
              >
                <Text style={styles.lovedOneName}>View All Members</Text>
                {!selectedLovedOne && (
                  <Ionicons name="checkmark" size={24} color="#4A90E2" />
                )}
              </TouchableOpacity>
              {lovedOnes?.map((lovedOne) => (
                <TouchableOpacity
                  key={lovedOne._id}
                  style={styles.lovedOneItem}
                  onPress={() => {
                    setSelectedLovedOne(lovedOne);
                    setSelectorVisible(false);
                  }}
                >
                  <Text style={styles.lovedOneName}>{lovedOne.name}</Text>
                  {selectedLovedOne?._id === lovedOne._id && (
                    <Ionicons name="checkmark" size={24} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  calendarSection: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  datesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateItem: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    minWidth: 60,
  },
  selectedDate: {
    backgroundColor: "#4A90E2",
  },
  dayText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  selectedDateText: {
    color: "white",
  },
  taskIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A90E2",
    marginTop: 4,
  },
  progressSection: {
    backgroundColor: "white",
    margin: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A90E2",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 4,
  },
  selectorButton: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  selectorGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
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
  emergencyButtonContainer: {
    padding: 20,
  },
  emergencyButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  emergencyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  emergencyButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  lovedOnesList: {
    padding: 20,
  },
  lovedOneItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lovedOneName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  taskItemContainer: {
    marginBottom: 15,
  },
});

export default DailyTasksScreen;
