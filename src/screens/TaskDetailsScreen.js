import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Pressable,
  Keyboard,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQueryClient } from "@tanstack/react-query";

const { width } = Dimensions.get("window");

const TaskDetailsScreen = ({ route, navigation }) => {
  const { task } = route.params;
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(task.note || "");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const queryClient = useQueryClient();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const noteSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      () => setKeyboardVisible(true)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      "keyboardWillHide",
      () => setKeyboardVisible(false)
    );

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(noteSlideAnim, {
      toValue: isEditingNote ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isEditingNote]);

  const handleSaveNote = async () => {
    try {
      // Update the task in the cache
      const existingTasks = queryClient.getQueryData(["tasks"]) || [];
      const updatedTasks = existingTasks.map((t) =>
        t.id === task.id ? { ...t, note: noteText } : t
      );
      queryClient.setQueryData(["tasks"], updatedTasks);

      // TODO: Add API call to save note
      Alert.alert("Success", "Note saved successfully!");
      setIsEditingNote(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save note. Please try again.");
    }
  };

  const handleToggleComplete = async () => {
    try {
      // Update the task in the cache
      const existingTasks = queryClient.getQueryData(["tasks"]) || [];
      const updatedTasks = existingTasks.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      );
      queryClient.setQueryData(["tasks"], updatedTasks);

      // TODO: Add API call to update task status
      Alert.alert(
        "Success",
        `Task marked as ${task.completed ? "incomplete" : "complete"}!`
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update task status. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
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
              <LinearGradient
                colors={["#4A90E2", "#357ABD"]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="time-outline" size={20} color="white" />
              </LinearGradient>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>
                  {task.startTime
                    ? new Date(task.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "Not set"}
                  {task.startTime && task.endTime ? " - " : ""}
                  {task.endTime
                    ? new Date(task.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : ""}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <LinearGradient
                colors={["#34A853", "#2E8B4A"]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="heart-outline" size={20} color="white" />
              </LinearGradient>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Loved One</Text>
                <Text style={styles.detailValue}>
                  {task.lovedOne?.name || "Not assigned"}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <LinearGradient
                colors={["#FBBC05", "#F5A623"]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="person-outline" size={20} color="white" />
              </LinearGradient>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Assigned To</Text>
                <Text style={styles.detailValue}>
                  {task.assignedTo || "Not assigned"}
                </Text>
              </View>
            </View>

            {task.description ? (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.descriptionText}>{task.description}</Text>
              </View>
            ) : null}

            <View style={styles.notesSection}>
              <View style={styles.noteHeader}>
                <Text style={styles.notesTitle}>Notes</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.editButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setIsEditingNote(!isEditingNote)}
                >
                  <Ionicons
                    name={isEditingNote ? "save-outline" : "create-outline"}
                    size={24}
                    color="#4A90E2"
                  />
                </Pressable>
              </View>
              <Animated.View
                style={[
                  styles.noteContent,
                  {
                    transform: [
                      {
                        scale: noteSlideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.98],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {isEditingNote ? (
                  <View style={styles.noteEditContainer}>
                    <TextInput
                      style={styles.noteInput}
                      multiline
                      value={noteText}
                      onChangeText={setNoteText}
                      placeholder="Add your notes here..."
                      placeholderTextColor="#999"
                      textAlignVertical="top"
                      autoFocus
                    />
                    <Pressable
                      style={({ pressed }) => [
                        styles.saveNoteButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={handleSaveNote}
                    >
                      <LinearGradient
                        colors={["#4A90E2", "#357ABD"]}
                        style={styles.saveNoteGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Ionicons name="save-outline" size={20} color="white" />
                        <Text style={styles.saveNoteButtonText}>Save Note</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.noteText}>
                    {noteText || "No notes added yet"}
                  </Text>
                )}
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {!isKeyboardVisible && (
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              task.completed ? styles.reopenButton : styles.completeButton,
              pressed && styles.pressed,
            ]}
            onPress={handleToggleComplete}
          >
            <LinearGradient
              colors={
                task.completed ? ["#EA4335", "#D32F2F"] : ["#34A853", "#2E8B4A"]
              }
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name={task.completed ? "refresh" : "checkmark-circle"}
                size={24}
                color="white"
              />
              <Text style={styles.actionButtonText}>
                {task.completed ? "Reopen Task" : "Mark as Complete"}
              </Text>
            </LinearGradient>
          </Pressable>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    fontWeight: "700",
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
    fontWeight: "600",
  },
  completedText: {
    color: "#34A853",
  },
  pendingText: {
    color: "#FBBC05",
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
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
    fontWeight: "600",
  },
  descriptionSection: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  notesSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  editButton: {
    padding: 8,
  },
  noteContent: {
    minHeight: 100,
  },
  noteEditContainer: {
    gap: 16,
  },
  noteInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#333",
    height: 120,
    textAlignVertical: "top",
  },
  noteText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  saveNoteButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  saveNoteGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 8,
  },
  saveNoteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default TaskDetailsScreen;
