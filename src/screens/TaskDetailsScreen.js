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
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { deleteTask, createNote, getNote, deleteNote } from "../api/CreateTask";

const { width } = Dimensions.get("window");

const TaskDetailsScreen = ({ route, navigation }) => {
  const { task } = route.params;
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Update note query to handle loading and error states better
  const { data: noteData, isLoading: isLoadingNote } = useQuery({
    queryKey: ["notes", task.loved_one._id],
    queryFn: () => {
      console.log("Fetching notes for loved one:", task.loved_one._id);
      return getNote(task.loved_one._id);
    },
    enabled: !!task.loved_one._id,
    onSuccess: (data) => {
      console.log("Notes array received:", data);
      if (Array.isArray(data) && data.length > 0) {
        // Sort notes by date in descending order and take the most recent one
        const sortedNotes = [...data].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        const mostRecentNote = sortedNotes[0];
        console.log("Most recent note:", mostRecentNote);
        setNoteText(mostRecentNote.note);
      } else if (data && data.note) {
        // Handle single note response
        console.log("Single note received:", data);
        setNoteText(data.note);
      } else {
        console.log("No notes found");
        setNoteText("");
      }
    },
    onError: (error) => {
      console.error("Error fetching notes:", error);
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
    refetchInterval: 3000, // Refetch every 3 seconds
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({
        queryKey: ["tasks", task.loved_one._id],
      });

      const previousTasks = queryClient.getQueryData([
        "tasks",
        task.loved_one._id,
      ]);

      queryClient.setQueryData(["tasks", task.loved_one._id], (old) => {
        if (!old) return old;
        return {
          ...old,
          pending: old.pending.filter((t) => t._id !== taskId),
          total: (old.total || 0) - 1,
        };
      });

      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      queryClient.setQueryData(
        ["tasks", task.loved_one._id],
        context.previousTasks
      );
      Alert.alert("Error", "Failed to delete task. Please try again.");
    },
    onSuccess: () => {
      Alert.alert("Success", "Task deleted successfully");
      navigation.goBack();
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", task.loved_one._id],
      });
    },
  });

  // Update note mutation
  const noteMutation = useMutation({
    mutationFn: ({ lovedOneId, noteData }) => createNote(lovedOneId, noteData),
    onError: (error) => {
      Alert.alert("Error", "Failed to save note. Please try again.");
      console.error("Error saving note:", error);
    },
    onSuccess: async (data) => {
      console.log("Note creation response:", data);

      // Set the note text
      setNoteText(noteText);

      // Show success message and close edit mode
      Alert.alert("Success", "Note saved successfully!");
      setIsEditingNote(false);

      // Invalidate and refetch notes immediately
      await queryClient.invalidateQueries(["notes", task.loved_one._id]);
      queryClient.refetchQueries(["notes", task.loved_one._id]);
    },
  });

  // Update delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: ({ lovedOneId, noteId }) => deleteNote(lovedOneId, noteId),
    onMutate: async ({ lovedOneId, noteId }) => {
      await queryClient.cancelQueries({ queryKey: ["notes", lovedOneId] });
      const previousNotes = queryClient.getQueryData(["notes", lovedOneId]);

      // Optimistically remove the note
      queryClient.setQueryData(["notes", lovedOneId], (old) => {
        if (!old) return old;
        return old.filter((note) => note._id !== noteId);
      });

      return { previousNotes };
    },
    onError: (err, { lovedOneId }, context) => {
      queryClient.setQueryData(["notes", lovedOneId], context.previousNotes);
      Alert.alert("Error", "Failed to delete note. Please try again.");
    },
    onSuccess: () => {
      Alert.alert("Success", "Note deleted successfully");
    },
    onSettled: async (_, __, { lovedOneId }) => {
      // Invalidate and refetch notes immediately
      await queryClient.invalidateQueries(["notes", lovedOneId]);
      queryClient.refetchQueries(["notes", lovedOneId]);
    },
  });

  const handleDeleteTask = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(task._id);
        },
      },
    ]);
  };

  const handleDeleteNote = (note) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteNoteMutation.mutate({
              lovedOneId: task.loved_one._id,
              noteId: note._id,
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

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
    if (!noteText.trim()) {
      Alert.alert("Error", "Please enter a note before saving.");
      return;
    }

    try {
      await noteMutation.mutateAsync({
        lovedOneId: task.loved_one._id,
        noteData: { note: noteText },
      });

      // Clear the input and close edit mode
      setNoteText("");
      setIsEditingNote(false);
      Keyboard.dismiss();

      // Immediately refetch the notes
      queryClient.invalidateQueries(["notes", task.loved_one._id]);
    } catch (error) {
      console.error("Error saving note:", error);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    try {
      await queryClient.invalidateQueries(["notes", task.loved_one._id]);
      await queryClient.refetchQueries(["notes", task.loved_one._id]);
    } finally {
      setIsRefreshing(false);
      rotateAnim.setValue(0);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
            deleteMutation.isLoading && styles.disabled,
          ]}
          onPress={handleDeleteTask}
          disabled={deleteMutation.isLoading}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </Pressable>
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
                task.status === "COMPLETED"
                  ? styles.completedBadge
                  : styles.pendingBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  task.status === "COMPLETED"
                    ? styles.completedText
                    : styles.pendingText,
                ]}
              >
                {task.status || "PENDING"}
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
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={styles.detailValue}>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleString([], {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "Not set"}
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
                  {task.loved_one?.name || "Not assigned"}
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
                  {task.assigned_to || "Not assigned"}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <LinearGradient
                colors={["#EA4335", "#D32F2F"]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="flag-outline" size={20} color="white" />
              </LinearGradient>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Priority</Text>
                <Text style={styles.detailValue}>
                  {task.priority || "Not set"}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <LinearGradient
                colors={["#9C27B0", "#7B1FA2"]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="bookmark-outline" size={20} color="white" />
              </LinearGradient>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>
                  {task.category || "Not set"}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <LinearGradient
                colors={["#607D8B", "#455A64"]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="create-outline" size={20} color="white" />
              </LinearGradient>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Created By</Text>
                <Text style={styles.detailValue}>
                  {task.created_by?.name || "Unknown"}
                </Text>
              </View>
            </View>

            {task.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.descriptionText}>{task.description}</Text>
              </View>
            )}

            <View style={styles.notesSection}>
              <View style={styles.noteHeader}>
                <Text style={styles.notesTitle}>Notes</Text>
                <View style={styles.noteHeaderButtons}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.refreshButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons
                        name="refresh-outline"
                        size={24}
                        color="#4A90E2"
                      />
                    </Animated.View>
                  </Pressable>
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
                {isLoadingNote ? (
                  <Text style={[styles.noteText, { color: "#999" }]}>
                    Loading notes...
                  </Text>
                ) : isEditingNote ? (
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
                  <View>
                    {!isLoadingNote && noteData && Array.isArray(noteData) ? (
                      <View>
                        {/* Latest Note Section */}
                        {noteData.length > 0 && (
                          <Pressable
                            style={({ pressed }) => [
                              styles.latestNoteContainer,
                              pressed && styles.noteItemPressed,
                            ]}
                            onPress={() => {
                              navigation.navigate("NoteDetails", {
                                note: noteData[0],
                                lovedOneId: task.loved_one._id,
                              });
                            }}
                          >
                            <View style={styles.latestNoteHeader}>
                              <View style={styles.latestNoteTitle}>
                                <Ionicons
                                  name="star"
                                  size={20}
                                  color="#FFD700"
                                />
                                <Text style={styles.latestNoteTitleText}>
                                  Latest Note
                                </Text>
                              </View>
                              <Text style={styles.latestNoteTime}>
                                {new Date(noteData[0].date).toLocaleString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </Text>
                            </View>
                            <Text
                              style={styles.latestNoteText}
                              numberOfLines={3}
                              ellipsizeMode="tail"
                            >
                              {noteData[0].note}
                            </Text>
                            <View style={styles.latestNoteFooter}>
                              <View style={styles.latestNoteAuthor}>
                                <Ionicons
                                  name="person-circle-outline"
                                  size={16}
                                  color="#4A90E2"
                                />
                                <Text style={styles.latestNoteAuthorText}>
                                  {noteData[0].caregiver?.name || "Unknown"}
                                </Text>
                              </View>
                              <View style={styles.latestNoteBadge}>
                                <Text style={styles.latestNoteBadgeText}>
                                  New
                                </Text>
                              </View>
                            </View>
                          </Pressable>
                        )}

                        {/* Previous Notes Section */}
                        {noteData.length > 1 && (
                          <View style={styles.previousNotesSection}>
                            <Text style={styles.previousNotesTitle}>
                              Previous Notes
                            </Text>
                            <ScrollView
                              style={styles.notesScrollView}
                              showsVerticalScrollIndicator={false}
                              contentContainerStyle={styles.notesScrollContent}
                            >
                              {noteData.slice(1).map((note, index) => (
                                <Pressable
                                  key={note._id}
                                  style={({ pressed }) => [
                                    styles.noteItem,
                                    pressed && styles.noteItemPressed,
                                  ]}
                                  onPress={() => {
                                    navigation.navigate("NoteDetails", {
                                      note,
                                      lovedOneId: task.loved_one._id,
                                    });
                                  }}
                                >
                                  <View style={styles.noteIconContainer}>
                                    <LinearGradient
                                      colors={["#4A90E2", "#357ABD"]}
                                      style={styles.noteIcon}
                                      start={{ x: 0, y: 0 }}
                                      end={{ x: 1, y: 1 }}
                                    >
                                      <Animated.View
                                        style={[
                                          styles.iconWrapper,
                                          {
                                            transform: [
                                              {
                                                scale: fadeAnim.interpolate({
                                                  inputRange: [0, 1],
                                                  outputRange: [0.8, 1],
                                                }),
                                              },
                                            ],
                                          },
                                        ]}
                                      >
                                        <Ionicons
                                          name="notifications-outline"
                                          size={20}
                                          color="white"
                                        />
                                      </Animated.View>
                                    </LinearGradient>
                                  </View>
                                  <View style={styles.noteContentWrapper}>
                                    <View style={styles.noteTextContainer}>
                                      <Text
                                        style={styles.noteText}
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                      >
                                        {note.note}
                                      </Text>
                                    </View>
                                    <View style={styles.noteMetadataWrapper}>
                                      <View style={styles.metadataLeft}>
                                        <View style={styles.metadataIcon}>
                                          <Ionicons
                                            name="person-outline"
                                            size={14}
                                            color="#666"
                                          />
                                        </View>
                                        <Text
                                          style={styles.noteMetadataText}
                                          numberOfLines={1}
                                          ellipsizeMode="tail"
                                        >
                                          {note.caregiver?.name || "Unknown"}
                                        </Text>
                                      </View>
                                      <View style={styles.metadataRight}>
                                        <View style={styles.metadataIcon}>
                                          <Ionicons
                                            name="time-outline"
                                            size={14}
                                            color="#666"
                                          />
                                        </View>
                                        <Text style={styles.noteMetadataText}>
                                          {new Date(note.date).toLocaleString(
                                            [],
                                            {
                                              month: "short",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                            }
                                          )}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                </Pressable>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View style={styles.emptyNotesContainer}>
                        <Ionicons
                          name="document-text-outline"
                          size={48}
                          color="#ccc"
                        />
                        <Text style={styles.emptyNotesText}>
                          No notes added yet
                        </Text>
                        <Text style={styles.emptyNotesSubtext}>
                          Tap the edit button to add a note
                        </Text>
                      </View>
                    )}
                  </View>
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
    marginLeft: 8,
  },
  completedBadge: {
    backgroundColor: "#E8F5E9",
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  completedText: {
    color: "#2E7D32",
  },
  pendingText: {
    color: "#EF6C00",
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
  noteHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshButton: {
    padding: 8,
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
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  noteMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  noteMetadataText: {
    fontSize: 14,
    color: "#666",
  },
  notesScrollView: {
    maxHeight: 400,
  },
  notesScrollContent: {
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  noteItem: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
    minHeight: 80,
  },
  noteItemPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "#f8f9fa",
  },
  firstNoteItem: {
    borderLeftColor: "#34A853",
    backgroundColor: "#f8f9fa",
  },
  noteIconContainer: {
    marginRight: 12,
    position: "relative",
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  latestBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#34A853",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  latestBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  noteContentWrapper: {
    flex: 1,
    justifyContent: "space-between",
  },
  noteTextContainer: {
    flex: 1,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  noteMetadataWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 6,
  },
  metadataLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  metadataRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  metadataIcon: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  noteMetadataText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  emptyNotesContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyNotesText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    fontWeight: "600",
  },
  emptyNotesSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  latestNoteContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  latestNoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  latestNoteTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  latestNoteTitleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  latestNoteTime: {
    fontSize: 14,
    color: "#666",
  },
  latestNoteText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 12,
  },
  latestNoteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  latestNoteAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  latestNoteAuthorText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "500",
  },
  latestNoteBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  latestNoteBadgeText: {
    fontSize: 12,
    color: "#34A853",
    fontWeight: "600",
  },
  previousNotesSection: {
    marginTop: 8,
  },
  previousNotesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    marginLeft: 4,
  },
});

export default TaskDetailsScreen;
