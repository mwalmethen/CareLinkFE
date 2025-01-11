import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteNote } from "../api/CreateTask";

const NoteDetailsScreen = ({ route, navigation }) => {
  const { note, lovedOneId } = route.params;
  const queryClient = useQueryClient();

  const deleteNoteMutation = useMutation({
    mutationFn: ({ lovedOneId, noteId }) => deleteNote(lovedOneId, noteId),
    onMutate: async ({ lovedOneId, noteId }) => {
      await queryClient.cancelQueries({ queryKey: ["notes", lovedOneId] });
      const previousNotes = queryClient.getQueryData(["notes", lovedOneId]);

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
      navigation.goBack();
    },
    onSettled: (_, __, { lovedOneId }) => {
      queryClient.invalidateQueries({ queryKey: ["notes", lovedOneId] });
    },
  });

  const handleDeleteNote = () => {
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
              lovedOneId,
              noteId: note._id,
            });
          },
        },
      ],
      { cancelable: true }
    );
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
        <Text style={styles.headerTitle}>Note Details</Text>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
          onPress={handleDeleteNote}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </Pressable>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.noteCard}>
          <View style={styles.metadataSection}>
            <View style={styles.metadataItem}>
              <LinearGradient
                colors={["#4A90E2", "#357ABD"]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color="white"
                />
              </LinearGradient>
              <View style={styles.metadataText}>
                <Text style={styles.metadataLabel}>Created By</Text>
                <Text style={styles.metadataValue}>
                  {note.caregiver?.name || "Unknown"}
                </Text>
              </View>
            </View>

            <View style={styles.metadataItem}>
              <LinearGradient
                colors={["#34A853", "#2E8B4A"]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="calendar-outline" size={20} color="white" />
              </LinearGradient>
              <View style={styles.metadataText}>
                <Text style={styles.metadataLabel}>Date</Text>
                <Text style={styles.metadataValue}>
                  {new Date(note.date).toLocaleDateString([], {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.metadataItem}>
              <LinearGradient
                colors={["#FBBC05", "#F5A623"]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="time-outline" size={20} color="white" />
              </LinearGradient>
              <View style={styles.metadataText}>
                <Text style={styles.metadataLabel}>Time</Text>
                <Text style={styles.metadataValue}>
                  {new Date(note.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.noteContent}>
            <Text style={styles.noteContentLabel}>Note Content</Text>
            <View style={styles.noteTextContainer}>
              <Text style={styles.noteText}>{note.note}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flex: 1,
    padding: 20,
  },
  noteCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metadataSection: {
    marginBottom: 24,
  },
  metadataItem: {
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
  metadataText: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  noteContent: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 20,
  },
  noteContentLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  noteTextContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  noteText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
});

export default NoteDetailsScreen;
