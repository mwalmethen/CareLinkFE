import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Picker } from "@react-native-picker/picker";

const MedicationForm = () => {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission, e.g., send data to the server
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Form</Text>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.label}>Loved One</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Loved One ID"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
          name="loved_one"
          rules={{ required: true }}
        />

        <Text style={styles.label}>Name</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Medication Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
          name="name"
          rules={{ required: true }}
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

        <Text style={styles.label}>Created By</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Caregiver ID"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
          name="created_by"
          rules={{ required: true }}
        />

        <Text style={styles.label}>Status</Text>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <Picker
              selectedValue={value}
              onValueChange={(itemValue) => onChange(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="ACTIVE" value="ACTIVE" />
              <Picker.Item label="DISCONTINUED" value="DISCONTINUED" />
              <Picker.Item label="COMPLETED" value="COMPLETED" />
            </Picker>
          )}
          name="status"
          rules={{ required: true }}
        />

        <Button
          title="Submit"
          onPress={handleSubmit(onSubmit)}
          color="#4A90E2"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F6FA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
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
});

export default MedicationForm;
