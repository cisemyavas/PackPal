import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";

import RootNavigator from "./src/navigation/RootNavigator";
import { TripProvider } from "./src/context/TripContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { COLORS } from "./src/constants/colors";

function AppNavigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <AppNavigation />
      </TripProvider>
    </AuthProvider>
  );
}
