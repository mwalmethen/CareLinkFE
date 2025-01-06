import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const GenerateReportScreen = () => {
  const [selectedPerson, setSelectedPerson] = useState("Mother");
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [selectedMetrics, setSelectedMetrics] = useState([
    "Physical Activity Levels",
    "Heart Rate",
  ]);

  const people = [
    { id: 1, name: "Mother", icon: "person" },
    { id: 2, name: "John", icon: "person" },
    { id: 3, name: "Father", icon: "person" },
    { id: 4, name: "Grandmother", icon: "person" },
  ];

  const timeframes = [
    { id: "7d", label: "7 d" },
    { id: "15d", label: "15 d" },
    { id: "30d", label: "30 d" },
    { id: "60d", label: "60 d" },
    { id: "custom", label: "Custom period" },
  ];

  const healthMetrics = [
    "Physical Activity Levels",
    "Glucose Levels",
    "Sleep Patterns",
    "Heart Rate",
    "Weight",
    "Medication History",
    "Blood Pressure",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Health Report</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Generate AI-powered reports in just a seconds and track the well-being
          of your loved ones
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Choose a loved one</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.peopleContainer}>
              {people.map((person) => (
                <TouchableOpacity
                  key={person.id}
                  style={[
                    styles.personItem,
                    selectedPerson === person.name && styles.selectedPerson,
                  ]}
                  onPress={() => setSelectedPerson(person.name)}
                >
                  <View style={styles.avatarContainer}>
                    <View
                      style={[
                        styles.avatar,
                        selectedPerson === person.name && styles.selectedAvatar,
                      ]}
                    >
                      <Ionicons
                        name={person.icon}
                        size={32}
                        color={
                          selectedPerson === person.name ? "white" : "#4A90E2"
                        }
                      />
                    </View>
                    {selectedPerson === person.name && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.personName,
                      selectedPerson === person.name &&
                        styles.selectedPersonName,
                    ]}
                  >
                    {person.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Pick a timeframe</Text>
          <View style={styles.timeframeContainer}>
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe.id}
                style={[
                  styles.timeframeItem,
                  selectedTimeframe === timeframe.id &&
                    styles.selectedTimeframe,
                ]}
                onPress={() => setSelectedTimeframe(timeframe.id)}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    selectedTimeframe === timeframe.id &&
                      styles.selectedTimeframeText,
                  ]}
                >
                  {timeframe.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. Select the health metric(s)
          </Text>
          <View style={styles.metricsContainer}>
            {healthMetrics.map((metric) => (
              <TouchableOpacity
                key={metric}
                style={[
                  styles.metricItem,
                  selectedMetrics.includes(metric) && styles.selectedMetric,
                ]}
                onPress={() => {
                  if (selectedMetrics.includes(metric)) {
                    setSelectedMetrics(
                      selectedMetrics.filter((m) => m !== metric)
                    );
                  } else {
                    setSelectedMetrics([...selectedMetrics, metric]);
                  }
                }}
              >
                <Text
                  style={[
                    styles.metricText,
                    selectedMetrics.includes(metric) &&
                      styles.selectedMetricText,
                  ]}
                >
                  {metric}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.generateButton}>
          <Text style={styles.generateButtonText}>Generate Report</Text>
        </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  peopleContainer: {
    flexDirection: "row",
    marginHorizontal: -8,
  },
  personItem: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E1E1E1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  checkmark: {
    position: "absolute",
    bottom: 4,
    right: 0,
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  personName: {
    fontSize: 14,
    color: "#333",
  },
  timeframeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  timeframeItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    marginHorizontal: 4,
    marginBottom: 8,
  },
  selectedTimeframe: {
    backgroundColor: "#4A90E2",
  },
  timeframeText: {
    color: "#666",
  },
  selectedTimeframeText: {
    color: "white",
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  metricItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    marginHorizontal: 4,
    marginBottom: 8,
  },
  selectedMetric: {
    backgroundColor: "#4A90E2",
  },
  metricText: {
    color: "#666",
  },
  selectedMetricText: {
    color: "white",
  },
  generateButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedAvatar: {
    backgroundColor: "#4A90E2",
  },
  selectedPersonName: {
    color: "#4A90E2",
    fontWeight: "500",
  },
});

export default GenerateReportScreen;
