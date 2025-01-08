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

const DailyTasksScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("6");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [noteText, setNoteText] = useState("");

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

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setShowTaskDetailModal(true);
  };

  const handleAddNote = () => {
    setShowTaskDetailModal(false);
    setNoteText(selectedTask.note);
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (selectedTask) {
      selectedTask.note = noteText;
    }
    setShowNoteModal(false);
  };

  const toggleTaskCompletion = () => {
    if (selectedTask) {
      selectedTask.completed = !selectedTask.completed;
      setSelectedTask({ ...selectedTask });
    }
  };

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
            <TouchableOpacity
              key={task.id}
              style={styles.taskItem}
              onPress={() => handleTaskPress(task)}
            >
              <View style={styles.taskHeader}>
                <Text
                  style={[
                    styles.taskTitle,
                    task.completed && styles.completedTaskTitle,
                  ]}
                >
                  {task.title}
                </Text>
                {task.note && (
                  <Ionicons name="document-text" size={20} color="#4A90E2" />
                )}
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
            </TouchableOpacity>
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("EmergencyButton")}
      >
        <Text style={styles.addButtonText}>+ Emergency Button</Text>
      </TouchableOpacity>

      {/* Task Detail Modal */}
      <Modal
        visible={showTaskDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaskDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Task Details</Text>
              <TouchableOpacity onPress={() => setShowTaskDetailModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <View style={styles.taskDetailContent}>
                <View style={styles.taskDetailRow}>
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color="#4A90E2"
                  />
                  <Text style={styles.taskDetailTitle}>
                    {selectedTask.title}
                  </Text>
                </View>

                <View style={styles.taskDetailRow}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.taskDetailText}>{selectedTask.time}</Text>
                </View>

                <View style={styles.taskDetailRow}>
                  <Ionicons name="person-outline" size={20} color="#666" />
                  <Text style={styles.taskDetailText}>
                    Assigned to{" "}
                    <Text style={styles.taskDetailHighlight}>
                      {selectedTask.assignedTo}
                    </Text>
                  </Text>
                </View>

                <View style={styles.taskDetailRow}>
                  <Ionicons name="checkbox-outline" size={20} color="#666" />
                  <Text style={styles.taskDetailText}>
                    Status:{" "}
                    <Text
                      style={[
                        styles.taskDetailHighlight,
                        {
                          color: selectedTask.completed ? "#34A853" : "#EA4335",
                        },
                      ]}
                    >
                      {selectedTask.completed ? "Completed" : "Pending"}
                    </Text>
                  </Text>
                </View>

                {selectedTask.note && (
                  <View style={styles.taskDetailRow}>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#666"
                    />
                    <Text style={styles.taskDetailText}>
                      Note: {selectedTask.note}
                    </Text>
                  </View>
                )}

                <View style={styles.taskDetailActions}>
                  <TouchableOpacity
                    style={[styles.taskDetailButton, styles.noteButton]}
                    onPress={handleAddNote}
                  >
                    <Ionicons name="create-outline" size={20} color="white" />
                    <Text style={styles.taskDetailButtonText}>
                      {selectedTask.note ? "Edit Note" : "Add Note"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.taskDetailButton,
                      selectedTask.completed
                        ? styles.uncompleteButton
                        : styles.completeButton,
                    ]}
                    onPress={toggleTaskCompletion}
                  >
                    <Ionicons
                      name={
                        selectedTask.completed
                          ? "close-circle-outline"
                          : "checkmark-circle-outline"
                      }
                      size={20}
                      color="white"
                    />
                    <Text style={styles.taskDetailButtonText}>
                      {selectedTask.completed
                        ? "Mark Incomplete"
                        : "Mark Complete"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNoteModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Note</Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTaskTitle}>{selectedTask?.title}</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Write your note here..."
              value={noteText}
              onChangeText={setNoteText}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveNote}
            >
              <Text style={styles.saveButtonText}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  modalTaskTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    padding: 16,
    height: 150,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  taskDetailContent: {
    gap: 16,
  },
  taskDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  taskDetailTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  taskDetailText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  taskDetailHighlight: {
    color: "#4A90E2",
    fontWeight: "500",
  },
  taskDetailActions: {
    flexDirection: "column",
    gap: 12,
    marginTop: 24,
  },
  taskDetailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  noteButton: {
    backgroundColor: "#4A90E2",
  },
  completeButton: {
    backgroundColor: "#34A853",
  },
  uncompleteButton: {
    backgroundColor: "#EA4335",
  },
  taskDetailButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DailyTasksScreen;
