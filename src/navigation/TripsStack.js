import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import TripsScreen from "../screens/TripsScreen";
import NewTripScreen from "../screens/NewTripScreen";
import TripDetailScreen from "../screens/TripDetailScreen";
import AddItemScreen from "../screens/AddItemScreen";
import WeatherScreen from "../screens/WeatherScreen";
import { useTheme } from "../context/ThemeContext";

const Stack = createNativeStackNavigator();

export default function TripsStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: "800" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Trips" component={TripsScreen} options={{ headerShown: false }} />

      <Stack.Screen
        name="NewTrip"
        component={NewTripScreen}
        options={{
          title: "New Trip",
          animation: "fade_from_bottom",
        }}
      />

      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{
          title: "Trip Detail",
          animation: "fade_from_bottom",
        }}
      />

      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{
          title: "Add Item",
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen
        name="Weather"
        component={WeatherScreen}
        options={{
          title: "Weather",
          animation: "fade_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
}
