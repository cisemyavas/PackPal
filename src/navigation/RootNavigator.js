import React from "react";
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
  ["Home", "Ana sayfa", "Home", "home", "home-outline"],
  ["Plan", "Plan", "Plan", "airplane", "airplane-outline"],
  ["Discover", "Keşfet", "Discover", "compass", "compass-outline"],
  ["Packing", "Valiz", "Packing", "bag-handle", "bag-handle-outline"],
  ["Profile", "Profil", "Profile", "person", "person-outline"],
];
const COMPONENTS = { Home: HomeScreen, Plan: TripsStack, Discover: DiscoverScreen, Packing: PackingScreen, Profile: ProfileStack };

export default function RootNavigator() {
  const { colors, language } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarActiveBackgroundColor: colors.primaryLight,
      tabBarHideOnKeyboard: true,
      tabBarItemStyle: { borderRadius: 16, height: 56, marginHorizontal: 1 },
      tabBarIconStyle: { marginTop: 1 },
      tabBarLabelStyle: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 9, lineHeight: 14, marginBottom: 2, includeFontPadding: false },
      tabBarStyle: {
        position: "absolute", left: 20, right: 20,
        bottom: Math.max(16, insets.bottom + 8), height: 72,
        backgroundColor: colors.surface,
        borderRadius: 24, borderWidth: 1, borderTopWidth: 1, borderColor: colors.border,
        paddingHorizontal: 10, paddingTop: 8, paddingBottom: 8,
        elevation: 0, shadowOpacity: 0,
      },
    }}>
      {TABS.map(([key, tr, en, active, idle]) => (
        <Tab.Screen key={key} name={key} component={COMPONENTS[key]}
          options={{ title: language === "en" ? en : tr, tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? active : idle} size={21} color={color} /> }} />
      ))}
    </Tab.Navigator>
  );
}
