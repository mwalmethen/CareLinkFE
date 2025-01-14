import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCarePlans,
  createCarePlan,
  updateCarePlan,
  deleteCarePlan,
} from "../api/CarePlan";
import { getAllLovedOnes } from "../api/Users";
import { useUser } from "../api/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";

const StatusBadge = ({ status, type = "plan" }) => {
  const getStatusColor = () => {
    if (type === "plan") {
      switch (status) {
        case "DRAFT":
          return "#FFA500";
        case "ACTIVE":
          return "#4CAF50";
        case "COMPLETED":
          return "#2196F3";
        case "ARCHIVED":
          return "#9E9E9E";
        default:
          return "#9E9E9E";
      }
    } else {
      switch (status) {
        case "PENDING":
          return "#FFA500";
        case "IN_PROGRESS":
          return "#2196F3";
        case "COMPLETED":
          return "#4CAF50";
        default:
          return "#9E9E9E";
      }
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

const CarePlanScreen = ({ navigation, route }) => {
  const [selectedLovedOne, setSelectedLovedOne] = useState(
    route.params?.lovedOne || null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goals: [],
    schedule: {
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    status: "DRAFT",
    notes: "",
  });

  const [currentGoal, setCurrentGoal] = useState({
    title: "",
    description: "",
    target_date: new Date(),
    status: "PENDING",
  });

  const statusOptions = {
    carePlan: ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"],
    goal: ["PENDING", "IN_PROGRESS", "COMPLETED"],
  };

  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: lovedOnes = [] } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
  });

  const {
    data: carePlans = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["carePlans", selectedLovedOne?._id],
    queryFn: () => getCarePlans(selectedLovedOne._id),
    enabled: !!selectedLovedOne?._id,
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showGoalDatePicker, setShowGoalDatePicker] = useState(false);

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        schedule: {
          ...formData.schedule,
          start_date: selectedDate,
        },
      });
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        schedule: {
          ...formData.schedule,
          end_date: selectedDate,
        },
      });
    }
  };

  const handleGoalDateChange = (event, selectedDate) => {
    setShowGoalDatePicker(false);
    if (selectedDate) {
      setCurrentGoal({
        ...currentGoal,
        target_date: selectedDate,
      });
    }
  };

  const handleAddCarePlan = async () => {
    if (!formData.title) {
      Alert.alert("Error", "Title is required");
      return;
    }

    try {
      const carePlanData = {
        ...formData,
        loved_one: selectedLovedOne._id,
        created_by: user._id,
        schedule: {
          start_date: formData.schedule.start_date,
          end_date: formData.schedule.end_date,
        },
      };

      await createCarePlan(carePlanData);
      queryClient.invalidateQueries(["carePlans", selectedLovedOne._id]);
      setModalVisible(false);
      Alert.alert("Success", "Care plan created successfully!");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create care plan");
    }
  };

  const handleAddGoal = () => {
    if (!currentGoal.title) {
      Alert.alert("Error", "Goal title is required");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      goals: [...prev.goals, currentGoal],
    }));

    setCurrentGoal({
      title: "",
      description: "",
      target_date: new Date(),
      status: "PENDING",
    });
  };

  const renderCarePlan = (carePlan) => (
    <Pressable
      key={carePlan._id}
      style={styles.carePlanItem}
      onPress={() => navigation.navigate("CarePlanDetails", { carePlan })}
    >
      <LinearGradient
        colors={["#ffffff", "#f8f9fa"]}
        style={styles.carePlanGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.carePlanHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.carePlanTitle}>{carePlan.title}</Text>
            <StatusBadge status={carePlan.status} type="plan" />
          </View>
        </View>

        {carePlan.description && (
          <Text style={styles.description}>{carePlan.description}</Text>
        )}

        <View style={styles.scheduleContainer}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <View>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateText}>
                {new Date(carePlan.schedule.start_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <View>
              <Text style={styles.dateLabel}>End Date</Text>
              <Text style={styles.dateText}>
                {new Date(carePlan.schedule.end_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.goalsContainer}>
          <Text style={styles.goalsTitle}>Goals ({carePlan.goals.length})</Text>
          {carePlan.goals.slice(0, 2).map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <StatusBadge status={goal.status} type="goal" />
              </View>
              {goal.description && (
                <Text style={styles.goalDescription}>{goal.description}</Text>
              )}
            </View>
          ))}
          {carePlan.goals.length > 2 && (
            <Text style={styles.moreGoals}>
              +{carePlan.goals.length - 2} more goals
            </Text>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Care Plans</Text>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={["#4A90E2", "#357ABD"]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add" size={24} color="white" />
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.lovedOneSelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.lovedOneList}
        >
          {lovedOnes.map((lovedOne) => (
            <Pressable
              key={lovedOne._id}
              style={[
                styles.lovedOneItem,
                selectedLovedOne?._id === lovedOne._id &&
                  styles.selectedLovedOne,
              ]}
              onPress={() => setSelectedLovedOne(lovedOne)}
            >
              <Text
                style={[
                  styles.lovedOneName,
                  selectedLovedOne?._id === lovedOne._id &&
                    styles.selectedLovedOneName,
                ]}
              >
                {lovedOne.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.carePlanList}>
        {isLoading ? (
          <View style={styles.centerContent}>
            <Text>Loading care plans...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        ) : carePlans.length > 0 ? (
          carePlans.map(renderCarePlan)
        ) : (
          <View style={styles.centerContent}>
            <Ionicons name="document-text-outline" size={48} color="#999" />
            <Text style={styles.noDataText}>No care plans found</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Care Plan</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData({ ...formData, title: text })
                  }
                  placeholder="Enter care plan title"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="Enter care plan description"
                  multiline
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formData.schedule.start_date.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={formData.schedule.start_date}
                    mode="date"
                    is24Hour={true}
                    onChange={handleStartDateChange}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formData.schedule.end_date.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={formData.schedule.end_date}
                    mode="date"
                    is24Hour={true}
                    onChange={handleEndDateChange}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusSelector}>
                  {statusOptions.carePlan.map((status) => (
                    <Pressable
                      key={status}
                      style={[
                        styles.statusOption,
                        formData.status === status && styles.selectedStatus,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, status: status })
                      }
                    >
                      <Text
                        style={[
                          styles.statusText,
                          formData.status === status &&
                            styles.selectedStatusText,
                        ]}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) =>
                    setFormData({ ...formData, notes: text })
                  }
                  placeholder="Enter additional notes"
                  multiline
                />
              </View>

              <View style={styles.goalsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Goals ({formData.goals.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.addGoalButton}
                    onPress={handleAddGoal}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color="#4A90E2"
                    />
                  </TouchableOpacity>
                </View>

                {/* Goal Input Form */}
                <View style={styles.goalForm}>
                  <TextInput
                    style={styles.input}
                    value={currentGoal.title}
                    onChangeText={(text) =>
                      setCurrentGoal({ ...currentGoal, title: text })
                    }
                    placeholder="Enter goal title"
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={currentGoal.description}
                    onChangeText={(text) =>
                      setCurrentGoal({ ...currentGoal, description: text })
                    }
                    placeholder="Enter goal description"
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowGoalDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      Target Date:{" "}
                      {currentGoal.target_date.toLocaleDateString()}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#4A90E2"
                    />
                  </TouchableOpacity>
                  {showGoalDatePicker && (
                    <DateTimePicker
                      value={currentGoal.target_date}
                      mode="date"
                      is24Hour={true}
                      onChange={handleGoalDateChange}
                    />
                  )}

                  <View style={styles.statusSelector}>
                    {statusOptions.goal.map((status) => (
                      <Pressable
                        key={status}
                        style={[
                          styles.statusOption,
                          currentGoal.status === status &&
                            styles.selectedStatus,
                        ]}
                        onPress={() =>
                          setCurrentGoal({ ...currentGoal, status: status })
                        }
                      >
                        <Text
                          style={[
                            styles.statusText,
                            currentGoal.status === status &&
                              styles.selectedStatusText,
                          ]}
                        >
                          {status}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Goals List */}
                {formData.goals.map((goal, index) => (
                  <View key={index} style={styles.goalItem}>
                    <View style={styles.goalHeader}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <StatusBadge status={goal.status} type="goal" />
                    </View>
                    {goal.description && (
                      <Text style={styles.goalDescription}>
                        {goal.description}
                      </Text>
                    )}
                    <Text style={styles.goalDate}>
                      Target Date:{" "}
                      {new Date(goal.target_date).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddCarePlan}
              >
                <Text style={styles.buttonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    padding: 12,
    borderRadius: 12,
  },
  lovedOneSelector: {
    marginBottom: 20,
  },
  lovedOneList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  lovedOneItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  selectedLovedOne: {
    backgroundColor: "#4A90E2",
  },
  lovedOneName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  selectedLovedOneName: {
    color: "white",
  },
  carePlanList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  carePlanItem: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  carePlanGradient: {
    padding: 16,
  },
  carePlanHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  carePlanTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  scheduleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
  },
  dateText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  goalsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  goalsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  goalItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  goalDescription: {
    fontSize: 12,
    color: "#666",
  },
  moreGoals: {
    fontSize: 12,
    color: "#4A90E2",
    textAlign: "center",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    color: "#EA4335",
    textAlign: "center",
  },
  noDataText: {
    color: "#666",
    marginTop: 12,
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
    maxHeight: "80%",
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
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#EA4335",
  },
  submitButton: {
    backgroundColor: "#4A90E2",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  statusSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedStatus: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  statusText: {
    color: "#666",
    fontSize: 14,
  },
  selectedStatusText: {
    color: "#fff",
  },
  goalsSection: {
    marginTop: 24,
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
  addGoalButton: {
    padding: 8,
  },
  goalForm: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  goalItem: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  goalDescription: {
    color: "#666",
    marginBottom: 8,
  },
  goalDate: {
    color: "#666",
    fontSize: 14,
  },
});

export default CarePlanScreen;
