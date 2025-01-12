import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../api/UserContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import moment from "moment";

const SectionHeader = ({ title, count }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.countBadge}>
      <Text style={styles.countText}>{count}</Text>
    </View>
  </View>
);

const FormDatePicker = ({ label, value, onChange, style }) => {
  const [show, setShow] = useState(false);
  const date = value ? new Date(value) : new Date();

  return (
    <View style={[styles.datePickerContainer, style]}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShow(true)}
      >
        <Text style={styles.datePickerText}>
          {value ? moment(value).format("YYYY-MM-DD") : "Select Date"}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#666" />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShow(false);
            if (selectedDate && event.type !== "dismissed") {
              onChange(moment(selectedDate).format("YYYY-MM-DD"));
            }
          }}
        />
      )}
    </View>
  );
};

const FormSelect = ({ label, value, onValueChange, options, style }) => (
  <View style={[styles.selectContainer, style]}>
    <Text style={styles.pickerLabel}>{label}</Text>
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        {options.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </Picker>
    </View>
  </View>
);

const MedicalHistoryScreen = ({ route, navigation }) => {
  const { lovedOne } = route.params;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { token } = useUser();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    conditions: [
      {
        name: "",
        diagnosis_date: "",
        status: "ACTIVE",
        severity: "MODERATE",
        notes: "",
      },
    ],
    medications: [
      {
        name: "",
        dosage: "",
        start_date: "",
        reason: "",
        side_effects: [""],
        effectiveness: "EFFECTIVE",
      },
    ],
    allergies: [
      {
        allergen: "",
        reaction: "",
        severity: "MODERATE",
      },
    ],
    family_history: [
      {
        condition: "",
        relationship: "",
        notes: "",
      },
    ],
    notes: "",
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(
        `https://seal-app-doaaw.ondigitalocean.app/api/medical-history/loved-one/${lovedOne._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create medical history");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["medicalHistory", lovedOne._id]);
      setIsModalVisible(false);
      Alert.alert("Success", "Medical history created successfully");
      // Reset form
      setFormData({
        conditions: [
          {
            name: "",
            diagnosis_date: "",
            status: "ACTIVE",
            severity: "MODERATE",
            notes: "",
          },
        ],
        medications: [
          {
            name: "",
            dosage: "",
            start_date: "",
            reason: "",
            side_effects: [""],
            effectiveness: "EFFECTIVE",
          },
        ],
        allergies: [
          {
            allergen: "",
            reaction: "",
            severity: "MODERATE",
          },
        ],
        family_history: [
          {
            condition: "",
            relationship: "",
            notes: "",
          },
        ],
        notes: "",
      });
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create medical history");
    },
  });

  const handleSubmit = () => {
    try {
      // Validate and format dates
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      // Validate condition diagnosis date
      if (!dateRegex.test(formData.conditions[0].diagnosis_date)) {
        Alert.alert(
          "Error",
          "Please enter diagnosis date in YYYY-MM-DD format"
        );
        return;
      }

      // Validate medication start date
      if (
        formData.medications[0].start_date &&
        !dateRegex.test(formData.medications[0].start_date)
      ) {
        Alert.alert(
          "Error",
          "Please enter medication start date in YYYY-MM-DD format"
        );
        return;
      }

      // Create a copy of the form data
      const validatedData = {
        ...formData,
        conditions: formData.conditions.map((condition) => ({
          ...condition,
          status: condition.status.toUpperCase(),
          severity: condition.severity.toUpperCase(),
        })),
        medications: formData.medications.map((medication) => ({
          ...medication,
          effectiveness: medication.effectiveness.toUpperCase(),
        })),
        allergies: formData.allergies.map((allergy) => ({
          ...allergy,
          severity: allergy.severity.toUpperCase(),
        })),
      };

      // Remove empty arrays or objects
      if (!validatedData.conditions[0].name) delete validatedData.conditions;
      if (!validatedData.medications[0].name) delete validatedData.medications;
      if (!validatedData.allergies[0].allergen) delete validatedData.allergies;
      if (!validatedData.family_history[0].condition)
        delete validatedData.family_history;
      if (!validatedData.notes) delete validatedData.notes;

      createMutation.mutate(validatedData);
    } catch (error) {
      Alert.alert("Error", "Please check all fields are in the correct format");
    }
  };

  const { data: medicalHistory, isLoading } = useQuery({
    queryKey: ["medicalHistory", lovedOne._id],
    queryFn: async () => {
      try {
        console.log("Fetching medical history for:", lovedOne._id);
        const response = await fetch(
          `https://seal-app-doaaw.ondigitalocean.app/api/medical-history/loved-one/${lovedOne._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log("Medical history response:", data);
        return data;
      } catch (error) {
        console.error("Error fetching medical history:", error);
        throw error;
      }
    },
    enabled: !!lovedOne._id && !!token,
    retry: 1,
  });

  const renderCondition = (condition) => (
    <View key={condition._id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{condition.name}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                condition.status === "ACTIVE" ? "#4CAF50" : "#9E9E9E",
            },
          ]}
        >
          <Text style={styles.statusText}>{condition.status}</Text>
        </View>
      </View>
      <Text style={styles.itemDate}>
        Diagnosed: {new Date(condition.diagnosis_date).toLocaleDateString()}
      </Text>
      <Text style={styles.itemDetail}>Severity: {condition.severity}</Text>
      {condition.notes && (
        <Text style={styles.itemNotes}>{condition.notes}</Text>
      )}
    </View>
  );

  const renderMedication = (medication) => (
    <View key={medication._id} style={styles.itemCard}>
      <Text style={styles.itemTitle}>{medication.name}</Text>
      <Text style={styles.itemDetail}>Dosage: {medication.dosage}</Text>
      <Text style={styles.itemDetail}>Reason: {medication.reason}</Text>
      <Text style={styles.itemDate}>
        Started: {new Date(medication.start_date).toLocaleDateString()}
      </Text>
      {medication.side_effects?.length > 0 && (
        <Text style={styles.itemDetail}>
          Side Effects: {medication.side_effects.join(", ")}
        </Text>
      )}
    </View>
  );

  const renderAllergy = (allergy) => (
    <View key={allergy._id} style={styles.itemCard}>
      <Text style={styles.itemTitle}>{allergy.allergen}</Text>
      <Text style={styles.itemDetail}>Reaction: {allergy.reaction}</Text>
      <Text style={styles.itemDetail}>Severity: {allergy.severity}</Text>
    </View>
  );

  const renderFamilyHistory = (history) => (
    <View key={history._id} style={styles.itemCard}>
      <Text style={styles.itemTitle}>{history.condition}</Text>
      <Text style={styles.itemDetail}>Relation: {history.relationship}</Text>
      {history.notes && <Text style={styles.itemNotes}>{history.notes}</Text>}
    </View>
  );

  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  const severityOptions = [
    { label: "Mild", value: "MILD" },
    { label: "Moderate", value: "MODERATE" },
    { label: "Severe", value: "SEVERE" },
  ];

  const effectivenessOptions = [
    { label: "Effective", value: "EFFECTIVE" },
    { label: "Moderate", value: "MODERATE" },
    { label: "Ineffective", value: "INEFFECTIVE" },
  ];

  const renderCreateModal = () => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Medical History</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Conditions Section */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Condition</Text>
            <TextInput
              style={styles.input}
              placeholder="Condition Name"
              value={formData.conditions[0].name}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  conditions: [
                    {
                      ...formData.conditions[0],
                      name: text,
                    },
                  ],
                })
              }
            />

            <FormDatePicker
              label="Diagnosis Date"
              value={formData.conditions[0].diagnosis_date}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  conditions: [
                    {
                      ...formData.conditions[0],
                      diagnosis_date: date,
                    },
                  ],
                })
              }
            />

            <View style={styles.row}>
              <FormSelect
                label="Status"
                value={formData.conditions[0].status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    conditions: [
                      {
                        ...formData.conditions[0],
                        status: value,
                      },
                    ],
                  })
                }
                options={statusOptions}
                style={{ flex: 1 }}
              />
              <FormSelect
                label="Severity"
                value={formData.conditions[0].severity}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    conditions: [
                      {
                        ...formData.conditions[0],
                        severity: value,
                      },
                    ],
                  })
                }
                options={severityOptions}
                style={{ flex: 1 }}
              />
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes"
              value={formData.conditions[0].notes}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  conditions: [
                    {
                      ...formData.conditions[0],
                      notes: text,
                    },
                  ],
                })
              }
              multiline
            />
          </View>

          {/* Medications Section */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Medication</Text>
            <TextInput
              style={styles.input}
              placeholder="Medication Name"
              value={formData.medications[0].name}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  medications: [
                    {
                      ...formData.medications[0],
                      name: text,
                    },
                  ],
                })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Dosage"
              value={formData.medications[0].dosage}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  medications: [
                    {
                      ...formData.medications[0],
                      dosage: text,
                    },
                  ],
                })
              }
            />

            <FormDatePicker
              label="Start Date"
              value={formData.medications[0].start_date}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  medications: [
                    {
                      ...formData.medications[0],
                      start_date: date,
                    },
                  ],
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Reason"
              value={formData.medications[0].reason}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  medications: [
                    {
                      ...formData.medications[0],
                      reason: text,
                    },
                  ],
                })
              }
            />

            <FormSelect
              label="Effectiveness"
              value={formData.medications[0].effectiveness}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  medications: [
                    {
                      ...formData.medications[0],
                      effectiveness: value,
                    },
                  ],
                })
              }
              options={effectivenessOptions}
            />
          </View>

          {/* Allergies Section */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Allergy</Text>
            <TextInput
              style={styles.input}
              placeholder="Allergen"
              value={formData.allergies[0].allergen}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  allergies: [
                    {
                      ...formData.allergies[0],
                      allergen: text,
                    },
                  ],
                })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Reaction"
              value={formData.allergies[0].reaction}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  allergies: [
                    {
                      ...formData.allergies[0],
                      reaction: text,
                    },
                  ],
                })
              }
            />
          </View>

          {/* Family History Section */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Family History</Text>
            <TextInput
              style={styles.input}
              placeholder="Condition"
              value={formData.family_history[0].condition}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  family_history: [
                    {
                      ...formData.family_history[0],
                      condition: text,
                    },
                  ],
                })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship"
              value={formData.family_history[0].relationship}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  family_history: [
                    {
                      ...formData.family_history[0],
                      relationship: text,
                    },
                  ],
                })
              }
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes"
              value={formData.family_history[0].notes}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  family_history: [
                    {
                      ...formData.family_history[0],
                      notes: text,
                    },
                  ],
                })
              }
              multiline
            />
          </View>

          {/* General Notes */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="General Notes"
              value={formData.notes}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  notes: text,
                })
              }
              multiline
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                Create Medical History
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
      ) : medicalHistory ? (
        <ScrollView style={styles.content}>
          {medicalHistory.conditions?.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Conditions"
                count={medicalHistory.conditions.length}
              />
              {medicalHistory.conditions.map(renderCondition)}
            </View>
          )}

          {medicalHistory.medications?.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Medications"
                count={medicalHistory.medications.length}
              />
              {medicalHistory.medications.map(renderMedication)}
            </View>
          )}

          {medicalHistory.allergies?.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Allergies"
                count={medicalHistory.allergies.length}
              />
              {medicalHistory.allergies.map(renderAllergy)}
            </View>
          )}

          {medicalHistory.family_history?.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Family History"
                count={medicalHistory.family_history.length}
              />
              {medicalHistory.family_history.map(renderFamilyHistory)}
            </View>
          )}

          {medicalHistory.notes && (
            <View style={[styles.section, styles.notesSection]}>
              <Text style={styles.notesTitle}>Additional Notes</Text>
              <Text style={styles.notesText}>{medicalHistory.notes}</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>
            No medical history available
          </Text>
        </View>
      )}

      {renderCreateModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  countBadge: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  itemDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
  notesSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  formSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    padding: 8,
  },
  datePickerContainer: {
    marginBottom: 12,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
  selectContainer: {
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "white",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
});

export default MedicalHistoryScreen;
