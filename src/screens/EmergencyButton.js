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
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          <View style={[styles.section, { zIndex: 3000 }]}>
            <Text style={styles.label}>Loved One *</Text>
            <DropDownPicker
              open={lovedOneOpen}
              value={lovedOne}
              items={lovedOneItems}
              setOpen={setLovedOneOpen}
              setValue={setLovedOne}
              setItems={setLovedOneItems}
              placeholder="Select Loved One"
              style={styles.dropdown}
              zIndex={3000}
              listMode="SCROLLVIEW"
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
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location (e.g., Home - Main Room)"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Describe the emergency situation..."
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Response Needed By</Text>
            <DateTimePicker
              value={responseNeededBy}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                if (selectedDate) setResponseNeededBy(selectedDate);
              }}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleButtonPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  backButton: {
    padding: 8,
  },
  formContainer: { flex: 1, padding: 20, gap: 24 },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    backgroundColor: "white",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    backgroundColor: "white",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownPlaceholder: {
    color: "#666",
  },
  requesterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    gap: 12,
  },
  requesterText: {
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    fontSize: 16,
    minHeight: 120,
    color: "#333",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E1E1E1",
  },
  submitButton: {
    backgroundColor: "#EA4335",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#EA4335",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: "#EA4335",
    fontSize: 16,
  },
  noDataText: {
    color: "#666",
    fontSize: 16,
  },
});

export default EmergencyButton;
