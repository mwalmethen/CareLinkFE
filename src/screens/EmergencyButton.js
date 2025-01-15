import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { useUser } from "../api/UserContext";
import { getAllLovedOnes } from "../api/Users";
import { createEmergencyAlert } from "../api";
import { useQuery } from "@tanstack/react-query";
import DateTimePicker from "@react-native-community/datetimepicker";

const EmergencyButton = ({ navigation }) => {
  const [lovedOne, setLovedOne] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [responseNeededBy, setResponseNeededBy] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Dropdowns state
  const [typeOpen, setTypeOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [lovedOneOpen, setLovedOneOpen] = useState(false);

  // Dropdown items
  const [typeItems] = useState([
    { label: "Medical Emergency", value: "MEDICAL_EMERGENCY" },
    { label: "Task Help", value: "TASK_HELP" },
    { label: "General Assistance", value: "GENERAL_ASSISTANCE" },
  ]);

  const [priorityItems] = useState([
    { label: "Urgent", value: "URGENT" },
    { label: "High", value: "HIGH" },
    { label: "Critical", value: "CRITICAL" },
  ]);

  const [lovedOneItems, setLovedOneItems] = useState([]);
  const { user } = useUser();

  const { data, isLoading, error } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
  });

  useEffect(() => {
    if (data) {
      const formattedData = data.map((lovedOne) => ({
        label: lovedOne.name,
        value: lovedOne._id,
      }));
      setLovedOneItems(formattedData);
    }
  }, [data]);

  const handleButtonPress = async () => {
    if (!lovedOne || !type || !priority || !description || !location) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const emergencyData = {
        type,
        priority,
        description,
        location,
        response_needed_by: responseNeededBy.toISOString(),
        // task field is optional, so we're not including it here
      };

      const response = await createEmergencyAlert(lovedOne, emergencyData);
      Alert.alert("Success", "Emergency alert sent successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send emergency alert"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emergency Alert</Text>
        </View>

        <ScrollView
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.section, { zIndex: 3000 }]}>
            <Text style={styles.label}>
              Loved One <Text style={styles.requiredField}>*</Text>
            </Text>
            <DropDownPicker
              open={lovedOneOpen}
              value={lovedOne}
              items={lovedOneItems}
              setOpen={setLovedOneOpen}
              setValue={setLovedOne}
              setItems={setLovedOneItems}
              placeholder="Select Loved One"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
            />
          </View>

          <View style={[styles.section, { zIndex: 2000 }]}>
            <Text style={styles.label}>Emergency Type *</Text>
            <DropDownPicker
              open={typeOpen}
              value={type}
              items={typeItems}
              setOpen={setTypeOpen}
              setValue={setType}
              placeholder="Select emergency type"
              style={styles.dropdown}
              zIndex={2000}
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={[styles.section, { zIndex: 1000 }]}>
            <Text style={styles.label}>Priority Level *</Text>
            <DropDownPicker
              open={priorityOpen}
              value={priority}
              items={priorityItems}
              setOpen={setPriorityOpen}
              setValue={setPriority}
              placeholder="Select priority level"
              style={styles.dropdown}
              zIndex={1000}
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Location <Text style={styles.requiredField}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location (e.g., Home - Main Room)"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Description <Text style={styles.requiredField}>*</Text>
            </Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Describe the emergency situation..."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Response Needed By</Text>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={responseNeededBy}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  if (selectedDate) setResponseNeededBy(selectedDate);
                }}
                style={{ height: 50 }}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleButtonPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="warning" size={24} color="white" />
                <Text style={styles.submitButtonText}>
                  Send Emergency Alert
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    backgroundColor: "white",
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "white",
    height: 50,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "white",
    minHeight: 120,
    textAlignVertical: "top",
  },
  datePickerContainer: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    overflow: "hidden",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E1E1E1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: "#EA4335",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#EA4335",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  requiredField: {
    color: "#EA4335",
    marginLeft: 4,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownPlaceholder: {
    color: "#999",
  },
  errorText: {
    color: "#EA4335",
    fontSize: 14,
    marginTop: 4,
  },
  priorityHigh: {
    backgroundColor: "#FBBC05",
  },
  priorityUrgent: {
    backgroundColor: "#EA4335",
  },
  priorityCritical: {
    backgroundColor: "#DB4437",
  },
});

export default EmergencyButton;
