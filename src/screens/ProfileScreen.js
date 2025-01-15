import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../api/UserContext";
import {
  getAllLovedOnes,
  addLovedOne,
  deleteLovedOne,
  uploadProfileImage,
  uploadLovedOneProfileImage,
} from "../api/Users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  clearUserData,
  setProfileImage,
  getProfileImage,
} from "../api/storage";
import NotificationsModal from "../components/NotificationsModal";
import {
  getInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../api/Invite";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

// Memoized components for better performance
const MenuButton = memo(({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <LinearGradient
      colors={["#ffffff", "#f8f9fa"]}
      style={styles.menuItemGradient}
    >
      <Ionicons name={icon} size={24} color="#4A90E2" />
      <Text style={styles.menuText}>{text}</Text>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </LinearGradient>
  </TouchableOpacity>
));

// Custom Image component with authentication
const AuthImage = ({ source, style, onError }) => {
  const { token } = useUser();
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(source.uri, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setImageUri(source.uri);
        } else {
          onError &&
            onError({ nativeEvent: { error: "Failed to load image" } });
        }
      } catch (error) {
        onError && onError({ nativeEvent: { error: error.message } });
      }
    };

    fetchImage();
  }, [source.uri, token]);

  if (!imageUri) {
    return <Ionicons name="person" size={style.width / 2.5} color="#4A90E2" />;
  }

  return <Image source={{ uri: imageUri }} style={style} onError={onError} />;
};

const LovedOneCard = memo(
  ({ lovedOne, onPress, onDelete, animValue, onImagePick, isLoading }) => {
    const { user } = useUser();
    const isShared = lovedOne.caregivers?.[0] !== user?._id;

    const imageUrl = lovedOne.profileImage?.startsWith("http")
      ? lovedOne.profileImage
      : lovedOne.profileImage
      ? `https://seal-app-doaaw.ondigitalocean.app/uploads/${lovedOne.profileImage.replace(
          /^\/+/,
          ""
        )}`
      : null;

    console.log(`Task count for ${lovedOne.name}:`, {
      tasks: lovedOne.tasks,
      total: lovedOne.tasks?.total || 0,
      pending: lovedOne.tasks?.pending?.length || 0,
      completed: lovedOne.tasks?.completed?.length || 0,
    });

    return (
      <Animated.View
        style={[
          styles.lovedOneItem,
          {
            opacity: animValue,
            transform: [
              {
                translateX: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.lovedOneContent,
            pressed && styles.pressed,
          ]}
          onPress={onPress}
        >
          <View
            style={[
              styles.lovedOneGradient,
              isShared && styles.sharedLovedOneGradient,
            ]}
          >
            <View style={styles.lovedOneHeader}>
              <View style={styles.lovedOneIconContainer}>
                <View
                  style={[
                    styles.iconContainer,
                    isShared && styles.sharedIconContainer,
                  ]}
                >
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.lovedOneProfileImageStyle}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={24} color="#4A90E2" />
                  )}
                  <Pressable
                    style={styles.cameraIconOverlay}
                    onPress={() => onImagePick(lovedOne._id)}
                  >
                    <Ionicons name="camera" size={12} color="white" />
                  </Pressable>
                </View>
              </View>
              <View style={styles.lovedOneInfo}>
                <View style={styles.nameContainer}>
                  <Text style={styles.lovedOneName}>{lovedOne.name}</Text>
                  {lovedOne.caregivers?.length >= 2 && (
                    <View style={styles.multiCaregiversBadge}>
                      <Ionicons name="people" size={14} color="#4A90E2" />
                    </View>
                  )}
                </View>
                <View style={styles.ageContainer}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />
                  <Text style={styles.lovedOneAge}>
                    {lovedOne.age} years old
                  </Text>
                </View>
                {lovedOne.caregivers &&
                  lovedOne.caregivers.length > 0 &&
                  lovedOne.caregivers[0]._id !== user?._id && (
                    <View
                      style={[
                        styles.sharedBadge,
                        { backgroundColor: "#4A90E2" },
                      ]}
                    >
                      <Ionicons
                        name="people-outline"
                        size={12}
                        color="#FFFFFF"
                      />
                      <Text
                        style={[styles.sharedBadgeText, { color: "#FFFFFF" }]}
                      >
                        Shared with you
                      </Text>
                    </View>
                  )}
              </View>
              {!isShared && (
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deletePressed,
                  ]}
                  onPress={() => onDelete(lovedOne._id)}
                >
                  <View style={styles.deleteButtonInner}>
                    <Ionicons name="trash-outline" size={20} color="#EA4335" />
                  </View>
                </Pressable>
              )}
            </View>

            {lovedOne.medical_history && (
              <View style={styles.medicalHistoryContainer}>
                <View style={styles.medicalHistoryHeader}>
                  <Ionicons name="medical-outline" size={16} color="#4A90E2" />
                  <Text style={styles.medicalHistoryLabel}>
                    Medical History
                  </Text>
                </View>
                <Text style={styles.medicalHistoryText}>
                  {lovedOne.medical_history}
                </Text>
              </View>
            )}

            <View style={styles.cardFooter}>
              <View style={styles.footerInfo}>
                <View style={styles.taskCount}>
                  <Ionicons name="list-outline" size={24} color="#4A90E2" />
                  <Text style={styles.taskCountText}>
                    {lovedOne.tasks?.total || 0} Tasks
                  </Text>
                </View>
                <View style={styles.caregiverCount}>
                  <Ionicons name="people-outline" size={14} color="#FBBC05" />
                  <Text style={styles.caregiverCountText}>
                    {lovedOne.caregivers?.length || 0} Caregivers
                  </Text>
                </View>
              </View>
              <View style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#4A90E2" />
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }
);

