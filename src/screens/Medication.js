import { React, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getAllLovedOnes } from "../api/Users";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const MedicationForm = () => {
  const [lovedOne, setLovedOne] = useState("");
  const [lovedOneItems, setLovedOneItems] = useState([]);
  const [lovedOneOpen, setLovedOneOpen] = useState(false);
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [type, setType] = useState("");
  const [items, setItems] = useState([
    { label: "Select Status", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Discontinued", value: "DISCONTINUED" },
    { label: "Completed", value: "COMPLETED" },
  ]);
  const [frequency, setFrequency] = useState([
    { label: "Select Frequency", value: "" },
    { label: "Daily", value: "DAILY" },
    { label: "Weekly", value: "WEEKLY" },
    { label: "Monthly", value: "MONTHLY" },
    { label: "As Needed", value: "AS_NEEDED" },
  ]);

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
        <ScrollView style={styles.formContainer}>
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
                style={styles.input}
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

          <View style={styles.section}>
            <Text style={styles.label}>Medication Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter medication name"
              value={medicationName}
              onChangeText={setMedicationName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Dosage</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Dosage"
              value={dosage}
              onChangeText={setDosage}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Frequency</Text>
            <DropDownPicker
              open={frequencyOpen}
              value={type}
              items={frequency}
              setOpen={setFrequencyOpen}
              setValue={setType}
              setItems={setFrequency}
              style={styles.input}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              placeholder="Select frequency"
              zIndex={2000}
              zIndexInverse={2000}
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Status</Text>
            <DropDownPicker
              open={open}
              value={type}
              items={items}
              setOpen={setOpen}
              setValue={setType}
              setItems={setItems}
              style={styles.input}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              placeholder="Select status type"
              zIndex={2000}
              zIndexInverse={2000}
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              placeholder="Describe the emergency situation..."
              value={note}
              onChangeText={setNote}
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
            <Ionicons name="medkit" size={24} color="white" />
            <Text style={styles.submitButtonText}>Save Medication</Text>
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
  formContainer: { flex: 1, padding: 15, gap: 24 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#E1E1E1",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  section: {
    gap: 12,
  },
  keyboardView: {
    flex: 1,
  },
  noDataText: {
    color: "#666",
    fontSize: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E1E1E1",
  },
  submitButton: {
    backgroundColor: "rgba(74,144,226,0.9)",
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
  dropdownPlaceholder: {
    color: "#666",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    backgroundColor: "white",
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
});

export default MedicationForm;
