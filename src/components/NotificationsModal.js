import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

const NotificationsModal = ({
  visible,
  onClose,
  invitations = [],
  isLoading,
  onApprove,
  onReject,
}) => {
  const [acceptingId, setAcceptingId] = useState(null);

  const handleAccept = async (invitationId) => {
    try {
      setAcceptingId(invitationId);
      await onApprove(invitationId);
    } finally {
      setAcceptingId(null);
    }
  };

  const renderInvitation = (invitation) => (
    <View key={invitation._id} style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <LinearGradient
          colors={["#4A90E2", "#357ABD"]}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="people-outline" size={24} color="white" />
        </LinearGradient>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.invitationText}>
          <Text style={styles.highlightText}>
            {invitation.invitedBy?.name || "Someone"}
          </Text>{" "}
          has invited you to be a caregiver
        </Text>
        <Text style={styles.lovedOneText}>
          for{" "}
          <Text style={styles.highlightText}>
            {invitation.lovedOne?.name || "a loved one"}
          </Text>
        </Text>
        <Text style={styles.notificationTime}>
          {new Date(invitation.createdAt).toLocaleDateString()} at{" "}
          {new Date(invitation.createdAt).toLocaleTimeString()}
        </Text>
        <View style={styles.actionButtons}>
          <Pressable
            style={[
              styles.actionButton,
              styles.approveButton,
              acceptingId === invitation._id && styles.actionButtonDisabled,
            ]}
            onPress={() => handleAccept(invitation._id)}
            disabled={acceptingId === invitation._id}
          >
            {acceptingId === invitation._id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-outline" size={18} color="white" />
                <Text style={styles.actionButtonText}>Accept</Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={[
              styles.actionButton,
              styles.rejectButton,
              acceptingId === invitation._id && styles.actionButtonDisabled,
            ]}
            onPress={() => onReject(invitation._id)}
            disabled={acceptingId === invitation._id}
          >
            <Ionicons name="close-outline" size={18} color="white" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#4A90E2", "#357ABD"]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.headerTitle}>Invitations</Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
          </LinearGradient>

          <ScrollView
            style={styles.notificationsList}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>Loading invitations...</Text>
              </View>
            ) : invitations.length > 0 ? (
              invitations.map((invitation) => renderInvitation(invitation))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="mail-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No invitations yet</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    paddingTop: 100,
  },
  modalContainer: {
    width: "90%",
    maxHeight: height * 0.8,
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  notificationIcon: {
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  notificationContent: {
    flex: 1,
    paddingRight: 8,
  },
  notificationText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  approveButton: {
    backgroundColor: "#34A853",
  },
  rejectButton: {
    backgroundColor: "#EA4335",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  highlightText: {
    color: "#4A90E2",
    fontWeight: "700",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  invitationText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 8,
  },
  lovedOneText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 8,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
});

export default NotificationsModal;
