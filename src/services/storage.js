import AsyncStorage from "@react-native-async-storage/async-storage";

const TRIPS_STORAGE_KEY = "packpal:trips";

// ==========================================
// LOAD TRIPS
// ==========================================

export async function loadTrips() {
  try {
    const storedValue =
      await AsyncStorage.getItem(
        TRIPS_STORAGE_KEY
      );

    if (!storedValue) {
      return [];
    }

    const parsedTrips =
      JSON.parse(storedValue);

    // Storage bozuksa uygulama crash olmasın.
    if (!Array.isArray(parsedTrips)) {
      return [];
    }

    return parsedTrips;
  } catch (error) {
    console.error(
      "Trips could not be loaded:",
      error
    );

    throw error;
  }
}

// ==========================================
// SAVE TRIPS
// ==========================================

export async function saveTrips(trips) {
  try {
    await AsyncStorage.setItem(
      TRIPS_STORAGE_KEY,
      JSON.stringify(trips)
    );
  } catch (error) {
    console.error(
      "Trips could not be saved:",
      error
    );

    throw error;
  }
}

// ==========================================
// CLEAR ALL
// ==========================================

export async function clearTripsStorage() {
  try {
    await AsyncStorage.removeItem(
      TRIPS_STORAGE_KEY
    );
  } catch (error) {
    console.error(
      "Trips storage could not be cleared:",
      error
    );

    throw error;
  }
}