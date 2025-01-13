import { useWindowDimensions, StyleSheet } from "react-native";
import React from "react";
import { TabView, SceneMap } from "react-native-tab-view";
import MedicationForm from "./Medication";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileScreen from "./ProfileScreen";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CarePlanScreen from "./CarePlanScreen";

const renderScene = SceneMap({
  first: MedicationForm,
  second: ProfileScreen,
});

const routes = [
  { key: "first", title: "Profile" },
  { key: "second", title: "Medications" },
];

const Tab = createMaterialTopTabNavigator();

const HealthScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator>
        <Tab.Screen name="Care Plan" component={CarePlanScreen} />
        <Tab.Screen name="Medication" component={MedicationForm} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
});

export default HealthScreen;
