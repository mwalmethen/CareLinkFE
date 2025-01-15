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
        style={[styles.pickerWrapper, { backgroundColor: "#FFFFFF" }]}
        onPress={() => setShow(true)}
      >
        <Text
          style={[styles.selectedValueText, { color: value ? "#333" : "#666" }]}
        >
          {value ? moment(value).format("YYYY-MM-DD") : "Select Date"}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#666" />
      </TouchableOpacity>

      <Modal visible={show} transparent={true} animationType="slide">
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerContent}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>{label}</Text>
              <TouchableOpacity
                style={styles.datePickerDoneButton}
                onPress={() => {
                  setShow(false);
                }}
              >
                <Text style={styles.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate && event.type !== "dismissed") {
                  onChange(moment(selectedDate).format("YYYY-MM-DD"));
                }
              }}
              style={{ height: 200, backgroundColor: "#F5F7FA" }}
              textColor="#333"
              themeVariant="light"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const FormSelect = ({ label, value, onValueChange, options, style }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={[styles.selectContainer, style]}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.pickerWrapper}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectedValueText}>
          {selectedOption?.label || "Select an option"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.selectorModal}>
          <View style={styles.selectorContent}>
            <View style={styles.selectorHeader}>
              <Text style={styles.selectorTitle}>{label}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    value === option.value && styles.selectedOption,
                  ]}
                  onPress={() => {
                    onValueChange(option.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === option.value && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={24} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const MedicalHistoryCard = ({ entry, handleEdit }) => {
  if (!entry) return null;

  const formatDate = (date) => {
    if (!date) return "Not specified";
    const parsedDate = moment(date);
    return parsedDate.isValid()
      ? parsedDate.format("MMMM D, YYYY")
      : "Invalid date";
  };

  const formatTitleDate = (date) => {
    if (!date) return "Not specified";
    const parsedDate = moment(date);
    return parsedDate.isValid()
      ? parsedDate.format("MMM D, YYYY")
      : "Invalid date";
  };

  // Helper function to get effectiveness badge style
  const getEffectivenessBadgeStyle = (effectiveness) => {
    switch (effectiveness) {
      case "EFFECTIVE":
        return { backgroundColor: "#E8F5E9", color: "#2E7D32" };
      case "PARTIALLY_EFFECTIVE":
        return { backgroundColor: "#FFF3E0", color: "#F57C00" };
      case "NOT_EFFECTIVE":
        return { backgroundColor: "#FFEBEE", color: "#D32F2F" };
      default:
        return { backgroundColor: "#E3F2FD", color: "#1976D2" };
    }
  };

  // Helper function to format effectiveness text
  const formatEffectiveness = (effectiveness) => {
    return effectiveness
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        style={styles.cardHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeaderContent}>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardTitle}>Medical Record</Text>
            <View style={styles.cardDateContainer}>
              <Text style={styles.cardDate}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color="white"
                  style={styles.cardIcon}
                />{" "}
                {formatTitleDate(entry.createdAt)}
              </Text>
              <Text style={styles.cardTime}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="white"
                  style={styles.cardIcon}
                />{" "}
                {moment(entry.createdAt).format("h:mm A")}
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.cardBadge, styles.editButton]}
              onPress={() => handleEdit(entry)}
            >
              <Ionicons name="create-outline" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardBadge, styles.deleteButton]}>
              <Ionicons name="trash-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {entry.conditions?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="fitness-outline" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Conditions</Text>
          </View>
          {entry.conditions.map((condition, i) => (
            <View key={i} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{condition.name}</Text>
                <View style={styles.badges}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          condition.status === "ACTIVE" ? "#FFE5A3" : "#C8E6C9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            condition.status === "ACTIVE"
                              ? "#B7791F"
                              : "#2E7D32",
                        },
                      ]}
                    >
                      {condition.status}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: "#FFE5E5" }]}>
                    <Text style={[styles.badgeText, { color: "#D32F2F" }]}>
                      {condition.severity}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemDetail}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />{" "}
                  Diagnosed: {formatDate(condition.diagnosis_date)}
                </Text>
                {condition.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notes}>{condition.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {entry.medications?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="medical-outline" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Medications</Text>
          </View>
          {entry.medications.map((medication, i) => (
            <View key={i} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{medication.name}</Text>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemDetail}>
                  <Ionicons name="flask-outline" size={14} color="#666" />{" "}
                  Dosage: {medication.dosage}
                </Text>
                <Text style={styles.itemDetail}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />{" "}
                  Started: {formatDate(medication.start_date)}
                </Text>
                <View style={styles.effectivenessContainer}>
                  <Text style={styles.effectivenessLabel}>
                    <Ionicons name="pulse-outline" size={14} color="#666" />{" "}
                    Effectiveness:
                  </Text>
                  <View
                    style={[
                      styles.effectivenessBadge,
                      {
                        backgroundColor: getEffectivenessBadgeStyle(
                          medication.effectiveness
                        ).backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.effectivenessText,
                        {
                          color: getEffectivenessBadgeStyle(
                            medication.effectiveness
                          ).color,
                        },
                      ]}
                    >
                      {formatEffectiveness(medication.effectiveness)}
                    </Text>
                  </View>
                </View>
                {medication.reason && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Reason:</Text>
                    <Text style={styles.notes}>{medication.reason}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {entry.allergies?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Allergies</Text>
          </View>
          {entry.allergies.map((allergy, i) => (
            <View key={i} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{allergy.allergen}</Text>
                <View style={[styles.badge, { backgroundColor: "#FFE5E5" }]}>
                  <Text style={[styles.badgeText, { color: "#D32F2F" }]}>
                    {allergy.severity}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemDetail}>
                <Ionicons name="warning-outline" size={14} color="#666" />{" "}
                Reaction: {allergy.reaction}
              </Text>
            </View>
          ))}
        </View>
      )}

      {entry.family_history?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="people-outline" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Family History</Text>
          </View>
          {entry.family_history.map((history, i) => (
            <View key={i} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{history.condition}</Text>
                <Text style={styles.relationshipBadge}>
                  {history.relationship}
                </Text>
              </View>
              {history.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notes}>{history.notes}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {entry.notes && (
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="document-text-outline" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Additional Notes</Text>
          </View>
          <View style={styles.notesContainer}>
            <Text style={styles.notes}>{entry.notes}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const MedicalHistoryScreen = ({ route, navigation }) => {
  const { lovedOne } = route.params;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const { token } = useUser();
  const queryClient = useQueryClient();

  // Constants for effectiveness values
  const EFFECTIVENESS = {
    EFFECTIVE: "EFFECTIVE",
    PARTIALLY_EFFECTIVE: "PARTIALLY_EFFECTIVE",
    NOT_EFFECTIVE: "NOT_EFFECTIVE",
  };

  // Form state
  const [formData, setFormData] = useState({
    conditions: [
      {
        name: "",
        diagnosis_date: "",
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
        effectiveness: EFFECTIVENESS.EFFECTIVE,
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

  // Effectiveness options for the selector
  const effectivenessOptions = [
    { value: EFFECTIVENESS.EFFECTIVE, label: "Effective" },
    { value: EFFECTIVENESS.PARTIALLY_EFFECTIVE, label: "Partially Effective" },
    { value: EFFECTIVENESS.NOT_EFFECTIVE, label: "Not Effective" },
  ];

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
    onMutate: async (newEntry) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["medicalHistory", lovedOne._id]);

      // Snapshot the previous value
      const previousHistory = queryClient.getQueryData([
        "medicalHistory",
        lovedOne._id,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["medicalHistory", lovedOne._id], (old) => {
        const currentHistory = old || [];
        return [...currentHistory, newEntry.data];
      });

      return { previousHistory };
    },
    onError: (err, newEntry, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["medicalHistory", lovedOne._id],
        context.previousHistory
      );
      Alert.alert("Error", err.message || "Failed to create medical history");
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["medicalHistory", lovedOne._id]);
      setIsModalVisible(false);
      Alert.alert("Success", "Medical history created successfully");
      // Reset form
      setFormData({
        conditions: [
          {
            name: "",
            diagnosis_date: "",
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
            effectiveness: EFFECTIVENESS.EFFECTIVE,
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
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(["medicalHistory", lovedOne._id]);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ entryId, data }) => {
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
        throw new Error(error.message || "Failed to update medical history");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["medicalHistory", lovedOne._id]);
      setIsModalVisible(false);
      setEditingEntry(null);
      setEditingSection(null);
      Alert.alert("Success", "Medical history updated successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update medical history");
    },
  });

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      conditions: entry.conditions || [
        {
          name: "",
          diagnosis_date: "",
          severity: "MODERATE",
          notes: "",
        },
      ],
      medications: entry.medications || [
        {
          name: "",
          dosage: "",
          start_date: "",
          reason: "",
          effectiveness: EFFECTIVENESS.EFFECTIVE,
        },
      ],
      allergies: entry.allergies || [
        {
          allergen: "",
          reaction: "",
          severity: "MODERATE",
        },
      ],
      family_history: entry.family_history || [
        {
          condition: "",
          relationship: "",
          notes: "",
        },
      ],
      notes: entry.notes || "",
    });
    setIsModalVisible(true);
  };

  const handleSubmit = () => {
    try {
      // Validate conditions section
      const isConditionsValid = formData.conditions.every(
        (condition) => condition.name.trim() && condition.diagnosis_date
      );
      if (!isConditionsValid) {
        Alert.alert(
          "Validation Error",
          "Please fill in all fields in the Conditions section"
        );
        return;
      }

      // Validate medications section
      const isMedicationsValid = formData.medications.every(
        (medication) =>
          medication.name.trim() &&
          medication.dosage.trim() &&
          medication.start_date &&
          medication.reason.trim()
      );
      if (!isMedicationsValid) {
        Alert.alert(
          "Validation Error",
          "Please fill in all fields in the Medications section"
        );
        return;
      }

      // Validate allergies section
      const isAllergiesValid = formData.allergies.every(
        (allergy) => allergy.allergen.trim() && allergy.reaction.trim()
      );
      if (!isAllergiesValid) {
        Alert.alert(
          "Validation Error",
          "Please fill in all fields in the Allergies section"
        );
        return;
      }

      // Validate family history section
      const isFamilyHistoryValid = formData.family_history.every(
        (history) => history.condition.trim() && history.relationship.trim()
      );
      if (!isFamilyHistoryValid) {
        Alert.alert(
          "Validation Error",
          "Please fill in all fields in the Family History section"
        );
        return;
      }

      // Validate additional notes
      if (!formData.notes.trim()) {
        Alert.alert("Validation Error", "Please add some additional notes");
        return;
      }

      // Create a copy of the form data with proper casing
      const validatedData = {
        ...formData,
        conditions: formData.conditions.map((condition) => ({
          ...condition,
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

      if (editingEntry) {
        // If editing, only include the section being edited
        const updateData = {};
        if (editingSection) {
          updateData[editingSection] = validatedData[editingSection];
        } else {
          Object.assign(updateData, validatedData);
        }
        updateMutation.mutate({ entryId: editingEntry._id, data: updateData });
      } else {
        // For creating new medical history
        createMutation.mutate(validatedData);
      }
    } catch (error) {
      Alert.alert("Error", "Please check all fields are filled correctly");
    }
  };

  const renderModalTitle = () => {
    if (editingEntry) {
      if (editingSection === "conditions") return "Edit Condition";
      if (editingSection === "medications") return "Edit Medication";
      if (editingSection === "allergies") return "Edit Allergy";
      if (editingSection === "family_history") return "Edit Family History";
      if (editingSection === "notes") return "Edit Notes";
      return "Edit Medical History";
    }
    return "Add Medical History";
  };

  // Query to fetch all medical history entries
  const { data: medicalHistory, isLoading } = useQuery({
    queryKey: ["medicalHistory", lovedOne._id],
    queryFn: async () => {
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

      // If we get a "not found" message, return an empty array
      if (data.message === "Medical history not found") {
        return [];
      }

      // If the response is not ok, throw an error
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch medical history");
      }

      // Return the medical history array from the response
      return Array.isArray(data) ? data : [data];
    },
    enabled: !!lovedOne._id && !!token,
  });

  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  const severityOptions = [
    { label: "Mild", value: "MILD" },
    { label: "Moderate", value: "MODERATE" },
    { label: "Severe", value: "SEVERE" },
  ];

  const renderMedicationFields = (medication, index) => (
    <View key={index} style={styles.fieldSet}>
      <TextInput
        style={styles.input}
        placeholder="Medication name"
        value={medication.name}
        onChangeText={(text) =>
          handleFieldChange("medications", index, "name", text)
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Dosage"
        value={medication.dosage}
        onChangeText={(text) =>
          handleFieldChange("medications", index, "dosage", text)
        }
      />
      <FormDatePicker
        label="Start Date"
        value={medication.start_date}
        onChange={(date) =>
          handleFieldChange("medications", index, "start_date", date)
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Reason for medication"
        value={medication.reason}
        onChangeText={(text) =>
          handleFieldChange("medications", index, "reason", text)
        }
      />
      <FormSelect
        label="Effectiveness"
        value={medication.effectiveness}
        options={effectivenessOptions}
        onValueChange={(value) =>
          handleFieldChange("medications", index, "effectiveness", value)
        }
      />
    </View>
  );

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
            <Text style={styles.modalTitle}>{renderModalTitle()}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsModalVisible(false);
                setEditingEntry(null);
                setEditingSection(null);
              }}
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
              placeholderTextColor="#666"
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
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes"
              placeholderTextColor="#666"
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
              placeholderTextColor="#666"
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
              placeholderTextColor="#666"
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
              placeholderTextColor="#666"
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
              placeholderTextColor="#666"
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
              placeholderTextColor="#666"
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
            <FormSelect
              label="Severity"
              value={formData.allergies[0].severity}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  allergies: [
                    {
                      ...formData.allergies[0],
                      severity: value,
                    },
                  ],
                })
              }
              options={severityOptions}
            />
          </View>

          {/* Family History Section */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Family History</Text>
            <TextInput
              style={styles.input}
              placeholder="Condition"
              placeholderTextColor="#666"
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
              placeholderTextColor="#666"
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
              placeholderTextColor="#666"
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
              placeholderTextColor="#666"
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
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            {createMutation.isLoading || updateMutation.isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {editingEntry
                  ? "Update Medical History"
                  : "Create Medical History"}
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
        colors={["#3B82F6", "#2563EB"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical History</Text>
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {medicalHistory?.length > 0 ? (
            medicalHistory.map((entry, index) => (
              <MedicalHistoryCard
                key={index}
                entry={entry}
                handleEdit={handleEdit}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#666" />
              <Text style={styles.emptyStateText}>
                No medical history entries yet
              </Text>
            </View>
          )}
        </ScrollView>
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
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
    placeholderTextColor: "#666",
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
    marginBottom: 16,
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
    marginBottom: 16,
  },
  pickerWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 12,
    height: 48,
  },
  selectedValueText: {
    fontSize: 16,
    color: "#333",
  },
  selectorModal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  selectorContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  selectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectorTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  optionsList: {
    padding: 8,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: "#F0F7FF",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 16,
  },
  cardHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  cardHeaderInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  cardDateContainer: {
    alignItems: "center",
    gap: 4,
  },
  cardDate: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTime: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 4,
  },
  cardBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 12,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginLeft: 8,
  },
  item: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
    flex: 1,
  },
  itemContent: {
    gap: 4,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  itemDetail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  notesContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  sideEffectsContainer: {
    marginTop: 8,
  },
  sideEffectsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  sideEffectsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sideEffectBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sideEffectText: {
    fontSize: 12,
    color: "#E65100",
  },
  relationshipBadge: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  datePickerModal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  datePickerDoneButton: {
    padding: 8,
  },
  datePickerDoneText: {
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 59, 48, 0.6)",
    padding: 8,
    borderRadius: 8,
    position: "absolute",
    right: 0,
  },
  sectionEditButton: {
    marginLeft: "auto",
    padding: 4,
    borderRadius: 12,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    position: "absolute",
    right: 0,
  },
  editButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 59, 48, 0.6)",
  },
  cardBadge: {
    padding: 8,
    borderRadius: 8,
  },
  effectivenessContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  effectivenessLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
  },
  effectivenessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  effectivenessText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default MedicalHistoryScreen;
