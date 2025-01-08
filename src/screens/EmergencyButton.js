import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Button</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.label}>Loved One:</Text>
        {isLoading && <ActivityIndicator size="large" />}
        {error && (
          <Text style={{ color: "red" }}>Failed to load loved ones.</Text>
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
          />
        ) : (
          !isLoading && <Text>No loved ones added yet.</Text>
        )}

        <Text style={styles.label}>Requester:</Text>
        <Text style={[styles.input, styles.textArea]}>{user.name}</Text>

        <Text style={styles.label}>Type:</Text>
        <DropDownPicker
          open={open}
          value={type}
          items={items}
          setOpen={setOpen}
          setValue={setType}
          setItems={setItems}
          style={styles.picker}
          placeholder="Select type"
        />

        <Text style={styles.label}>Description:</Text>
        <TextInput
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleButtonPress}>
          <Text style={styles.addButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
    gap: 16,
  },
  input: {
    backgroundColor: "#F5F6FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 12,
    marginBottom: 16,
    color: "black",
  },
  addButton: {
    margin: 16,
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EmergencyButton;
