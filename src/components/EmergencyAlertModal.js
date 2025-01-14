import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EmergencyAlertModal = ({ visible, alert, onClose }) => {
  if (!alert) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "#EA4335";
      case "HIGH":
        return "#FBBC05";
      case "CRITICAL":
        return "#DB4437";
      default:
        return "#34A853";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Emergency Alert Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Requester</Text>
              <Text style={styles.value}>{alert.requester?.name}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeContainer}>
                <Text style={styles.value}>
                  {alert.type.replace(/_/g, " ")}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Priority</Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(alert.priority) },
                ]}
              >
                <Text style={styles.priorityText}>{alert.priority}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{alert.location}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.description}>{alert.description}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Response Needed By</Text>
              <Text style={styles.value}>
                {formatDate(alert.response_needed_by)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Status</Text>
              <Text
                style={[
                  styles.statusBadge,
                  { color: alert.status === "PENDING" ? "#FBBC05" : "#34A853" },
                ]}
              >
                {alert.status}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Created At</Text>
              <Text style={styles.value}>{formatDate(alert.createdAt)}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    color: "white",
    fontWeight: "bold",
  },
  typeContainer: {
    backgroundColor: "#E3F2FD",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadge: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EmergencyAlertModal;
