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
            <Ionicons name="close" size={24} color="#666" />
          </Pressable>
        </View>
        <View style={styles.modalBody}>
          <Text style={styles.inputLabel}>Caregiver's Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            value={email}
            onChangeText={onChangeEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={[
              styles.inviteButton,
              isLoading && styles.inviteButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#4A90E2", "#357ABD"]}
              style={styles.inviteButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="mail-outline" size={20} color="white" />
                  <Text style={styles.inviteButtonText}>Send Invitation</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Pressable>
  </Modal>
);

const LovedOneDetailsScreen = ({ route, navigation }) => {
  const { lovedOne } = route.params;
  const [caregivers, setCaregivers] = useState([]);
  const [isLoadingCaregivers, setIsLoadingCaregivers] = useState(true);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

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
    navigation.navigate("EditLovedOne", { lovedOne });
  };

  const handleViewTasks = () => {
    navigation.navigate("DailyTasks", { lovedOneId: lovedOne._id });
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
        <Text style={styles.headerTitle}>Loved One Details</Text>
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
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {lovedOne.profileImage ? (
                <Image
                  source={{ uri: lovedOne.profileImage }}
                  style={styles.profileImage}
                  onError={(error) => {
                    console.error(
                      "Image loading error:",
                      error.nativeEvent.error
                    );
                  }}
                />
              ) : (
                <LinearGradient
                  colors={["#4A90E2", "#357ABD"]}
                  style={styles.profileIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.profileIcon}>
                    <Ionicons name="person" size={40} color="white" />
                  </View>
                </LinearGradient>
              )}
            </View>
            <Text style={styles.name}>{lovedOne.name}</Text>
          </View>

          <View style={styles.detailsSection}>
            <DetailItem
              icon="calendar-outline"
              label="Age"
              value={lovedOne.age}
            />
            <DetailItem
              icon="medical-outline"
              label="Medical History"
              value={lovedOne.medical_history}
              color="#EA4335"
            />
            <DetailItem
              icon="time-outline"
              label="Member Since"
              value={new Date().toLocaleDateString()}
              color="#34A853"
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {lovedOne.tasks?.length || 0}
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
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>

          <View style={styles.caregiversSection}>
            <Text style={styles.sectionTitle}>Caregivers</Text>
            {isLoadingCaregivers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>Loading caregivers...</Text>
              </View>
            ) : caregivers.length > 0 ? (
              caregivers.map((caregiver, index) => (
                <View key={caregiver._id || index} style={styles.caregiverItem}>
                  <View style={styles.caregiverIcon}>
                    <Ionicons name="person-outline" size={24} color="white" />
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
                </View>
              ))
            ) : (
              <Text style={styles.noCaregivers}>
                No caregivers assigned yet
              </Text>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <ActionButton
              icon="mail-outline"
              text="Invite Caregiver"
              onPress={() => setInviteModalVisible(true)}
              colors={["#4A90E2", "#357ABD"]}
              style={styles.mainAction}
            />
            <View style={styles.secondaryActions}>
              <ActionButton
                icon="create-outline"
                text="Edit Details"
                onPress={handleEditLovedOne}
                colors={["#34A853", "#2E8B4A"]}
                style={styles.secondaryAction}
              />
              <ActionButton
                icon="list-outline"
                text="View Tasks"
                onPress={handleViewTasks}
                colors={["#FBBC05", "#F5A623"]}
                style={styles.secondaryAction}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      <InviteModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
        email={inviteEmail}
        onChangeEmail={setInviteEmail}
        onSubmit={handleInviteCaregiver}
        isLoading={isInviting}
      />
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
    padding: 16,
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
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  profileIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E1E1E1",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A90E2",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  caregiversSection: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  caregiverItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
  },
  caregiverIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  caregiverInfo: {
    flex: 1,
    justifyContent: "center",
  },
  caregiverName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    marginBottom: 6,
  },
  caregiverEmail: {
    fontSize: 15,
    color: "#4A90E2",
    fontWeight: "600",
  },
  caregiverRole: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  noCaregivers: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingVertical: 20,
  },
  actionsContainer: {
    gap: 12,
  },
  mainAction: {
    marginBottom: 12,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  inviteButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  inviteButtonDisabled: {
    opacity: 0.7,
  },
  inviteButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  inviteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LovedOneDetailsScreen;
