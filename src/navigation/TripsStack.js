import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import TripsScreen from "../screens/TripsScreen";
import NewTripScreen from "../screens/NewTripScreen";
import TripDetailScreen from "../screens/TripDetailScreen";
import AddItemScreen from "../screens/AddItemScreen";
import WeatherScreen from "../screens/WeatherScreen";

const Stack = createNativeStackNavigator();

export default function TripsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Trips"
        component={TripsScreen}
        options={({ navigation }) => ({
          title: "My Trips",
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("NewTrip")}
              style={{
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="add"
                size={28}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="NewTrip"
        component={NewTripScreen}
        options={{
          title: "New Trip",
        }}
      />

      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{
          title: "Trip Detail",
        }}
      />

      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{
          title: "Add Item",
        }}
      />

      <Stack.Screen
        name="Weather"
        component={WeatherScreen}
        options={{
          title: "Weather",
        }}
      />
    </Stack.Navigator>
  );
}