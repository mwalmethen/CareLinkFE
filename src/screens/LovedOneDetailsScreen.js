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
import { getLovedOneCaregivers, inviteCaregiver } from "../api/Users";
import { useQuery } from "@tanstack/react-query";
import { getTask } from "../api/CreateTask";
import { useUser } from "../api/UserContext";

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
                styles.deleteButton,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                onDeleteCaregiver(caregiver);
                onClose();
              }}
            >
              <LinearGradient
                colors={["#EA4335", "#D32F2F"]}
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
  const { token } = useUser();
  const [caregivers, setCaregivers] = useState([]);
  const [isLoadingCaregivers, setIsLoadingCaregivers] = useState(true);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [caregiverModalVisible, setCaregiverModalVisible] = useState(false);

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

  // Add these placeholder functions (to be implemented later with API endpoints)
  const handleDeleteCaregiver = (caregiver) => {
    // Will implement when API endpoint is provided
    console.log("Delete caregiver:", caregiver);
  };

  const handleChangeRole = (caregiver) => {
    // Will implement when API endpoint is provided
    console.log("Change role for caregiver:", caregiver);
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
        <Text style={styles.headerTitle}>{lovedOne.name}'s Profile</Text>
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
                  {tasks.pending.length + tasks.completed.length}
                </Text>
                <Text style={styles.statLabel}>Tasks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{caregivers.length || 0}</Text>
                <Text style={styles.statLabel}>Caregivers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {tasks.completed.length > 0
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
                  <Text style={styles.actionButtonText}>Health{"\n"}Info</Text>
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
                      <Text style={styles.caregiverName}>
                        {caregiver.user.name}
                      </Text>
                      <Text style={styles.caregiverEmail}>
                        {caregiver.user.email}
                      </Text>
                      <Text style={styles.caregiverRole}>
                        {caregiver.role} Caregiver
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
    marginLeft: 16,
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
    backgroundColor: "#FEE2E2",
  },
});

export default LovedOneDetailsScreen;
