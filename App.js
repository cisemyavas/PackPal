import { NavigationContainer } from "@react-navigation/native";

import RootNavigator from "./src/navigation/RootNavigator";
import { TripProvider } from "./src/context/TripContext";

export default function App() {
  return (
    <TripProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </TripProvider>
  );
}