import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Import screens
import DailyTasksScreen from "./screens/DailyTasksScreen";
import GenerateReportScreen from "./screens/GenerateReportScreen";
import HealthMonitoringScreen from "./screens/HealthMonitoringScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "DailyTasks") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "GenerateReport") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "HealthMonitoring") {
            iconName = focused ? "pulse" : "pulse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4A90E2",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="DailyTasks"
        component={DailyTasksScreen}
        options={{
          title: "Daily Tasks",
        }}
      />
      <Tab.Screen
        name="GenerateReport"
        component={GenerateReportScreen}
        options={{
          title: "Generate Report",
        }}
      />
      <Tab.Screen
        name="HealthMonitoring"
        component={HealthMonitoringScreen}
        options={{
          title: "Health Monitoring",
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
