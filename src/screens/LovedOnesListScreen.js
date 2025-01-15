import React, { useState, useEffect, useRef, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
  Image,
  Modal,
  TextInput,
  Animated,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllLovedOnes, deleteLovedOne, addLovedOne } from "../api/Users";
import { useUser } from "../api/UserContext";

const AddLovedOneModal = memo(({ visible, onClose, onAdd, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    medical_history: "",
  });

  const handleClose = () => {
    setFormData({ name: "", age: "", medical_history: "" });
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="Enter name"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(text) =>
                    setFormData({ ...formData, age: text })
                  }
                  placeholder="Enter age"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Medical Condition</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.medical_history}
                  onChangeText={(text) =>
                    setFormData({ ...formData, medical_history: text })
                  }
                  placeholder="Enter medical condition"
                  placeholderTextColor="#64748B"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.modalAddButton,
                pressed && styles.pressed,
                loading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalAddButtonText}>Add Loved One</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const LovedOneCard = ({ lovedOne, onPress, onDelete, index }) => {
  // Calculate pending tasks only
  const pendingTasks = lovedOne.tasks?.pending?.length || 0;
  const completedTasks = lovedOne.tasks?.completed?.length || 0;
  const totalTasks = pendingTasks + completedTasks;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["#F0F9FF", "#E0F2FE"]}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardInner}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{index + 1}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.cardContent,
              pressed && styles.pressed,
            ]}
            onPress={onPress}
          >
            <View style={styles.avatarContainer}>
              {lovedOne.profileImage ? (
                <Image
                  source={{ uri: lovedOne.profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <LinearGradient
                  colors={["#4C51BF", "#434190"]}
                  style={styles.avatarGradient}
                >
                  <Ionicons name="person" size={24} color="white" />
                </LinearGradient>
              )}
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{lovedOne.name}</Text>
              <View style={styles.relationshipContainer}>
                <Ionicons name="heart" size={14} color="#4A90E2" />
                <Text style={styles.relationship}>{lovedOne.relationship}</Text>
              </View>
              {totalTasks > 0 && (
                <View style={styles.taskStatusContainer}>
                  <Text style={styles.taskStatusText}>
                    {pendingTasks} pending • {completedTasks} completed
                  </Text>
                  <Text style={styles.completionRate}>
                    {Math.round((completedTasks / totalTasks) * 100)}% complete
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(lovedOne)}
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
        </View>
      </LinearGradient>
    </View>
  );
};

const LovedOnesListScreen = ({ navigation }) => {
  const { token, user } = useUser();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: lovedOnes, isLoading } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: () => getAllLovedOnes(token),
  });

  // Add animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAddLovedOne = async (formData) => {
    if (!formData.name || !formData.age || !formData.medical_history) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    try {
      setLoading(true);
      await addLovedOne(formData, token);
      queryClient.invalidateQueries(["lovedOnes"]);
      Alert.alert("Success", "Loved one added successfully!");
      setModalVisible(false);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add loved one."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLovedOne = async (lovedOne) => {
    try {
      // Check if there is only one caregiver
      if (lovedOne.caregivers?.length !== 1) {
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
                Alert.alert("Success", "Loved one deleted successfully");
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

  const renderLovedOneCard = (lovedOne, index) => {
    const isShared = lovedOne.caregivers?.[0] !== user?._id;
    const imageUrl = lovedOne.profileImage?.startsWith("http")
      ? lovedOne.profileImage
      : lovedOne.profileImage
      ? `https://seal-app-doaaw.ondigitalocean.app/uploads/${lovedOne.profileImage.replace(
          /^\/+/,
          ""
        )}`
      : null;

    const itemAnimDelay = index * 100;

    return (
      <Animated.View
        key={lovedOne._id}
        style={[
          styles.lovedOneItem,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 50],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cardContainer}>
          <View style={styles.lovedOneContent}>
            <LinearGradient
              colors={["#F0F7FF", "#E0F2FE"]}
              style={[styles.lovedOneGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.lovedOneHeader}>
                <View style={styles.lovedOneIconContainer}>
                  <View style={styles.iconContainer}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.lovedOneProfileImageStyle}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person" size={24} color="#4A90E2" />
                    )}
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
                </View>
                {!isShared && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && styles.deletePressed,
                    ]}
                    onPress={() => handleDeleteLovedOne(lovedOne)}
                  >
                    <View style={styles.deleteButtonInner}>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#DC2626"
                      />
                    </View>
                  </Pressable>
                )}
              </View>

              {lovedOne.medical_history && (
                <View style={styles.medicalHistoryContainer}>
                  <View style={styles.medicalHistoryHeader}>
                    <Ionicons
                      name="medical-outline"
                      size={16}
                      color="#4A90E2"
                    />
                    <Text style={styles.medicalHistoryLabel}>
                      Medical Condition
                    </Text>
                  </View>
                  <Text style={styles.medicalHistoryText}>
                    {lovedOne.medical_history}
                  </Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                  <View style={styles.taskCountContainer}>
                    <LinearGradient
                      colors={["#F0F9FF", "#DBEAFE"]}
                      style={styles.taskCountWrapper}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.taskIconBadge}>
                        <Ionicons
                          name="list-outline"
                          size={16}
                          color="#2563EB"
                        />
                      </View>
                      <View style={styles.taskTextContainer}>
                        <Text style={styles.taskCountNumber}>
                          {lovedOne.tasks?.total || 0}
                        </Text>
                        <Text style={styles.taskLabel}>Tasks</Text>
                      </View>
                    </LinearGradient>
                  </View>
                  <View style={styles.caregiverCountContainer}>
                    <LinearGradient
                      colors={["#FEF3C7", "#FDE68A"]}
                      style={styles.caregiverCountWrapper}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.caregiverIconBadge}>
                        <Ionicons
                          name="people-outline"
                          size={14}
                          color="#D97706"
                        />
                      </View>
                      <View style={styles.caregiverTextContainer}>
                        <Text style={styles.caregiverCountNumber}>
                          {lovedOne.caregivers?.length || 0}
                        </Text>
                        <Text style={styles.caregiverLabel}>Caregivers</Text>
                      </View>
                    </LinearGradient>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.viewDetailsButton,
                    pressed && styles.viewDetailsPressed,
                  ]}
                  onPress={() =>
                    navigation.navigate("LovedOneDetails", { lovedOne })
                  }
                >
                  <LinearGradient
                    colors={["#3B82F6", "#2563EB"]}
                    style={styles.viewDetailsGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="white" />
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Family Circle</Text>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {lovedOnes && lovedOnes.length > 0 ? (
          lovedOnes.map((lovedOne, index) =>
            renderLovedOneCard(lovedOne, index)
          )
        ) : (
          <Animated.View
            style={[
              styles.emptyContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Ionicons name="people-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No loved ones found</Text>
            <Text style={styles.emptySubtext}>
              Add your first loved one by tapping the + button
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      <AddLovedOneModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddLovedOne}
        loading={loading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lovedOneItem: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardContainer: {
    position: "relative",
    width: "100%",
  },
  lovedOneContent: {
    borderRadius: 16,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  lovedOneGradient: {
    padding: 16,
    borderRadius: 16,
  },
  lovedOneHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  lovedOneProfileImageStyle: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  lovedOneInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  lovedOneName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  multiCaregiversBadge: {
    backgroundColor: "#EFF6FF",
    padding: 4,
    borderRadius: 12,
  },
  ageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lovedOneAge: {
    fontSize: 14,
    color: "#6B7280",
  },
  deleteButton: {
    marginLeft: 8,
  },
  deleteButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(234, 67, 53, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  deletePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  medicalHistoryContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  medicalHistoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  medicalHistoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
  },
  medicalHistoryText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  cardFooter: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  taskCountContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  taskCountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
  taskIconBadge: {
    backgroundColor: "#EFF6FF",
    padding: 6,
    borderRadius: 8,
  },
  taskTextContainer: {
    flexDirection: "column",
  },
  taskCountNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E40AF",
  },
  taskLabel: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
  },
  caregiverCountContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  caregiverCountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
  caregiverIconBadge: {
    backgroundColor: "#FFFBEB",
    padding: 6,
    borderRadius: 8,
  },
  caregiverTextContainer: {
    flexDirection: "column",
  },
  caregiverCountNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
  },
  caregiverLabel: {
    fontSize: 12,
    color: "#D97706",
    fontWeight: "500",
  },
  viewDetailsButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  viewDetailsGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  viewDetailsText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  viewDetailsPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 64,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalAddButton: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalAddButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  card: {
    borderRadius: 16,
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
  cardGradient: {
    width: "100%",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    position: "relative",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  relationshipContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  relationship: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "500",
  },
  counterBadge: {
    position: "absolute",
    top: -8,
    left: -8,
    backgroundColor: "#4A90E2",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1,
  },
  counterText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  taskStatusContainer: {
    marginTop: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 8,
    padding: 4,
  },
  taskStatusText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  completionRate: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
});

export default LovedOnesListScreen;
