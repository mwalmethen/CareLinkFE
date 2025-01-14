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
import DropDownPicker from "react-native-dropdown-picker";

const getStatusColor = (status, type = "plan") => {
  const planStatusColors = {
    DRAFT: "#F59E0B",
    ACTIVE: "#059669",
    COMPLETED: "#2563EB",
    ARCHIVED: "#6B7280",
  };

  const goalStatusColors = {
    PENDING: "#F59E0B",
    IN_PROGRESS: "#2563EB",
    COMPLETED: "#059669",
  };

  return type === "plan" ? planStatusColors[status] : goalStatusColors[status];
};

const StatusBadge = ({ status, type = "plan" }) => (
  <View
    style={[styles.badge, { backgroundColor: getStatusColor(status, type) }]}
  >
    <Text style={styles.badgeText}>{status}</Text>
  </View>
);

const FormDatePicker = ({ label, value, onChange, style }) => {
  const [show, setShow] = useState(false);
  const date = value ? new Date(value) : new Date();

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === "android") {
      setShow(false);
    }
    onChange(currentDate);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  return (
    <View style={[styles.datePickerContainer, style]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.dateButton} onPress={showDatepicker}>
        <Text style={[styles.dateText, { color: "#1F2937" }]}>
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
      </TouchableOpacity>

      {Platform.OS === "ios" ? (
        <Modal visible={show} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerCard}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select {label}</Text>
              </View>
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  style={{ width: 320, height: 180 }}
                  textColor="#000000"
                />
              </View>
              <View style={styles.pickerFooter}>
                <TouchableOpacity
                  style={[
                    styles.footerButton,
                    { borderRightWidth: 1, borderRightColor: "#E2E8F0" },
                  ]}
                  onPress={() => setShow(false)}
                >
                  <Text style={[styles.footerButtonText, { color: "#EF4444" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={() => setShow(false)}
                >
                  <Text style={[styles.footerButtonText, { color: "#3B82F6" }]}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}
    </View>
  );
};

const CarePlanScreen = ({ navigation, route }) => {
  const [selectedLovedOne, setSelectedLovedOne] = useState(null);
  const [lovedOneOpen, setLovedOneOpen] = useState(false);
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

  const [lovedOneValue, setLovedOneValue] = useState(null);

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

  const handleAddCarePlan = async () => {
    try {
      // Validate title
      if (!formData.title.trim()) {
        Alert.alert("Validation Error", "Please enter a care plan title");
        return;
      }

      // Validate loved one selection
      if (!selectedLovedOne || !selectedLovedOne._id) {
        Alert.alert("Validation Error", "Please select a loved one");
        return;
      }

      // Validate description
      if (!formData.description.trim()) {
        Alert.alert("Validation Error", "Please enter a care plan description");
        return;
      }

      // Validate dates
      if (!formData.schedule.start_date || !formData.schedule.end_date) {
        Alert.alert(
          "Validation Error",
          "Please select both start and end dates"
        );
        return;
      }

      if (formData.schedule.end_date < formData.schedule.start_date) {
        Alert.alert("Validation Error", "End date cannot be before start date");
        return;
      }

      // Prepare care plan data
      const carePlanData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        loved_one: selectedLovedOne._id,
        created_by: user._id,
        goals: formData.goals.map((goal) => ({
          title: goal.title.trim(),
          description: goal.description.trim(),
          target_date: goal.target_date,
          status: goal.status,
        })),
        schedule: {
          start_date: formData.schedule.start_date,
          end_date: formData.schedule.end_date,
        },
        status: formData.status || "DRAFT",
        notes: formData.notes.trim(),
      };

      console.log("Creating care plan with data:", carePlanData);
      const newCarePlan = await createCarePlan(carePlanData);
      console.log("Care plan created successfully:", newCarePlan);

      await queryClient.invalidateQueries(["carePlans", selectedLovedOne._id]);

      // Reset form
      setFormData({
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

      setModalVisible(false);

      Alert.alert(
        "Success",
        `Care plan "${newCarePlan.title}" has been created successfully!`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error creating care plan:", error);
      Alert.alert(
        "Error Creating Care Plan",
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred while creating the care plan. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleAddGoal = () => {
    if (!currentGoal.title.trim()) {
      Alert.alert("Error", "Goal title is required");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      goals: [
        ...prev.goals,
        {
          ...currentGoal,
          title: currentGoal.title.trim(),
          description: currentGoal.description.trim(),
        },
      ],
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
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={[styles.inputContainer, { zIndex: 1 }]}>
                <Text style={styles.inputLabel}>Select Loved One</Text>
                <DropDownPicker
                  open={lovedOneOpen}
                  value={lovedOneValue}
                  items={lovedOnes.map((lovedOne) => ({
                    label: lovedOne.name,
                    value: lovedOne._id,
                  }))}
                  setOpen={setLovedOneOpen}
                  setValue={setLovedOneValue}
                  onSelectItem={(item) => {
                    const selected = lovedOnes.find(
                      (l) => l._id === item.value
                    );
                    setSelectedLovedOne(selected);
                  }}
                  placeholder="Select Loved One"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  listMode="SCROLLVIEW"
                  position="bottom"
                  zIndex={1}
                  zIndexInverse={3000}
                />
              </View>

              <View style={[styles.inputContainer, { zIndex: 2000 }]}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="Enter care plan description"
                  placeholderTextColor="#666666"
                  multiline
                />
              </View>

              <FormDatePicker
                label="Start Date"
                value={formData.schedule.start_date}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    schedule: {
                      ...formData.schedule,
                      start_date: date,
                    },
                  })
                }
              />

              <FormDatePicker
                label="End Date"
                value={formData.schedule.end_date}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    schedule: {
                      ...formData.schedule,
                      end_date: date,
                    },
                  })
                }
                style={{ marginTop: 16 }}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusSelector}>
                  {statusOptions.carePlan.map((status) => (
                    <Pressable
                      key={status}
                      style={[
                        styles.statusOption,
                        formData.status === status && {
                          backgroundColor:
                            status === "ACTIVE"
                              ? "#059669"
                              : status === "DRAFT"
                              ? "#F59E0B"
                              : status === "COMPLETED"
                              ? "#2563EB"
                              : status === "ARCHIVED"
                              ? "#6B7280"
                              : "#F59E0B",
                          borderColor:
                            status === "ACTIVE"
                              ? "#047857"
                              : status === "DRAFT"
                              ? "#D97706"
                              : status === "COMPLETED"
                              ? "#1E40AF"
                              : status === "ARCHIVED"
                              ? "#4B5563"
                              : "#D97706",
                        },
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
                  placeholderTextColor="#666666"
                  multiline
                />
              </View>

              <View style={styles.goalsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Goals ({formData.goals.length})
                  </Text>
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
                    placeholderTextColor="#666666"
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={currentGoal.description}
                    onChangeText={(text) =>
                      setCurrentGoal({ ...currentGoal, description: text })
                    }
                    placeholder="Enter goal description"
                    placeholderTextColor="#666666"
                    multiline
                  />

                  <FormDatePicker
                    label="Target Date"
                    value={currentGoal.target_date}
                    onChange={(date) =>
                      setCurrentGoal({ ...currentGoal, target_date: date })
                    }
                    style={{ marginVertical: 16 }}
                  />

                  <View style={styles.statusSelector}>
                    {statusOptions.goal.map((status) => (
                      <Pressable
                        key={status}
                        style={[
                          styles.statusOption,
                          currentGoal.status === status && {
                            backgroundColor:
                              status === "PENDING"
                                ? "#F59E0B"
                                : status === "IN_PROGRESS"
                                ? "#2563EB"
                                : status === "COMPLETED"
                                ? "#059669"
                                : "#F59E0B",
                            borderColor:
                              status === "PENDING"
                                ? "#D97706"
                                : status === "IN_PROGRESS"
                                ? "#1E40AF"
                                : status === "COMPLETED"
                                ? "#047857"
                                : "#D97706",
                          },
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

                  <Pressable
                    style={[styles.addGoalButton, { marginTop: 16 }]}
                    onPress={handleAddGoal}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color="#4A90E2"
                    />
                    <Text style={styles.addGoalText}>Add Goal</Text>
                  </Pressable>
                </View>

                {/* Goals List */}
                {formData.goals.map((goal, index) => (
                  <View key={index} style={styles.goalItem}>
                    <View style={styles.goalHeader}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: getStatusColor(
                              goal.status,
                              "goal"
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {goal.status}
                        </Text>
                      </View>
                    </View>
                    {goal.description && (
                      <Text style={styles.goalDescription}>
                        {goal.description}
                      </Text>
                    )}
                    <Text style={styles.goalDate}>
                      Target Date: {goal.target_date.toLocaleDateString()}
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
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4A90E2",
  },
  lovedOneSelector: {
    maxHeight: 60,
    marginTop: 8,
  },
  lovedOneList: {
    paddingVertical: 4,
    gap: 8,
  },
  lovedOneItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedLovedOne: {
    backgroundColor: "#4A90E2",
    borderColor: "#357ABD",
  },
  lovedOneName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  selectedLovedOneName: {
    color: "#FFFFFF",
  },
  carePlanList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  carePlanItem: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
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
    color: "#111827",
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: "#374151",
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
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#1F2937",
    flex: 1,
  },
  goalDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1F2937",
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
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    color: "#1F2937",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#DC2626",
  },
  submitButton: {
    backgroundColor: "#059669",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
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
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  selectedStatus: {
    backgroundColor: (props) => {
      switch (props.status) {
        case "ACTIVE":
          return "#059669";
        case "DRAFT":
          return "#F59E0B";
        case "COMPLETED":
          return "#2563EB";
        case "ARCHIVED":
          return "#6B7280";
        default:
          return "#F59E0B";
      }
    },
    borderColor: (props) => {
      switch (props.status) {
        case "ACTIVE":
          return "#047857";
        case "DRAFT":
          return "#D97706";
        case "COMPLETED":
          return "#1E40AF";
        case "ARCHIVED":
          return "#4B5563";
        default:
          return "#D97706";
      }
    },
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  selectedStatusText: {
    color: "#FFFFFF",
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
    color: "#1F2937",
  },
  addGoalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
    marginLeft: 8,
  },
  goalItem: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#1F2937",
    flex: 1,
  },
  goalDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
  },
  goalDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  pickerCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxHeight: 400,
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
  pickerHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 250,
  },
  picker: {
    width: "100%",
    height: 200,
  },
  pickerFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredPickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  lovedOneOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginRight: 8,
  },
  lovedOneOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  selectedLovedOne: {
    backgroundColor: "#4A90E2",
    borderColor: "#357ABD",
  },
  selectedLovedOneName: {
    color: "#FFFFFF",
  },
  lovedOneList: {
    paddingVertical: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    backgroundColor: "white",
    minHeight: 50,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "relative",
    top: 0,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownPlaceholder: {
    color: "#666666",
    fontSize: 16,
  },
});

export default CarePlanScreen;