const EditButton = ({ loading, children }) => {
  if (loading) {
    return (
      <ActivityIndicator
        style={[
          styles.editButton,
          { backgroundColor: "rgba(255,255,255,0.3)" },
        ]}
        color="white"
        size="small"
      />
    );
  }

  try {
    return (
      <BlurView intensity={80} tint="light" style={styles.editButton}>
        <View style={styles.editButtonInner}>{children}</View>
      </BlurView>
    );
  } catch (error) {
    // Fallback if BlurView is not supported
    return (
      <View
        style={[
          styles.editButton,
          { backgroundColor: "rgba(255,255,255,0.3)" },
        ]}
      >
        <View style={styles.editButtonInner}>{children}</View>
      </View>
    );
  }
};

const ModalBackground = ({ children }) => {
  try {
    return (
      <BlurView intensity={80} tint="dark" style={styles.modalContainer}>
        {children}
      </BlurView>
    );
  } catch (error) {
    // Fallback if BlurView is not supported
    return (
      <View
        style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        {children}
      </View>
    );
  }
};

const AddLovedOneModal = memo(({ visible, onClose, onAdd, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    medical_history: "",
  });

  useEffect(() => {
    if (visible) {
      setFormData({ name: "", age: "", medical_history: "" });
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    onAdd(formData);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Loved One</Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Enter age"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Medical History</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.medical_history}
                onChangeText={(text) =>
                  setFormData({ ...formData, medical_history: text })
                }
                placeholder="Enter medical history"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                styles.addButtonModal,
                pressed && styles.pressed,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Add</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useUser();
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const queryClient = useQueryClient();

  // Keep the fetchInvitations function
  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await getInvitations();
      console.log("Invitations response:", response);

      // Check if response is an array or has an invitations property
      const invitationsData = Array.isArray(response)
        ? response
        : response.invitations || [];
      console.log("Processed invitations data:", invitationsData);

      setInvitations(invitationsData);
      setNotificationCount(invitationsData.length);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      setIsLoading(false);
    }
  };

  // Add debug logging to useEffect
  useEffect(() => {
    console.log("Fetching invitations on mount");
    fetchInvitations();
  }, []);

  // Add debug logging to useFocusEffect
  useFocusEffect(
    useCallback(() => {
      console.log("Fetching invitations on focus");
      fetchInvitations();
    }, [])
  );

  const loadProfileImage = async () => {
    try {
      const savedImage = await getProfileImage();
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  };

  useEffect(() => {
    loadProfileImage();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const handleNotificationPress = () => {
    setShowNotifications(true);
  };

  const handleApproveInvitation = async (invitationId) => {
    try {
      await acceptInvitation(invitationId);
      await fetchInvitations();
      queryClient.invalidateQueries(["lovedOnes"]);
      Alert.alert("Success", "Invitation accepted successfully!");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      Alert.alert("Error", "Failed to accept invitation");
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      await rejectInvitation(invitationId);
      await fetchInvitations();
      queryClient.invalidateQueries(["lovedOnes"]);
      Alert.alert("Success", "Invitation rejected successfully!");
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      Alert.alert("Error", "Failed to reject invitation");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationPress}
          >
            <Ionicons name="mail-outline" size={24} color="white" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>
                  {notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <LinearGradient
                colors={["#4A90E2", "#357ABD"]}
                style={styles.profileImagePlaceholder}
              >
                <Ionicons name="person" size={48} color="white" />
              </LinearGradient>
            )}
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <MenuButton
            icon="people-outline"
            text="My Roles"
            onPress={() => navigation.navigate("MyRoles")}
          />
          <MenuButton
            icon="lock-closed-outline"
            text="Change Password"
            onPress={() => navigation.navigate("EditProfile")}
          />
          <MenuButton
            icon="log-out-outline"
            text="Logout"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        invitations={invitations}
        isLoading={isLoading}
        onApprove={handleApproveInvitation}
        onReject={handleRejectInvitation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EA4335",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  notificationCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#6B7280",
  },
  section: {
    backgroundColor: "white",
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItem: {
    paddingHorizontal: 20,
  },
  menuItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  pressed: {
    opacity: 0.8,
  },
});

export default ProfileScreen;
