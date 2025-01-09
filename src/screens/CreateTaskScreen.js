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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllLovedOnes } from "../api/Users";
import { useUser } from "../api/UserContext";
import { LinearGradient } from "expo-linear-gradient";

const DropdownSelect = ({ label, value, options = [], onSelect, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOpen ? Math.min(options.length * 50, 200) : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen, options.length]);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.dropdownButton,
          pressed && styles.pressed,
        ]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Ionicons name={icon} size={20} color="#666" />
        <Text style={styles.dropdownButtonText}>
          {value?.name || `Select ${label}`}
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
              <Text style={styles.dropdownItemText}>{option.name}</Text>
              {(value?.id === option.id || value?._id === option._id) && (
                <Ionicons name="checkmark" size={20} color="#4A90E2" />
              )}
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

const CreateTaskScreen = ({ navigation }) => {
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
  const { token } = useUser();
  const queryClient = useQueryClient();

  const { data: lovedOnes = [] } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
  });

  const familyMembers = [
    { id: 1, name: "Me" },
    { id: 2, name: "Mother" },
    { id: 3, name: "Father" },
    { id: 4, name: "Abdullah" },
  ];

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    if (!selectedLovedOne) {
      Alert.alert("Error", "Please select a loved one");
      return;
    }

    if (!selectedMember) {
      Alert.alert("Error", "Please select who to assign the task to");
      return;
    }

    try {
      const formattedStartTime = startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const formattedEndTime = endTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const newTask = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        date: date.getDate().toString(),
        time: `${formattedStartTime} - ${formattedEndTime}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        lovedOne: selectedLovedOne,
        assignedTo: selectedMember.name,
        completed: false,
        note: "",
      };

      const existingTasks = queryClient.getQueryData(["tasks"]) || [];
      queryClient.setQueryData(["tasks"], [...existingTasks, newTask]);

      Alert.alert("Success", "Task created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
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
        <Text style={styles.headerTitle}>Create New Task</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
            />
          </View>

          <DropdownSelect
            label="Loved One"
            value={selectedLovedOne}
            options={lovedOnes}
            onSelect={setSelectedLovedOne}
            icon="heart-outline"
          />

          <DropdownSelect
            label="Assign To"
            value={selectedMember}
            options={familyMembers}
            onSelect={setSelectedMember}
            icon="person-outline"
          />

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
          onPress={handleCreateTask}
        >
          <LinearGradient
            colors={["#4A90E2", "#357ABD"]}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdownContainer: {
    marginBottom: 20,
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  dropdownList: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E1E1E1",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  dateTimeSection: {
    marginBottom: 20,
  },
  timeSection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  timeColumn: {
    flex: 1,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
    backgroundColor: "#f8f8f8",
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    flex: 1,
  },
  pickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    minWidth: 60,
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#007AFF",
  },
  pickerWrapper: {
    backgroundColor: "#ffffff",
    paddingTop: 8,
  },
  picker: {
    height: 216,
    backgroundColor: "#ffffff",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
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
    opacity: 0.8,
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
});

export default CreateTaskScreen;
