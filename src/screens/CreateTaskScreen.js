import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  Animated,
  Pressable,
  Keyboard,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getAllLovedOnes, getLovedOneCaregivers } from "../api/Users";
import { useUser } from "../api/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import { createTask } from "../api/CreateTask";
import DropDownPicker from "react-native-dropdown-picker";

const DropdownSelect = ({
  label,
  value,
  options = [],
  onSelect,
  icon,
  disabled,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOpen ? Math.min(options.length * 50, 200) : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen, options.length]);

  const getDisplayName = (option) => {
    if (option?.user?.name) {
      return option.user.name;
    }
    return option?.name || "";
  };

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.dropdownButton,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
        onPress={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <Ionicons name={icon} size={20} color="#666" />
        <Text
          style={[styles.dropdownButtonText, !value && styles.placeholderText]}
        >
          {value ? getDisplayName(value) : placeholder || `Select ${label}`}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#666"
        />
      </Pressable>
      <Animated.View
        style={[
          styles.dropdownList,
          {
            maxHeight: animatedHeight,
          },
        ]}
      >
        <ScrollView
          nestedScrollEnabled={true}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {options.map((option) => (
            <Pressable
              key={option.id || option._id}
              style={({ pressed }) => [
                styles.dropdownItem,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {getDisplayName(option)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const DateTimeButton = ({ value, icon, onPress }) => (
  <Pressable
    style={({ pressed }) => [styles.dateTimeButton, pressed && styles.pressed]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={20} color="#666" />
    <Text style={styles.dateTimeText}>{value}</Text>
  </Pressable>
);

const getTaskCategoryInfo = (category) => {
  switch (category) {
    case "MEDICATION":
      return {
        color: "#E11D48",
        lightColor: "#FFF1F2",
        gradientColors: ["#F43F5E", "#E11D48"],
        icon: "medical-outline",
      };
    case "HEALTH_CHECK":
      return {
        color: "#0891B2",
        lightColor: "#ECFEFF",
        gradientColors: ["#06B6D4", "#0891B2"],
        icon: "fitness-outline",
      };
    case "APPOINTMENT":
      return {
        color: "#7C3AED",
        lightColor: "#F3E8FF",
        gradientColors: ["#8B5CF6", "#7C3AED"],
        icon: "calendar-outline",
      };
    case "EXERCISE":
      return {
        color: "#059669",
        lightColor: "#ECFDF5",
        gradientColors: ["#10B981", "#059669"],
        icon: "barbell-outline",
      };
    case "DIET":
      return {
        color: "#D97706",
        lightColor: "#FFFBEB",
        gradientColors: ["#F59E0B", "#D97706"],
        icon: "nutrition-outline",
      };
    case "HYGIENE":
      return {
        color: "#0284C7",
        lightColor: "#F0F9FF",
        gradientColors: ["#0EA5E9", "#0284C7"],
        icon: "water-outline",
      };
    case "SOCIAL":
      return {
        color: "#7E22CE",
        lightColor: "#FAF5FF",
        gradientColors: ["#9333EA", "#7E22CE"],
        icon: "people-outline",
      };
    default:
      return {
        color: "#6B7280",
        lightColor: "#F9FAFB",
        gradientColors: ["#9CA3AF", "#6B7280"],
        icon: "list-outline",
      };
  }
};

const getPriorityInfo = (priority) => {
  switch (priority) {
    case "HIGH":
      return {
        color: "#DC2626",
        lightColor: "#FEF2F2",
        gradientColors: ["#EF4444", "#DC2626"],
      };
    case "MEDIUM":
      return {
        color: "#F59E0B",
        lightColor: "#FFFBEB",
        gradientColors: ["#FBBF24", "#F59E0B"],
      };
    case "LOW":
      return {
        color: "#10B981",
        lightColor: "#ECFDF5",
        gradientColors: ["#34D399", "#10B981"],
      };
    default:
      return {
        color: "#6B7280",
        lightColor: "#F9FAFB",
        gradientColors: ["#9CA3AF", "#6B7280"],
      };
  }
};

const CreateTaskScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: new Date(),
    start_time: new Date(),
    end_time: new Date(),
    category: "MEDICATION",
    priority: "MEDIUM",
    assigned_to: "",
  });

  const categoryOptions = [
    { _id: "MEDICATION", name: "Medication" },
    { _id: "HEALTH_CHECK", name: "Health Check" },
    { _id: "APPOINTMENT", name: "Appointment" },
    { _id: "EXERCISE", name: "Exercise" },
    { _id: "DIET", name: "Diet" },
    { _id: "HYGIENE", name: "Hygiene" },
    { _id: "SOCIAL", name: "Social" },
  ];

  const priorityOptions = [
    { _id: "HIGH", name: "High" },
    { _id: "MEDIUM", name: "Medium" },
    { _id: "LOW", name: "Low" },
  ];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 30 * 60000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedLovedOne, setSelectedLovedOne] = useState(null);
  const [caregivers, setCaregivers] = useState([]);
  const [isLoadingCaregivers, setIsLoadingCaregivers] = useState(false);
  const { token } = useUser();
  const queryClient = useQueryClient();

  const { data: lovedOnes = [] } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
  });

  // Fetch caregivers when a loved one is selected
  useEffect(() => {
    const fetchCaregivers = async () => {
      if (selectedLovedOne) {
        try {
          setIsLoadingCaregivers(true);
          const data = await getLovedOneCaregivers(selectedLovedOne._id);
          setCaregivers(data || []);
        } catch (error) {
          console.error("Error fetching caregivers:", error);
          Alert.alert("Error", "Failed to fetch caregivers");
        } finally {
          setIsLoadingCaregivers(false);
        }
      }
    };

    fetchCaregivers();
  }, [selectedLovedOne]);

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: ({ lovedOneId, taskData }) => createTask(lovedOneId, taskData),
    onMutate: async ({ lovedOneId, taskData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(["tasks"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["tasks"], (old) => {
        if (!old)
          return { pending: [taskData], completed: [], all: [taskData] };
        return {
          ...old,
          pending: [
            ...(old.pending || []),
            { ...taskData, _id: Date.now().toString() },
          ],
          all: [
            ...(old.all || []),
            { ...taskData, _id: Date.now().toString() },
          ],
        };
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
      Alert.alert("Error", "Failed to create task. Please try again.");
    },
    onSuccess: () => {
      Alert.alert("Success", "Task created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleSubmit = async () => {
    if (!selectedLovedOne) {
      Alert.alert("Error", "Please select a loved one");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        due_date: date,
        start_time: startTime,
        end_time: endTime,
        category: formData.category.value || formData.category,
        priority: formData.priority.value || formData.priority,
        assigned_to: formData.assigned_to?._id || formData.assigned_to,
      };

      createMutation.mutate({
        lovedOneId: selectedLovedOne._id,
        taskData,
      });
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task. Please try again.");
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onStartTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setStartTime(selectedTime);
      setEndTime(new Date(selectedTime.getTime() + 30 * 60000));
    }
  };

  const onEndTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      if (selectedTime <= startTime) {
        Alert.alert("Error", "End time must be after start time");
        return;
      }
      setEndTime(selectedTime);
    }
  };

  const handleConfirm = () => {
    setShowDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
  };

  const showPicker = (type) => {
    Keyboard.dismiss();

    switch (type) {
      case "date":
        setShowDatePicker(true);
        setShowStartTimePicker(false);
        setShowEndTimePicker(false);
        break;
      case "startTime":
        setShowDatePicker(false);
        setShowStartTimePicker(true);
        setShowEndTimePicker(false);
        break;
      case "endTime":
        setShowDatePicker(false);
        setShowStartTimePicker(false);
        setShowEndTimePicker(true);
        break;
    }
  };

  const renderCategoryOption = (option) => {
    const categoryInfo = getTaskCategoryInfo(option._id);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.categoryOption,
          formData.category === option._id && styles.selectedCategoryOption,
          pressed && styles.pressed,
        ]}
        onPress={() => setFormData({ ...formData, category: option._id })}
      >
        <LinearGradient
          colors={categoryInfo.gradientColors}
          style={styles.categoryIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={categoryInfo.icon} size={20} color="white" />
        </LinearGradient>
        <Text
          style={[
            styles.categoryOptionText,
            formData.category === option._id && styles.selectedCategoryText,
          ]}
        >
          {option.name}
        </Text>
        {formData.category === option._id && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={categoryInfo.color}
          />
        )}
      </Pressable>
    );
  };

  const renderPriorityOption = (option) => {
    const priorityInfo = getPriorityInfo(option._id);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.priorityOption,
          formData.priority === option._id && styles.selectedPriorityOption,
          pressed && styles.pressed,
        ]}
        onPress={() => setFormData({ ...formData, priority: option._id })}
      >
        <LinearGradient
          colors={priorityInfo.gradientColors}
          style={styles.priorityBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.priorityBadgeText}>{option.name}</Text>
        </LinearGradient>
      </Pressable>
    );
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
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Create New Task</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryList}>
              {categoryOptions.map((option) => renderCategoryOption(option))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.priorityList}>
              {priorityOptions.map((option) => renderPriorityOption(option))}
            </View>
          </View>

          <View style={styles.horizontalPickersContainer}>
            <View style={styles.horizontalPickerItem}>
              <DropdownSelect
                label="Loved One"
                value={selectedLovedOne}
                options={lovedOnes}
                onSelect={(lovedOne) => {
                  setSelectedLovedOne(lovedOne);
                  setSelectedMember(null);
                }}
                icon="heart-outline"
              />
            </View>

            <View style={styles.horizontalPickerItem}>
              {selectedLovedOne && (
                <DropdownSelect
                  label="Assign To"
                  value={selectedMember}
                  options={caregivers}
                  onSelect={setSelectedMember}
                  icon="person-outline"
                  loading={isLoadingCaregivers}
                />
              )}
            </View>
          </View>

          <View style={styles.dateTimeSection}>
            <Text style={styles.label}>Due Date</Text>
            <DateTimeButton
              value={date.toLocaleDateString()}
              icon="calendar-outline"
              onPress={() => showPicker("date")}
            />
          </View>

          <View style={styles.timeSection}>
            <View style={styles.timeColumn}>
              <Text style={styles.label}>Start Time</Text>
              <DateTimeButton
                value={startTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
                icon="time-outline"
                onPress={() => showPicker("startTime")}
              />
            </View>

            <View style={styles.timeColumn}>
              <Text style={styles.label}>End Time</Text>
              <DateTimeButton
                value={endTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
                icon="time-outline"
                onPress={() => showPicker("endTime")}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date and Time Pickers */}
      {Platform.OS === "ios" ? (
        (showDatePicker || showStartTimePicker || showEndTimePicker) && (
          <>
            <Pressable
              style={styles.modalOverlay}
              onPress={() => {
                setShowDatePicker(false);
                setShowStartTimePicker(false);
                setShowEndTimePicker(false);
              }}
            />
            <View style={styles.centeredPickerContainer}>
              <View style={styles.pickerCard}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>
                    {showDatePicker
                      ? "Select Date"
                      : showStartTimePicker
                      ? "Select Start Time"
                      : "Select End Time"}
                  </Text>
                </View>
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={
                      showDatePicker
                        ? date
                        : showStartTimePicker
                        ? startTime
                        : endTime
                    }
                    mode={showDatePicker ? "date" : "time"}
                    is24Hour={false}
                    display="spinner"
                    onChange={
                      showDatePicker
                        ? onDateChange
                        : showStartTimePicker
                        ? onStartTimeChange
                        : onEndTimeChange
                    }
                    textColor="#000000"
                    style={styles.picker}
                  />
                </View>
                <View style={styles.pickerFooter}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.footerButton,
                      styles.cancelButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      setShowDatePicker(false);
                      setShowStartTimePicker(false);
                      setShowEndTimePicker(false);
                    }}
                  >
                    <Text
                      style={[styles.footerButtonText, styles.cancelButtonText]}
                    >
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.footerButton,
                      styles.confirmButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={handleConfirm}
                  >
                    <Text
                      style={[
                        styles.footerButtonText,
                        styles.confirmButtonText,
                      ]}
                    >
                      Confirm
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </>
        )
      ) : (
        // Android DateTimePicker implementation
        <>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={date}
              onChange={(event, selectedDate) => {
                if (event.type === "set" && selectedDate) {
                  setDate(selectedDate);
                }
                setShowDatePicker(false);
              }}
            />
          )}
          {showStartTimePicker && (
            <DateTimePicker
              mode="time"
              value={startTime}
              onChange={(event, selectedTime) => {
                if (event.type === "set" && selectedTime) {
                  setStartTime(selectedTime);
                  setEndTime(new Date(selectedTime.getTime() + 30 * 60000));
                }
                setShowStartTimePicker(false);
              }}
            />
          )}
          {showEndTimePicker && (
            <DateTimePicker
              mode="time"
              value={endTime}
              onChange={(event, selectedTime) => {
                if (event.type === "set" && selectedTime) {
                  if (selectedTime <= startTime) {
                    Alert.alert("Error", "End time must be after start time");
                    return;
                  }
                  setEndTime(selectedTime);
                }
                setShowEndTimePicker(false);
              }}
            />
          )}
        </>
      )}

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.pressed,
          ]}
          onPress={handleSubmit}
        >
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.createButtonText}>Create Task</Text>
          </LinearGradient>
        </Pressable>
      </View>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 8,
    gap: 8,
    flex: 1,
    minWidth: "48%",
  },
  selectedCategoryOption: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
  selectedCategoryText: {
    color: "#1F2937",
    fontWeight: "600",
  },
  priorityList: {
    flexDirection: "row",
    gap: 8,
  },
  priorityOption: {
    flex: 1,
  },
  priorityBadge: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  priorityBadgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedPriorityOption: {
    transform: [{ scale: 1.05 }],
  },
  dateTimeSection: {
    gap: 8,
  },
  timeSection: {
    flexDirection: "row",
    gap: 16,
  },
  timeColumn: {
    flex: 1,
    gap: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  createButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
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
    borderRadius: 12,
    width: "90%",
    alignItems: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  centeredPickerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  pickerHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  pickerWrapper: {
    backgroundColor: "#ffffff",
    paddingVertical: 20,
  },
  picker: {
    height: 216,
    backgroundColor: "#ffffff",
  },
  pickerFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E1E1E1",
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#f8f8f8",
    borderRightWidth: 0.5,
    borderRightColor: "#E1E1E1",
  },
  confirmButton: {
    backgroundColor: "#f8f8f8",
    borderLeftWidth: 0.5,
    borderLeftColor: "#E1E1E1",
  },
  cancelButtonText: {
    color: "#666",
  },
  confirmButtonText: {
    color: "#4A90E2",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  horizontalPickersContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
    zIndex: 2,
  },
  horizontalPickerItem: {
    flex: 1,
    zIndex: 2,
  },
  dropdownContainer: {
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    height: 48,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  placeholderText: {
    color: "#94A3B8",
  },
  disabled: {
    opacity: 0.5,
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
    zIndex: 2,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "white",
    height: 48,
    justifyContent: "center",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#1F2937",
  },
});

export default CreateTaskScreen;
