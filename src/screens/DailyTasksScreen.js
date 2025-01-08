import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getAllLovedOnes } from "../api/Users";
import { useUser } from "../api/UserContext";

const DailyTasksScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("6");
  const [selectedLovedOne, setSelectedLovedOne] = useState(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const { token } = useUser();

  const handleTaskPress = (task) => {
    // Navigate to task details with the task data
    navigation.navigate("TaskDetails", { task });
  };

  // Fetch loved ones
  const { data: lovedOnes, isLoading: loadingLovedOnes } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
    enabled: true,
  });

  const dates = [
    { day: "SUN", date: "5" },
    { day: "MON", date: "6" },
    { day: "TUE", date: "7" },
    { day: "WED", date: "8" },
    { day: "THU", date: "9" },
  ];

  const allTasks = [
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

  // First filter by loved one, then by date
  const filteredTasks = allTasks
    .filter(
      (task) => !selectedLovedOne || task.assignedTo === selectedLovedOne.name
    )
    .filter((task) => task.date === selectedDate);

  // Calculate progress
  const completedTasks = filteredTasks.filter((task) => task.completed).length;
  const totalTasks = filteredTasks.length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateTask")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={48} color="#4A90E2" />
        </View>
        <Text style={styles.progressTitle}>TODAY'S PROGRESS</Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {progressPercentage.toFixed(0)}% of care plan is completed!
        </Text>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarSection}>
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
      </View>

      {/* Loved One Selector */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setSelectorVisible(true)}
      >
        <Ionicons name="person" size={20} color="#4A90E2" />
        <Text style={styles.selectorText}>
          {selectedLovedOne ? selectedLovedOne.name : "View All Members"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#4A90E2" />
      </TouchableOpacity>

      {/* Tasks List */}
      <ScrollView style={styles.taskList}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskItem}
              onPress={() => handleTaskPress(task)}
            >
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskDetails}>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.timeText}>{task.time}</Text>
                  </View>
                  <View style={styles.assigneeContainer}>
                    <Text style={styles.assigneeLabel}>Assigned to</Text>
                    <Text style={styles.assigneeName}>{task.assignedTo}</Text>
                  </View>
                </View>
              </View>
              <Ionicons
                name={task.completed ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={task.completed ? "#4CAF50" : "#666"}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noTasksContainer}>
            <Text style={styles.noTasksText}>No tasks for this date</Text>
          </View>
        )}
      </ScrollView>

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
    backgroundColor: "#F5F6FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  progressSection: {
    padding: 16,
    alignItems: "center",
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E1E1E1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginVertical: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    color: "#333",
    marginTop: 8,
  },
  calendarSection: {
    padding: 16,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  datesContainer: {
    flexDirection: "row",
    marginHorizontal: -4,
  },
  dateItem: {
    width: 64,
    height: 80,
    borderRadius: 32,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  selectedDate: {
    backgroundColor: "#4A90E2",
  },
  dayText: {
    fontSize: 12,
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
    position: "absolute",
    bottom: 8,
  },
  addButton: {
    backgroundColor: "#4A90E2",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  taskDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 4,
    color: "#666",
  },
  assigneeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  assigneeLabel: {
    color: "#666",
    marginRight: 4,
  },
  assigneeName: {
    color: "#4A90E2",
  },
  noTasksContainer: {
    padding: 32,
    alignItems: "center",
  },
  noTasksText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  lovedOnesList: {
    padding: 16,
  },
  lovedOneItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lovedOneName: {
    fontSize: 16,
    color: "#333",
  },
});

export default DailyTasksScreen;
