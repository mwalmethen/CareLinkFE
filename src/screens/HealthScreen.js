import * as React from "react";
import {
  View,
  StyleSheet,
  Text,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import EmergencyButton from "./EmergencyButton";
import ProfileScreen from "./ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const HealthScreen = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const position = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, { dx }) => {
        position.setValue(dx);
      },
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) > width * 0.2) {
          const newIndex = dx > 0 ? activeIndex - 1 : activeIndex + 1;
          if (newIndex >= 0 && newIndex <= 1) {
            Animated.spring(position, {
              toValue: dx > 0 ? width : -width,
              useNativeDriver: true,
            }).start(() => {
              setActiveIndex(newIndex);
              position.setValue(0);
            });
          } else {
            Animated.spring(position, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        } else {
          Animated.spring(position, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleTabPress = (index) => {
    if (index !== activeIndex) {
      const direction = index > activeIndex ? -width : width;
      Animated.spring(position, {
        toValue: direction,
        useNativeDriver: true,
      }).start(() => {
        setActiveIndex(index);
        position.setValue(0);
      });
    }
  };

  const screens = [
    <ProfileScreen key="profile" />,
    <EmergencyButton key="emergency" />,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        {[
          { title: "Profile", icon: "person" },
          { title: "Emergency", icon: "alert-circle" },
        ].map((tab, index) => (
          <Animated.View
            key={tab.title}
            style={[
              styles.tabItem,
              activeIndex === index && styles.activeTabItem,
            ]}
            onTouchEnd={() => handleTabPress(index)}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={activeIndex === index ? "#4A90E2" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeIndex === index ? "#4A90E2" : "#666" },
              ]}
            >
              {tab.title}
            </Text>
            {activeIndex === index && <View style={styles.indicator} />}
          </Animated.View>
        ))}
      </View>

      <Animated.View
        style={[
          styles.screensContainer,
          {
            transform: [{ translateX: position }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {screens[activeIndex]}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  screensContainer: {
    flex: 1,
    width: width,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
    paddingVertical: 8,
  },
  activeTabItem: {
    transform: [{ scale: 1.1 }],
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  indicator: {
    position: "absolute",
    bottom: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A90E2",
  },
});

export default HealthScreen;
