import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const DailyTasksScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("6"); // Current selected date

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
      date: "6", // Monday's task
    },
    {
      id: 2,
      title: "Medication for heart condition",
      time: "01:30 PM - 03:00 PM",
      assignedTo: "Abdullah",
      completed: false,
      date: "6", // Monday's task
    },
    {
      id: 3,
      title: "Walk in the neighborhood",
      time: "04:30 PM - 05:00 PM",
      assignedTo: "Mother",
      completed: false,
      date: "7", // Tuesday's task
    },
    {
      id: 4,
      title: "Blood pressure check",
      time: "09:00 AM - 09:30 AM",
      assignedTo: "Father",
      completed: false,
      date: "8", // Wednesday's task
    },
    {
      id: 5,
      title: "Doctor's appointment",
      time: "11:00 AM - 12:00 PM",
      assignedTo: "Mother",
      completed: false,
      date: "5", // Sunday's task
    },
  ];

  // Filter tasks based on selected date
  const filteredTasks = allTasks.filter((task) => task.date === selectedDate);

  // Calculate progress for the selected date
  const completedTasks = filteredTasks.filter((task) => task.completed).length;
  const totalTasks = filteredTasks.length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Tasks</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

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

      <ScrollView style={styles.taskList}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskHeader}>
                <Text
                  style={[
                    styles.taskTitle,
                    task.completed && styles.completedTaskTitle,
                  ]}
                >
                  {task.title}
                </Text>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                </TouchableOpacity>
              </View>
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
              <TouchableOpacity
                style={[styles.checkbox, task.completed && styles.checkedBox]}
              >
                {task.completed && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.noTasksContainer}>
            <Text style={styles.noTasksText}>No tasks for this date</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CreateTask")}
      >
        <Text style={styles.addButtonText}>+ New Task</Text>
      </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
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
  taskList: {
    flex: 1,
    padding: 16,
  },
  taskItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    position: "relative",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  completedTaskTitle: {
    color: "#666",
  },
  strikethrough: {
    textDecorationLine: "line-through",
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
  checkbox: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  addButton: {
    margin: 16,
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  taskIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A90E2",
    position: "absolute",
    bottom: 8,
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  noTasksText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default DailyTasksScreen;
