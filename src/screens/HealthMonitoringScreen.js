import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

const HealthMonitoringScreen = () => {
  const [selectedMetric, setSelectedMetric] = useState("Blood Pressure");

  const metrics = ["Heart Rate", "Blood Pressure", "Glucose Level"];

  const chartData = {
    labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov", "Dec"],
    datasets: [
      {
        data: [85, 80, 78, 82, 75, 68, 65],
        color: () => "#4A90E2", // Reached line
        strokeWidth: 2,
      },
      {
        data: [65, 65, 65, 65, 62, 58, 58],
        color: () => "rgba(74, 144, 226, 0.3)", // Target line
        strokeWidth: 2,
      },
    ],
  };

  const insights = [
    {
      id: 1,
      title: "Prediction Heart Rate By AI",
      predictions: [
        "Lisa may experience episodes of irregular heartbeat (arrhythmia) over the next 5 days.",
        "She also might experience joint pain or stiffness, particularly in the mornings, over the next few days.",
        "Based on her high stress, she may notice fluctuations in mood and irritability over the next week.",
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Health Monitoring</Text>
        <TouchableOpacity>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={24} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Here you can view different health factors linked to your chosen loved
          one, powered by AI algorithms.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.metricsScroll}
        >
          <View style={styles.metricsContainer}>
            {metrics.map((metric) => (
              <TouchableOpacity
                key={metric}
                style={[
                  styles.metricButton,
                  selectedMetric === metric && styles.selectedMetric,
                ]}
                onPress={() => setSelectedMetric(metric)}
              >
                <Text
                  style={[
                    styles.metricText,
                    selectedMetric === metric && styles.selectedMetricText,
                  ]}
                >
                  {metric}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.targetDot]} />
              <Text style={styles.legendText}>Target</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.reachedDot]} />
              <Text style={styles.legendText}>Reached</Text>
            </View>
          </View>
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>AI-powered insights</Text>
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <TouchableOpacity>
                  <Ionicons name="bookmark-outline" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              {insight.predictions.map((prediction, index) => (
                <Text key={index} style={styles.predictionText}>
                  • {prediction}
                </Text>
              ))}
            </View>
          ))}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E1E1E1",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: "#333",
    padding: 16,
    lineHeight: 24,
  },
  metricsScroll: {
    paddingHorizontal: 16,
  },
  metricsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  metricButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  selectedMetric: {
    backgroundColor: "#4A90E2",
  },
  metricText: {
    color: "#666",
    fontSize: 16,
  },
  selectedMetricText: {
    color: "#fff",
  },
  chartContainer: {
    padding: 16,
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  targetDot: {
    backgroundColor: "rgba(74, 144, 226, 0.3)",
  },
  reachedDot: {
    backgroundColor: "#4A90E2",
  },
  legendText: {
    color: "#666",
    fontSize: 14,
  },
  insightsSection: {
    padding: 16,
  },
  insightsTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  predictionText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 12,
  },
});

export default HealthMonitoringScreen;
