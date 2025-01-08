import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  navigation,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const EmergencyButton = () => {
  const [inputValue, setInputValue] = useState("");

  const handleButtonPress = () => {
    console.log(inputValue);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Button</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          placeholder="Enter your message"
          value={inputValue}
          onChangeText={setInputValue}
          style={styles.input}
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333", // Dark text for better readability
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F5F6FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    fontSize: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
});

export default EmergencyButton;
