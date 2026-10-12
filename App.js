import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import RootNavigator from "./src/navigation/RootNavigator";
import { TripProvider } from "./src/context/TripContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import AuthNavigator from "./src/navigation/AuthNavigator";

function AppNavigation() {
  const { user, loading } = useAuth();
  const { colors, mode, loading: themeLoading } = useTheme();

  if (loading || (user && themeLoading)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const navigationTheme = {
    ...(mode === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      {user ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TripProvider>
          <AppNavigation />
        </TripProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
