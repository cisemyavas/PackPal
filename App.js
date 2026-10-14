
import React from "react";

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import {
  SafeAreaProvider,
} from "react-native-safe-area-context";

// ==========================================
// FIGMA - PLUS JAKARTA SANS FONTS
// ==========================================

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

// ==========================================
// NAVIGATION
// ==========================================

import RootNavigator from "./src/navigation/RootNavigator";

import AuthNavigator from "./src/navigation/AuthNavigator";

// ==========================================
// CONTEXT PROVIDERS
// ==========================================

import {
  AuthProvider,
  useAuth,
} from "./src/context/AuthContext";

import {
  ThemeProvider,
  useTheme,
} from "./src/context/ThemeContext";

import {
  TripProvider,
} from "./src/context/TripContext";

// ==========================================
// LOADING SCREEN
// ==========================================

function LoadingScreen({ colors, isDark }) {
  return (
    <View
      style={[
        styles.loadingContainer,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
      />

      <ActivityIndicator
        size="large"
        color={colors.primary}
      />
    </View>
  );
}

// ==========================================
// MAIN APP NAVIGATION
// ==========================================

function AppNavigation() {
  // Firebase Authentication
  const {
    user,
    loading: authLoading,
  } = useAuth();

  // Figma Theme Context
  const {
    colors,
    resolvedMode,
    loading: themeLoading,
  } = useTheme();

  // ========================================
  // FONT LOADING
  // ========================================

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // ========================================
  // ACTIVE THEME
  // ========================================

  const isDark = resolvedMode === "dark";

  // ========================================
  // LOADING STATE
  // ========================================

  if (
    authLoading ||
    (user && themeLoading) ||
    (!fontsLoaded && !fontError)
  ) {
    return (
      <LoadingScreen
        colors={colors}
        isDark={isDark}
      />
    );
  }

  // ========================================
  // FONT ERROR
  // ========================================

  if (fontError) {
    console.warn(
      "Plus Jakarta Sans font error:",
      fontError
    );

    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <StatusBar
          style={isDark ? "light" : "dark"}
        />

        <Text
          style={[
            styles.errorText,
            { color: colors.text },
          ]}
        >
          Yazı tipleri yüklenemedi.
          Lütfen font kurulumunu kontrol et.
        </Text>
      </View>
    );
  }

  // ========================================
  // REACT NAVIGATION THEME
  // ========================================

  const baseTheme = isDark
    ? DarkTheme
    : DefaultTheme;

  const navigationTheme = {
    ...baseTheme,

    colors: {
      ...baseTheme.colors,

      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  // ========================================
  // APP CONTENT
  // ========================================

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={colors.background}
      />

      {user ? (
        <RootNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

// ==========================================
// APP ROOT
// ==========================================

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <TripProvider>
            <AppNavigation />
          </TripProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  errorText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
});
