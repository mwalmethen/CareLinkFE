import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../api/UserContext";
import { getAllLovedOnes, addLovedOne, deleteLovedOne } from "../api/Users";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ProfileScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleAddLovedOne = async () => {
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
  };

  const handleDeleteLovedOne = async (lovedOneId) => {
    try {
      Alert.alert(
        "Delete Loved One",
        "Are you sure you want to delete this loved one?",
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
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to delete loved one"
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={40} color="#4A90E2" />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="camera-outline" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || "User Name"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "email@example.com"}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Loved Ones</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {isLoading && <ActivityIndicator size="large" color="#4A90E2" />}
          {error && (
            <Text style={styles.errorText}>Failed to load loved ones.</Text>
          )}
          {!isLoading && !error && data?.length > 0
            ? data.map((lovedOne) => (
                <View key={lovedOne._id} style={styles.lovedOneItem}>
                  <TouchableOpacity
                    style={styles.lovedOneContent}
                    onPress={() =>
                      navigation.navigate("LovedOneDetails", { lovedOne })
                    }
                  >
                    <Ionicons name="heart" size={24} color="#4A90E2" />
                    <View style={styles.lovedOneInfo}>
                      <Text style={styles.lovedOneName}>{lovedOne.name}</Text>
                      <Text style={styles.lovedOneDetails}>
                        Age: {lovedOne.age}
                      </Text>
                      <Text style={styles.lovedOneDetails}>
                        Medical History: {lovedOne.medical_history}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteLovedOne(lovedOne._id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EA4335" />
                  </TouchableOpacity>
                </View>
              ))
            : !isLoading && (
                <Text style={styles.noDataText}>No loved ones added yet.</Text>
              )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color="#4A90E2" />
            <Text style={styles.menuText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#4A90E2" />
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={24} color="#4A90E2" />
            <Text style={styles.menuText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Loved One</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#4A90E2"
                value={newLovedOne.name}
                onChangeText={(text) =>
                  setNewLovedOne({ ...newLovedOne, name: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#4A90E2"
                keyboardType="numeric"
                value={newLovedOne.age}
                onChangeText={(text) =>
                  setNewLovedOne({ ...newLovedOne, age: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Medical History"
                placeholderTextColor="#4A90E2"
                value={newLovedOne.medical_history}
                onChangeText={(text) =>
                  setNewLovedOne({ ...newLovedOne, medical_history: text })
                }
                multiline
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.addButtonModal]}
                  onPress={handleAddLovedOne}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Add</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F6FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4A90E2",
  },
  editButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  lovedOneItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lovedOneContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  lovedOneInfo: {
    marginLeft: 12,
    flex: 1,
  },
  lovedOneName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  lovedOneDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  errorText: {
    color: "#EA4335",
    textAlign: "center",
    marginVertical: 12,
  },
  noDataText: {
    color: "#666",
    textAlign: "center",
    marginVertical: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EA4335",
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
});

export default ProfileScreen;
