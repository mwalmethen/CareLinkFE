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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { useUser } from "../api/UserContext";
import { getAllLovedOnes } from "../api/Users";
import { useQuery } from "@tanstack/react-query";

const EmergencyButton = ({ navigation }) => {
  const [lovedOne, setLovedOne] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "Select type", value: "" },
    { label: "Task Help", value: "TASK_HELP" },
    { label: "Medical Emergency", value: "MEDICAL_EMERGENCY" },
    { label: "General Assistance", value: "GENERAL_ASSISTANCE" },
  ]);
  const [lovedOneOpen, setLovedOneOpen] = useState(false);
  const [lovedOneItems, setLovedOneItems] = useState([]);
  const { user } = useUser();

  const { data, isLoading, error } = useQuery({
    queryKey: ["lovedOnes"],
    queryFn: getAllLovedOnes,
    enabled: true,
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

  const handleButtonPress = () => {
    const emergencyRequest = {
      loved_one: lovedOne,
      requester: user.name,
      type: type,
      description: description,
    };
    console.log(emergencyRequest);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emergency Alert</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          <View style={styles.section}>
            <Text style={styles.label}>Loved One</Text>
            {isLoading && <ActivityIndicator size="large" color="#4A90E2" />}
            {error && (
              <Text style={styles.errorText}>Failed to load loved ones.</Text>
            )}
            {!isLoading && !error && lovedOneItems.length > 0 ? (
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
                zIndex={3000}
                zIndexInverse={1000}
                listMode="SCROLLVIEW"
              />
            ) : (
              !isLoading && (
                <Text style={styles.noDataText}>No loved ones added yet.</Text>
              )
            )}
          </View>

          <View style={[styles.section, { zIndex: 2000 }]}>
            <Text style={styles.label}>Emergency Type</Text>
            <DropDownPicker
              open={open}
              value={type}
              items={items}
              setOpen={setOpen}
              setValue={setType}
              setItems={setItems}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              placeholder="Select emergency type"
              zIndex={2000}
              zIndexInverse={2000}
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={[styles.section, { zIndex: 1000 }]}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Describe the emergency situation..."
              value={description}
              onChangeText={setDescription}
              style={styles.textArea}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#666"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleButtonPress}
          >
            <Ionicons name="warning" size={24} color="white" />
            <Text style={styles.submitButtonText}>Send Emergency Request</Text>
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
