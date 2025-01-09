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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../api/UserContext";
import {
  getAllLovedOnes,
  addLovedOne,
  deleteLovedOne,
  uploadProfileImage,
} from "../api/Users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

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

const LovedOneCard = memo(({ lovedOne, onPress, onDelete, animValue }) => {
  const getRandomGradient = () => {
    const gradients = [
      ["#4A90E2", "#357ABD"], // Blue
      ["#34A853", "#2E8B4A"], // Green
      ["#FBBC05", "#F5A623"], // Yellow
      ["#9B59B6", "#8E44AD"], // Purple
      ["#E67E22", "#D35400"], // Orange
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

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
        <LinearGradient
          colors={["#ffffff", "#f8f9fa"]}
          style={styles.lovedOneGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.lovedOneHeader}>
            <View style={styles.lovedOneIconContainer}>
              <LinearGradient
                colors={getRandomGradient()}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="heart" size={20} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.lovedOneInfo}>
              <Text style={styles.lovedOneName}>{lovedOne.name}</Text>
              <View style={styles.ageContainer}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text style={styles.lovedOneAge}>Age: {lovedOne.age}</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deletePressed,
              ]}
              onPress={() => onDelete(lovedOne._id)}
            >
              <View style={styles.deleteButtonInner}>
                <Ionicons name="trash-outline" size={16} color="#EA4335" />
              </View>
            </Pressable>
          </View>

          <View style={styles.medicalHistoryContainer}>
            <View style={styles.medicalHistoryHeader}>
              <Ionicons name="medical-outline" size={16} color="#4A90E2" />
              <Text style={styles.medicalHistoryLabel}>Medical History</Text>
            </View>
            <Text style={styles.medicalHistoryText} numberOfLines={2}>
              {lovedOne.medical_history}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.footerInfo}>
              <View style={styles.taskCount}>
                <Ionicons name="list-outline" size={14} color="#34A853" />
                <Text style={styles.taskCountText}>12 Tasks</Text>
              </View>
              <View style={styles.caregiverCount}>
                <Ionicons name="people-outline" size={14} color="#FBBC05" />
                <Text style={styles.caregiverCountText}>3 Caregivers</Text>
              </View>
            </View>
            <View style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Ionicons name="chevron-forward" size={14} color="#4A90E2" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});

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
  const [activeField, setActiveField] = useState(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setFormData({ name: "", age: "", medical_history: "" });
    });
  };

  const handleSubmit = () => {
    onAdd(formData);
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    multiline = false,
  }) => (
    <Pressable
      style={[
        styles.inputContainer,
        activeField === label && styles.inputContainerActive,
      ]}
      onPress={() => setActiveField(label)}
    >
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        onFocus={() => setActiveField(label)}
        onBlur={() => setActiveField(null)}
      />
    </Pressable>
  );

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <ModalBackground>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
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
            <InputField
              label="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter name"
            />

            <InputField
              label="Age"
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              placeholder="Enter age"
              keyboardType="numeric"
            />

            <InputField
              label="Medical History"
              value={formData.medical_history}
              onChangeText={(text) =>
                setFormData({ ...formData, medical_history: text })
              }
              placeholder="Enter medical history"
              multiline={true}
            />
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
        </Animated.View>
      </ModalBackground>
    </Modal>
  );
});

const ProfileScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [newLovedOne, setNewLovedOne] = useState({
    name: "",
    age: "",
    medical_history: "",
  });
  const { user, token, logout } = useUser();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
    enabled: true,
  });

  // Optimized animation values using useRef
  const animations = useRef({
    fade: new Animated.Value(0),
    slide: new Animated.Value(50),
    scale: new Animated.Value(0.3),
    lovedOnes: new Animated.Value(0),
  }).current;

  // Memoized handlers
  const handleImagePick = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Slightly reduced for better performance
      });

      if (!result.canceled) {
        setLoading(true);
        try {
          await uploadProfileImage(result.assets[0].uri, token);
          setProfileImage(result.assets[0].uri);
          Alert.alert("Success", "Profile image updated successfully!");
        } catch (error) {
          Alert.alert(
            "Error",
            "Failed to upload profile image. Please try again."
          );
        }
        setLoading(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  }, [token]);

  const handleAddLovedOne = useCallback(async () => {
    if (!newLovedOne.name || !newLovedOne.age || !newLovedOne.medical_history) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    try {
      setLoading(true);
      await addLovedOne(newLovedOne, token);
      queryClient.invalidateQueries(["lovedOnes"]);
      Alert.alert("Success", "Loved one added successfully!");
      setModalVisible(false);
      setNewLovedOne({ name: "", age: "", medical_history: "" });
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add loved one."
      );
    } finally {
      setLoading(false);
    }
  }, [newLovedOne, token, queryClient]);

  const handleDeleteLovedOne = useCallback(
    (lovedOneId) => {
      Alert.alert(
        "Delete Loved One",
        "Are you sure you want to delete this loved one?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteLovedOne(lovedOneId, token);
                queryClient.invalidateQueries(["lovedOnes"]);
                Alert.alert("Success", "Loved one deleted successfully");
              } catch (error) {
                Alert.alert(
                  "Error",
                  error.response?.data?.message || "Failed to delete loved one"
                );
              }
            },
          },
        ]
      );
    },
    [token, queryClient]
  );

  // Initial animations with optimized configuration
  useEffect(() => {
    const animConfig = {
      duration: 600,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    };

    Animated.parallel([
      Animated.timing(animations.fade, {
        toValue: 1,
        duration: animConfig.duration,
        useNativeDriver: true,
      }),
      Animated.spring(animations.scale, {
        toValue: 1,
        tension: animConfig.tension,
        friction: animConfig.friction,
        useNativeDriver: true,
      }),
      Animated.spring(animations.slide, {
        toValue: 0,
        tension: animConfig.tension,
        friction: animConfig.friction,
        useNativeDriver: true,
      }),
      Animated.timing(animations.lovedOnes, {
        toValue: 1,
        duration: animConfig.duration + 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animations]);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: animations.fade,
              transform: [{ scale: animations.scale }],
            },
          ]}
        >
          <LinearGradient
            colors={["#4A90E2", "#357ABD"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Pressable
              style={({ pressed }) => [
                styles.profileImageContainer,
                pressed && styles.pressed,
              ]}
              onPress={handleImagePick}
            >
              <View style={styles.profileImage}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImageStyle}
                  />
                ) : (
                  <Ionicons name="person" size={40} color="white" />
                )}
              </View>
              {loading ? (
                <EditButton loading={true} />
              ) : (
                <EditButton loading={false}>
                  <Ionicons name="camera" size={16} color="white" />
                </EditButton>
              )}
            </Pressable>
            <Text style={styles.userName}>{user?.name || "User Name"}</Text>
            <Text style={styles.userEmail}>
              {user?.email || "email@example.com"}
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: animations.lovedOnes,
              transform: [{ translateY: animations.slide }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Loved Ones</Text>
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setModalVisible(true)}
            >
              <LinearGradient
                colors={["#4A90E2", "#357ABD"]}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add" size={24} color="white" />
              </LinearGradient>
            </Pressable>
          </View>

          {isLoading && <ActivityIndicator size="large" color="#4A90E2" />}
          {error && (
            <Text style={styles.errorText}>Failed to load loved ones.</Text>
          )}
          {!isLoading && !error && data?.length > 0
            ? data.map((lovedOne) => (
                <LovedOneCard
                  key={lovedOne._id}
                  lovedOne={lovedOne}
                  onPress={() =>
                    navigation.navigate("LovedOneDetails", { lovedOne })
                  }
                  onDelete={handleDeleteLovedOne}
                  animValue={animations.lovedOnes}
                />
              ))
            : !isLoading && (
                <Text style={styles.noDataText}>No loved ones added yet.</Text>
              )}
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: animations.fade,
              transform: [{ translateY: animations.slide }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <MenuButton
            icon="person-outline"
            text="Edit Profile"
            onPress={() => {}}
          />
          <MenuButton
            icon="notifications-outline"
            text="Notifications"
            onPress={() => {}}
          />
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.pressed,
            ]}
            onPress={handleLogout}
          >
            <LinearGradient
              colors={["#EA4335", "#D32F2F"]}
              style={styles.logoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
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
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
    overflow: "hidden",
  },
  headerGradient: {
    padding: 20,
    alignItems: "center",
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  profileImageStyle: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  editButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  editButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(74,144,226,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginTop: 8,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addButtonGradient: {
    padding: 12,
    borderRadius: 12,
  },
  lovedOneItem: {
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lovedOneContent: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
  },
  lovedOneGradient: {
    padding: 16,
  },
  lovedOneHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  lovedOneIconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  lovedOneInfo: {
    flex: 1,
  },
  lovedOneName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  ageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lovedOneAge: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
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
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  medicalHistoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  medicalHistoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
  },
  medicalHistoryText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  taskCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  taskCountText: {
    fontSize: 12,
    color: "#34A853",
    fontWeight: "600",
  },
  caregiverCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  caregiverCountText: {
    fontSize: 12,
    color: "#FBBC05",
    fontWeight: "600",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#4A90E215",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "600",
  },
  menuItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  errorText: {
    color: "#EA4335",
    textAlign: "center",
    marginVertical: 20,
  },
  noDataText: {
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalForm: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputContainerActive: {
    transform: [{ scale: 1.02 }],
  },
  inputLabel: {
    fontSize: 14,
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
    color: "#333",
    backgroundColor: "#f8f9fa",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonModal: {
    backgroundColor: "#4A90E2",
  },
  cancelButton: {
    backgroundColor: "#EA4335",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default ProfileScreen;
