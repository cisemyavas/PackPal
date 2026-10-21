import React, { useEffect, useRef } from "react";
import { Animated, View} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import HomeScreen from "../screens/HomeScreen";
import TripsStack from "./TripsStack";
import PackingScreen from "../screens/PackingScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import ProfileHomeScreen from "../screens/ProfileHomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AppearanceScreen from "../screens/AppearanceScreen";
import SettingsScreen from "../screens/SettingsScreen";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProfileStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: "slide_from_right" }}>
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <Stack.Screen name="EditProfile" component={ProfileScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="SettingsDetail" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

const TABS = [
  ["Plan", "Planlar", "Trips", "calendar", "calendar-outline"],
  ["Packing", "Valiz", "Packing", "bag-handle", "bag-handle-outline"],
  ["Home", "Ana sayfa", "Home", "home", "home-outline"],
  ["Discover", "Keşfet", "Discover", "compass", "compass-outline"],
  ["Profile", "Profil", "Profile", "person", "person-outline"],
];
const COMPONENTS = { Home: HomeScreen, Plan: TripsStack, Discover: DiscoverScreen, Packing: PackingScreen, Profile: ProfileStack };

function GlowIcon({ focused, color, active, idle }) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: focused ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [focused, progress]);
  return (
    <View style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
      <Animated.View pointerEvents="none" style={{ position: "absolute", top: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity: progress, transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }} />
      <Animated.View pointerEvents="none" style={{ position: "absolute", top: -5, width: 20, height: 16, borderRadius: 12, backgroundColor: color, opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] }) }} />
      <Animated.View style={{ transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}>
        <Ionicons name={focused ? active : idle} size={21} color={color} />
      </Animated.View>
    </View>
  );
}

export default function RootNavigator() {
  const { colors, language } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarActiveBackgroundColor: "transparent",
      tabBarHideOnKeyboard: true,
      tabBarItemStyle: { borderRadius: 0, height: 54, marginHorizontal: 0, backgroundColor: "transparent" },
      tabBarIconStyle: { marginTop: 0, backgroundColor: "transparent" },
      tabBarLabelStyle: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 9, lineHeight: 12,  marginTop: 5, marginBottom: 1, includeFontPadding: false },
      tabBarStyle: {
  position: "absolute",

  // React Navigation'ın varsayılan tam genişlik
  // yerleşiminden bağımsız yatay boşluk
  marginHorizontal: 18,

  bottom: Math.max(12, insets.bottom + 5),
  height: 62,

  backgroundColor: colors.surface,
  borderRadius: 25,
  borderWidth: 1,
  borderColor: colors.border,

  paddingHorizontal: 4,
  paddingTop: 4,
  paddingBottom: 5,

  elevation: 0,
  shadowOpacity: 0,
},
    }}>
      {TABS.map(([key, tr, en, active, idle]) => (
        <Tab.Screen key={key} name={key} component={COMPONENTS[key]}
          listeners={({ navigation }) => ({
            tabPress: (event) => {
              if (key !== "Plan") return;
              event.preventDefault();
              navigation.navigate("Plan", { screen: "Trips" });
            },
          })}
          options={{ title: language === "en" ? en : tr, popToTopOnBlur: key === "Plan", tabBarIcon: ({ focused, color }) => <GlowIcon focused={focused} color={color} active={active} idle={idle} /> }} />
      ))}
    </Tab.Navigator>
  );
}
