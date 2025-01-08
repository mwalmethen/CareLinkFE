import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const LovedOneDetailsScreen = ({ route, navigation }) => {
  const { lovedOne } = route.params;

  const handleCreateCaregiver = () => {
    // TODO: Navigate to create caregiver screen
    navigation.navigate("CreateCaregiver", { lovedOneId: lovedOne._id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loved One Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.profileSection}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={40} color="#4A90E2" />
            </View>
            <Text style={styles.name}>{lovedOne.name}</Text>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={24} color="#4A90E2" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Age</Text>
                <Text style={styles.detailValue}>{lovedOne.age}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="medical-outline" size={24} color="#4A90E2" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Medical History</Text>
                <Text style={styles.detailValue}>
                  {lovedOne.medical_history}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createCaregiverButton}
            onPress={handleCreateCaregiver}
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.createCaregiverText}>Create Caregiver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F6FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4A90E2",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  createCaregiverButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  createCaregiverText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LovedOneDetailsScreen;
