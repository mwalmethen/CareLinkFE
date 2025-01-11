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
    const imageUrl = lovedOne.profileImage?.startsWith("http")
      ? lovedOne.profileImage
      : lovedOne.profileImage
      ? `https://seal-app-doaaw.ondigitalocean.app/uploads/${lovedOne.profileImage.replace(
          /^\/+/,
          ""
        )}`
      : null;

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
          <View style={styles.lovedOneGradient}>
            <View style={styles.lovedOneHeader}>
              <Pressable
                style={styles.lovedOneIconContainer}
                onPress={() => onImagePick(lovedOne._id)}
              >
                <View style={styles.lovedOneProfileImageContainer}>
                  {imageUrl ? (
                    <AuthImage
                      source={{ uri: imageUrl }}
                      style={styles.lovedOneProfileImageStyle}
                      onError={() => {}}
                    />
                  ) : (
                    <Ionicons name="person" size={30} color="#4A90E2" />
                  )}
                </View>
              </Pressable>
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
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, token, logout, updateUser } = useUser();
  const [profileImage, setProfileImage] = useState(null);
  const queryClient = useQueryClient();

  // Load profile image when component mounts and when user changes
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        console.log("Loading profile image...");
        console.log("Current user data:", user);

        // First try to get the image from storage
        const savedImageUrl = await getProfileImage();
        console.log("Saved image URL from storage:", savedImageUrl);

        if (savedImageUrl) {
          console.log("Setting profile image from storage:", savedImageUrl);
          setProfileImage(savedImageUrl);

          // Update user context if needed
          if (
            user &&
            (!user.profileImage || user.profileImage !== savedImageUrl)
          ) {
            console.log("Updating user context with saved image");
            const updatedUser = {
              ...user,
              profileImage: savedImageUrl,
            };
            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            await updateUser(updatedUser);
          }
          return;
        }

        // If not in storage, try user context
        if (user?.profileImage) {
          const imageUrl = user.profileImage.startsWith("http")
            ? user.profileImage
            : `http://seal-app-doaaw.ondigitalocean.app/${user.profileImage}`;
          console.log("Setting profile image from user context:", imageUrl);
          setProfileImage(imageUrl);

          // Save to storage for future use
          await setProfileImage(imageUrl);
        }
      } catch (error) {
        console.error("Error loading profile image:", error);
      }
    };

    loadProfileImage();
  }, [user, updateUser]);

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
        quality: 0.8,
      });

      if (!result.canceled) {
        setLoading(true);
        try {
          console.log("Selected image:", result.assets[0].uri);
          const response = await uploadProfileImage(
            result.assets[0].uri,
            token
          );
          console.log(
            "Profile image upload response:",
            JSON.stringify(response, null, 2)
          );

          if (response.caregiver && response.caregiver.profileImage) {
            const imageUrl = response.caregiver.profileImage; // URL is already formatted in uploadProfileImage
            console.log("Using image URL:", imageUrl);

            try {
              // Save to storage first
              console.log("Saving to storage:", imageUrl);
              await setProfileImage(imageUrl);

              // Update user data
              const updatedUser = {
                ...user,
                profileImage: imageUrl,
              };
              console.log("Updating user data:", updatedUser);

              // Save to AsyncStorage
              await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
              console.log("Saved to AsyncStorage");

              // Update user context
              await updateUser(updatedUser);
              console.log("Updated user context");

              // Update local state last
              setProfileImage(imageUrl);
              console.log("Updated local state");

              Alert.alert("Success", "Profile image updated successfully!");
            } catch (storageError) {
              console.error("Error saving image:", storageError);
              Alert.alert(
                "Error",
                "Failed to save profile image. Please try again."
              );
            }
          } else {
            console.error("Invalid response format:", response);
            Alert.alert("Error", "Invalid response from server");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          Alert.alert(
            "Error",
            error.response?.data?.message ||
              "Failed to upload profile image. Please try again."
          );
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  }, [token, user, updateUser]);

  const handleAddLovedOne = useCallback(
    async (formData) => {
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
    },
    [token, queryClient]
  );

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

  const handleLovedOneImagePick = useCallback(
    async (lovedOneId) => {
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
          quality: 0.8,
        });

        if (!result.canceled) {
          const loadingLovedOneId = lovedOneId;
          setLoadingLovedOneId(loadingLovedOneId);

          try {
            const response = await uploadLovedOneProfileImage(
              lovedOneId,
              result.assets[0].uri,
              token
            );
            console.log("Loved one image response:", response);

            if (response.lovedOne && response.lovedOne.profileImage) {
              const storageKey = `lovedOne_${lovedOneId}_image`;
              await AsyncStorage.setItem(
                storageKey,
                response.lovedOne.profileImage
              );

              const imageUrl = response.lovedOne.profileImage.startsWith("http")
                ? response.lovedOne.profileImage
                : `http://seal-app-doaaw.ondigitalocean.app/${response.lovedOne.profileImage}`;

              queryClient.setQueryData(["lovedOnes"], (oldData) => {
                return oldData.map((lovedOne) => {
                  if (lovedOne._id === lovedOneId) {
                    return {
                      ...lovedOne,
                      profileImage: imageUrl,
                    };
                  }
                  return lovedOne;
                });
              });

              Alert.alert(
                "Success",
                "Loved one's photo has been updated successfully!"
              );
            }
          } catch (error) {
            console.error("Upload error:", error);
            Alert.alert(
              "Error",
              error.response?.data?.message ||
                "Failed to upload loved one's photo. Please try again."
            );
          } finally {
            setLoadingLovedOneId(null);
          }
        }
      } catch (error) {
        Alert.alert("Error", "Failed to pick image. Please try again.");
      }
    },
    [token, queryClient]
  );

  // Load loved ones' images from AsyncStorage when data is fetched
  useEffect(() => {
    const loadLovedOnesImages = async () => {
      if (data && data.length > 0) {
        const updatedLovedOnes = await Promise.all(
          data.map(async (lovedOne) => {
            const storageKey = `lovedOne_${lovedOne._id}_image`;
            const savedImagePath = await AsyncStorage.getItem(storageKey);

            if (savedImagePath) {
              const imageUrl = savedImagePath.startsWith("http")
                ? savedImagePath
                : `http://seal-app-doaaw.ondigitalocean.app/${savedImagePath}`;
              return {
                ...lovedOne,
                profileImage: imageUrl,
              };
            }
            return lovedOne;
          })
        );

        // Update the cache with the loaded images
        queryClient.setQueryData(["lovedOnes"], updatedLovedOnes);
      }
    };

    loadLovedOnesImages();
  }, [data, queryClient]);

  // Add state for loading specific loved one image
  const [loadingLovedOneId, setLoadingLovedOneId] = useState(null);

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
    try {
      await clearUserData(); // Clear both token and profile image
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
                  <AuthImage
                    source={{ uri: profileImage }}
                    style={styles.profileImageStyle}
                    onError={() => {
                      Alert.alert("Error", "Failed to load profile image");
                    }}
                  />
                ) : (
                  <Ionicons name="person" size={40} color="white" />
                )}
              </View>
              <EditButton loading={loading}>
                <Ionicons name="camera" size={16} color="white" />
              </EditButton>
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
                  onImagePick={handleLovedOneImagePick}
                  animValue={animations.lovedOnes}
                  isLoading={loadingLovedOneId === lovedOne._id}
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
    overflow: "hidden",
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
    backgroundColor: "white",
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
  modalFormContent: {
    paddingBottom: 20,
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
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  lovedOneProfileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  cameraIconOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "rgba(74,144,226,0.9)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  lovedOneProfileImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  lovedOneProfileImageStyle: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
});

export default ProfileScreen;
