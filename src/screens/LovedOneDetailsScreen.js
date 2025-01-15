import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  getLovedOneCaregivers,
  inviteCaregiver,
  deleteLovedOne,
} from "../api/Users";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTask } from "../api/CreateTask";
import { useUser } from "../api/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const DetailItem = ({ icon, label, value, color = "#4A90E2" }) => (
  <View style={styles.detailItem}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const ActionButton = ({ icon, text, onPress, colors, style }) => (
  <Pressable
    style={({ pressed }) => [
      styles.actionButton,
      style,
      pressed && styles.pressed,
    ]}
    onPress={onPress}
  >
    <LinearGradient
      colors={colors}
      style={styles.actionGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Ionicons name={icon} size={24} color="white" />
      <Text style={styles.actionButtonText}>{text}</Text>
    </LinearGradient>
  </Pressable>
);

const InviteModal = ({
  visible,
  onClose,
  email,
  onChangeEmail,
  onSubmit,
  isLoading,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Invite Caregiver</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#64748B" />
          </Pressable>
        </View>
        <View style={styles.modalBody}>
          <Text style={styles.inputLabel}>Caregiver's Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={onChangeEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={[
              styles.modalButton,
              isLoading && styles.modalButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#4A90E2", "#357ABD"]}
              style={styles.modalButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="mail-outline" size={20} color="white" />
                  <Text style={styles.modalButtonText}>Send Invitation</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Pressable>
  </Modal>
);

const CaregiverActionsModal = ({
  visible,
  onClose,
  caregiver,
  onDeleteCaregiver,
  onChangeRole,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Caregiver Actions</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#64748B" />
          </Pressable>
        </View>
        <View style={styles.modalBody}>
          <View style={styles.caregiverModalInfo}>
            <View style={styles.caregiverModalAvatar}>
              <LinearGradient
                colors={["#4A90E2", "#357ABD"]}
                style={styles.caregiverModalAvatarGradient}
              >
                <Ionicons name="person-outline" size={32} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.caregiverModalName}>
              {caregiver?.user?.name}
            </Text>
            <Text style={styles.caregiverModalEmail}>
              {caregiver?.user?.email}
            </Text>
            <Text style={styles.caregiverModalRole}>
              {caregiver?.role} Caregiver
            </Text>
          </View>
          <View style={styles.modalActions}>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                onChangeRole(caregiver);
                onClose();
              }}
            >
              <LinearGradient
                colors={["#4A90E2", "#357ABD"]}
                style={styles.modalButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="swap-horizontal" size={20} color="white" />
                <Text style={styles.modalButtonText}>Change Role</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                onDeleteCaregiver(caregiver);
                onClose();
              }}
            >
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                style={styles.modalButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text style={styles.modalButtonText}>Delete Caregiver</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  </Modal>
);

const LovedOneDetailsScreen = ({ route, navigation }) => {
  const { lovedOne } = route.params;
  const { token, user } = useUser();
  const [caregivers, setCaregivers] = useState([]);
  const [isLoadingCaregivers, setIsLoadingCaregivers] = useState(true);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [caregiverModalVisible, setCaregiverModalVisible] = useState(false);
  const queryClient = useQueryClient();

  // Add query to fetch tasks for this loved one
  const {
    data: tasks = { pending: [], completed: [], total: 0 },
    isLoading: tasksLoading,
  } = useQuery({
    queryKey: ["tasks", lovedOne._id],
    queryFn: async () => {
      const response = await fetch(
        `https://seal-app-doaaw.ondigitalocean.app/api/tasks/loved-one/${lovedOne._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      return {
        pending: data.pending || [],
        completed: data.completed || [],
        total: data.total || 0,
      };
    },
  });

  // Add delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `https://seal-app-doaaw.ondigitalocean.app/api/caregivers/loved-ones/${lovedOne._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete loved one");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch loved ones
      queryClient.invalidateQueries(["lovedOnes"]);
      Alert.alert("Success", "Loved one deleted successfully");
      // Navigate back to loved ones list
      navigation.navigate("LovedOnesList");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete loved one");
    },
  });

  const fetchCaregivers = async () => {
    try {
      setIsLoadingCaregivers(true);
      const data = await getLovedOneCaregivers(lovedOne._id);
      setCaregivers(data || []);
    } catch (error) {
      console.error("Error fetching caregivers:", error);
    } finally {
      setIsLoadingCaregivers(false);
    }
  };

  // Fetch caregivers when component mounts
  useEffect(() => {
    fetchCaregivers();
  }, [lovedOne._id]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCreateCaregiver = () => {
    navigation.navigate("CreateCaregiver", { lovedOneId: lovedOne._id });
  };

  const handleEditLovedOne = () => {
    navigation.navigate("MedicalHistory", { lovedOne });
  };

  const handleViewTasks = () => {
    if (tasksLoading) {
      return;
    }

    if (!tasks || (!tasks.pending?.length && !tasks.completed?.length)) {
      Alert.alert(
        "No Tasks",
        "There are no tasks assigned to this loved one yet.",
        [
          {
            text: "Create Task",
            onPress: () => navigation.navigate("CreateTask", { lovedOne }),
          },
          { text: "OK", style: "cancel" },
        ]
      );
      return;
    }
    navigation.navigate("HomeTabs", {
      screen: "DailyTasks",
      params: { lovedOne },
    });
  };

  const handleInviteCaregiver = async () => {
    if (!inviteEmail) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    try {
      setIsInviting(true);
      await inviteCaregiver(inviteEmail, lovedOne._id);
      Alert.alert("Success", "Caregiver invitation sent successfully");
      setInviteModalVisible(false);
      setInviteEmail("");
      // Refresh caregivers list
      await fetchCaregivers();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to invite caregiver");
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteCaregiver = (caregiver) => {
    Alert.alert(
      "Delete Caregiver",
      `Are you sure you want to remove ${
        caregiver.user?.name || "this caregiver"
      }?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(
                `https://seal-app-doaaw.ondigitalocean.app/api/caregivers/loved-ones/${lovedOne._id}/caregivers/${caregiver._id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!response.ok) {
                const errorData = await response.json();
                if (errorData.message?.includes("creator")) {
                  Alert.alert(
                    "Permission Denied",
                    "Only the creator of this loved one can delete caregivers."
                  );
                } else {
                  Alert.alert(
                    "Error",
                    "Failed to delete caregiver. Please try again."
                  );
                }
                return;
              }

              Alert.alert("Success", "Caregiver deleted successfully");
              queryClient.invalidateQueries(["caregivers", lovedOne._id]);
            } catch (error) {
              console.error("Error deleting caregiver:", error);
              Alert.alert(
                "Error",
                "Failed to delete caregiver. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleChangeRole = (caregiver) => {
    // Will implement when API endpoint is provided
    console.log("Change role for caregiver:", caregiver);
  };

  const handleDeleteLovedOne = () => {
    try {
      // Check if there is only one caregiver
      if (caregivers?.length !== 1) {
        Alert.alert(
          "Permission Denied",
          "You can only delete a loved one when there is exactly one caregiver.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      Alert.alert(
        "Delete Loved One",
        `Are you sure you want to delete ${lovedOne.name}? This action cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteLovedOne(lovedOne._id, token);
                queryClient.invalidateQueries(["lovedOnes"]);
                Alert.alert("Success", "Loved one deleted successfully", [
                  {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } catch (error) {
                console.error("Error deleting loved one:", error);
                Alert.alert(
                  "Error",
                  error.message || "Failed to delete loved one"
                );
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Error in handleDeleteLovedOne:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
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
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>{lovedOne.name}'s Profile</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteLovedOne}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#EF4444", "#DC2626"]}
            style={styles.deleteButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Animated.View
          style={[
            styles.scrollContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Profile Card */}
          <View style={styles.card}>
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {lovedOne.profileImage ? (
                  <Image
                    source={{ uri: lovedOne.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <LinearGradient
                    colors={["#4A90E2", "#357ABD"]}
                    style={styles.profileIconGradient}
                  >
                    <Ionicons name="person" size={48} color="white" />
                  </LinearGradient>
                )}
              </View>
              <Text style={styles.name}>{lovedOne.name}</Text>
              <Text style={styles.subtitle}>{lovedOne.relationship}</Text>
            </View>
          </View>

          {/* Stats Card */}
          <View style={[styles.card, styles.statsCard]}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {tasks.pending?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Pending Tasks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: "#059669" }]}>
                  {tasks.completed?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    tasks.completed?.length > 0 ? { color: "#4A90E2" } : {},
                  ]}
                >
                  {tasks.completed?.length > 0
                    ? Math.round(
                        (tasks.completed.length /
                          (tasks.pending.length + tasks.completed.length)) *
                          100
                      )
                    : 0}
                  %
                </Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>
            </View>
          </View>

          {/* Actions Card */}
          <View style={[styles.card, styles.actionsCard]}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => setInviteModalVisible(true)}
              >
                <LinearGradient
                  colors={["#4C51BF", "#434190"]}
                  style={styles.actionGradientButton}
                >
                  <Ionicons name="mail-outline" size={24} color="white" />
                  <Text style={styles.actionButtonText}>
                    Invite{"\n"}Caregiver
                  </Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleEditLovedOne}
              >
                <LinearGradient
                  colors={["#38B2AC", "#319795"]}
                  style={styles.actionGradientButton}
                >
                  <Ionicons name="create-outline" size={24} color="white" />
                  <Text style={styles.actionButtonText}>
                    Medical{"\n"}History
                  </Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleViewTasks}
              >
                <LinearGradient
                  colors={["#ED8936", "#DD6B20"]}
                  style={styles.actionGradientButton}
                >
                  <Ionicons name="list-outline" size={24} color="white" />
                  <Text style={styles.actionButtonText}>View{"\n"}Tasks</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          {/* Caregivers Card */}
          <View style={[styles.card, styles.caregiversCard]}>
            <Text style={styles.cardTitle}>Caregivers</Text>
            {isLoadingCaregivers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>Loading caregivers...</Text>
              </View>
            ) : caregivers.length > 0 ? (
              <View style={styles.caregiversList}>
                {caregivers.map((caregiver, index) => (
                  <Pressable
                    key={caregiver._id || index}
                    style={({ pressed }) => [
                      styles.caregiverItem,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      setSelectedCaregiver(caregiver);
                      setCaregiverModalVisible(true);
                    }}
                  >
                    <View style={styles.caregiverAvatarContainer}>
                      <LinearGradient
                        colors={["#4A90E2", "#357ABD"]}
                        style={styles.caregiverAvatar}
                      >
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color="white"
                        />
                      </LinearGradient>
                    </View>
                    <View style={styles.caregiverInfo}>
                      <View style={styles.caregiverNameContainer}>
                        <Text style={styles.caregiverName}>
                          {caregiver.user.name}
                        </Text>
                        {index === 0 && (
                          <View style={styles.primaryBadge}>
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text style={styles.primaryBadgeText}>Primary</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.caregiverEmail}>
                        {caregiver.user.email}
                      </Text>
                      <Text style={styles.caregiverRole}>
                        {index === 0 ? "Primary" : "Secondary"} Caregiver
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#94A3B8"
                      style={styles.caregiverArrow}
                    />
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.noCaregivers}>
                No caregivers assigned yet
              </Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Keep existing modals */}
      <InviteModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
        email={inviteEmail}
        onChangeEmail={setInviteEmail}
        onSubmit={handleInviteCaregiver}
        isLoading={isInviting}
      />
      <CaregiverActionsModal
        visible={caregiverModalVisible}
        onClose={() => setCaregiverModalVisible(false)}
        caregiver={selectedCaregiver}
        onDeleteCaregiver={handleDeleteCaregiver}
        onChangeRole={handleChangeRole}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 16,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  profileIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  statsCard: {
    padding: 0,
    overflow: "hidden",
    backgroundColor: "white",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4A90E2",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionGradientButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },
  caregiversList: {
    gap: 12,
  },
  caregiverItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
  },
  caregiverAvatarContainer: {
    marginRight: 12,
  },
  caregiverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  caregiverInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  caregiverEmail: {
    fontSize: 14,
    color: "#4A90E2",
    marginBottom: 2,
  },
  caregiverRole: {
    fontSize: 14,
    color: "#64748B",
  },
  caregiverArrow: {
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 14,
  },
  noCaregivers: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    padding: 20,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F8FAFC",
    marginBottom: 16,
  },
  modalButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  modalButtonDisabled: {
    opacity: 0.7,
  },
  modalButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  caregiverModalInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  caregiverModalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  caregiverModalAvatarGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  caregiverModalName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  caregiverModalEmail: {
    fontSize: 16,
    color: "#4A90E2",
    marginBottom: 4,
  },
  caregiverModalRole: {
    fontSize: 14,
    color: "#64748B",
  },
  modalActions: {
    gap: 12,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  caregiverNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  primaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  primaryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D97706",
  },
});

export default LovedOneDetailsScreen;
