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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Picker } from "@react-native-picker/picker";
import { useQuery } from "@tanstack/react-query";
import { getAllLovedOnes } from "../api/Users";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";

const MedicationForm = () => {
  const { control, handleSubmit } = useForm();
  const [lovedOne, setLovedOne] = useState("");
  const [lovedOneItems, setLovedOneItems] = useState([]);
  const [lovedOneOpen, setLovedOneOpen] = useState(false);
  const [medicationName, setMedicationName] = useState("");
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

  const onSubmit = (data) => {
    console.log(data);
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
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

          <Text style={styles.label}>Medication Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter medication name"
            value={medicationName}
            onChangeText={setMedicationName}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Dosage</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Dosage"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
              />
            )}
            name="dosage"
            rules={{ required: true }}
          />
          <View style={[styles.section, { zIndex: 2000 }]}>
            <Text style={styles.label}>Frequency</Text>
            <DropDownPicker
              open={frequencyOpen}
              value={type}
              items={frequency}
              setOpen={setFrequencyOpen}
              setValue={setType}
              setItems={setFrequency}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              placeholder="Select frequency"
              zIndex={2000}
              zIndexInverse={2000}
              listMode="SCROLLVIEW"
            />
          </View>

          <Text style={styles.label}>Frequency</Text>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onChange(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Frequency" value="" />
                <Picker.Item label="DAILY" value="DAILY" />
                <Picker.Item label="WEEKLY" value="WEEKLY" />
                <Picker.Item label="MONTHLY" value="MONTHLY" />
                <Picker.Item label="AS_NEEDED" value="AS_NEEDED" />
              </Picker>
            )}
            name="frequency"
            rules={{ required: true }}
          />

          <Text style={styles.label}>Notes</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Additional Notes"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
              />
            )}
            name="notes"
          />

          <View style={[styles.section, { zIndex: 2000 }]}>
            <Text style={styles.label}>Status</Text>
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
              placeholder="Select status type"
              zIndex={2000}
              zIndexInverse={2000}
              listMode="SCROLLVIEW"
            />
          </View>

          <Button
            title="Submit"
            onPress={handleSubmit(onSubmit)}
            color="#4A90E2"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
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
  picker: {
    height: 50,
    borderColor: "#E1E1E1",
    borderWidth: 1,
    borderRadius: 8,
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
});

export default MedicationForm;
