import { React, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllLovedOnes } from "../api/Users";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import { createMedication } from "../api/Medication";

const MedicationForm = ({ navigation }) => {
  const [lovedOne, setLovedOne] = useState("");
  const [lovedOneItems, setLovedOneItems] = useState([]);
  const [lovedOneOpen, setLovedOneOpen] = useState(false);
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [times, setTimes] = useState("");
  const [instructions, setInstructions] = useState("");
  const [purpose, setPurpose] = useState("");
  const [prescribingDoctor, setPrescribingDoctor] = useState("");
  const [pharmacy, setPharmacy] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const queryClient = useQueryClient();

  const [frequencyItems] = useState([
    { label: "Select Frequency", value: "" },
    { label: "Daily", value: "DAILY" },
    { label: "Weekly", value: "WEEKLY" },
    { label: "Monthly", value: "MONTHLY" },
    { label: "As Needed", value: "AS_NEEDED" },
  ]);

  const [statusItems] = useState([
    { label: "Select Status", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Discontinued", value: "DISCONTINUED" },
    { label: "Completed", value: "COMPLETED" },
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

  const createMutation = useMutation({
    mutationFn: ({ lovedOneId, newMedication }) =>
      createMedication(lovedOneId, newMedication),
    onMutate: async ({ lovedOneId, newMedication }) => {
      await queryClient.cancelQueries({ queryKey: ["medications"] });

      // Snapshot the previous value
      const previousMedications = queryClient.getQueryData(["medications"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["medications"], (old) => {
        if (!old)
          return {
            pending: [newMedication],
            completed: [],
            all: [newMedication],
          };
        return {
          ...old,
          pending: [
            ...(old.pending || []),
            { ...newMedication, _id: Date.now().toString() },
          ],
          all: [
            ...(old.all || []),
            { ...newMedication, _id: Date.now().toString() },
          ],
        };
      });

      return { previousMedications };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["medications"], context.previousMedications);
      Alert.alert("Error", "Failed to create medication. Please try again.");
    },
    onSuccess: () => {
      Alert.alert("Success", "Medication created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
  });

  const handleButtonPress = async () => {
    if (!lovedOne) {
      Alert.alert("Error", "Please select a loved one");
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert("Error", "Please enter valid start and end dates");
      return;
    }

    const isValidStartDate = !isNaN(new Date(startDate).getTime());
    const isValidEndDate = !isNaN(new Date(endDate).getTime());

    if (!isValidStartDate || !isValidEndDate) {
      Alert.alert("Error", "Please enter valid dates in the format YYYY-MM-DD");
      return;
    }

    try {
      const newMedication = {
        loved_one: lovedOne,
        name: medicationName,
        dosage: dosage,
        frequency: frequency,
        start_date: new Date(startDate), // Convert to Date object
        end_date: new Date(endDate), // Convert to Date object
        notes: note,
        times: times,
        instructions: instructions,
        purpose: purpose,
        prescribing_doctor: prescribingDoctor,
        pharmacy: pharmacy,
        side_effects: sideEffects,
        status: status,
      };

      console.log("New Medication Data:", newMedication);

      createMutation.mutate({
        lovedOneId: lovedOne,
        newMedication,
      });
    } catch (error) {
      console.error("Error creating medication:", error);
      Alert.alert("Error", "Failed to create medication. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.formContainer}>
          <View style={styles.section}>
            <Text style={styles.label}>Loved One</Text>
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
            <Text style={styles.label}>Status</Text>
            <DropDownPicker
              open={open}
              value={status}
              items={statusItems}
              setOpen={setOpen}
              setValue={setStatus}
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
            <Text style={styles.label}>Dosage</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Dosage"
              value={dosage}
              onChangeText={setDosage}
              placeholderTextColor="#999"
            />
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, marginRight: 5 }}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
                placeholderTextColor="#999"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 5 }}>
              <Text style={styles.label}>End Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Times</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter times (comma separated)"
              value={times}
              onChangeText={setTimes}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Frequency</Text>
            <DropDownPicker
              open={frequencyOpen}
              value={frequency}
              items={frequencyItems}
              setOpen={setFrequencyOpen}
              setValue={setFrequency}
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
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter instructions"
              value={instructions}
              onChangeText={setInstructions}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Purpose</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter purpose"
              value={purpose}
              onChangeText={setPurpose}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Prescribing Doctor</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter prescribing doctor's name"
              value={prescribingDoctor}
              onChangeText={setPrescribingDoctor}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Pharmacy</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pharmacy name"
              value={pharmacy}
              onChangeText={setPharmacy}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Side Effects</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter side effects (comma separated)"
              value={sideEffects}
              onChangeText={setSideEffects}
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
    </View>
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
