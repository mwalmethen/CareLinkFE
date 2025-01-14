import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { UserProvider } from "./src/api/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import screens
import MainScreen from "./src/screens/MainScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import DailyTasksScreen from "./src/screens/DailyTasksScreen";
import CreateTaskScreen from "./src/screens/CreateTaskScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import EmergencyButton from "./src/screens/EmergencyButton";
import LovedOneDetailsScreen from "./src/screens/LovedOneDetailsScreen";
import TaskDetailsScreen from "./src/screens/TaskDetailsScreen";
import NoteDetailsScreen from "./src/screens/NoteDetailsScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import MedicalHistoryScreen from "./src/screens/MedicalHistoryScreen";
import HealthScreen from "./src/screens/HealthScreen";
import MedicationForm from "./src/screens/Medication";
import LovedOnesListScreen from "./src/screens/LovedOnesListScreen";
import CarePlanDetailsScreen from "./src/screens/CarePlanDetailsScreen";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import MyRolesScreen from "./src/screens/MyRolesScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "DailyTasks") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Health") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Emergency Button") {
            iconName = focused ? "alert-circle" : "alert-circle-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
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
        name="Health"
        component={HealthScreen}
        options={{
          title: "Health",
        }}
      />
      <Tab.Screen
        name="Emergency Button"
        component={EmergencyButton}
        options={{
          title: "Emergency Alert",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Main" component={MainScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen
                name="HomeTabs"
                component={MainTabs}
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
              <Stack.Screen
                name="LovedOneDetails"
                component={LovedOneDetailsScreen}
              />
              <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
              <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen
                name="MedicalHistory"
                component={MedicalHistoryScreen}
              />
              <Stack.Screen name="MedicationForm" component={MedicationForm} />
              <Stack.Screen
                name="LovedOnesList"
                component={LovedOnesListScreen}
              />
              <Stack.Screen
                name="CarePlanDetails"
                component={CarePlanDetailsScreen}
              />
              <Stack.Screen name="MyRoles" component={MyRolesScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
