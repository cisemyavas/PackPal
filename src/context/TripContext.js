import {
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  TEMPLATES,
  COMMON_ITEMS,
} from "../constants/templates";

import { useAuth } from "./AuthContext";
import { replaceUserTrips, subscribeToTrips } from "../services/firestoreService";

const TripContext =
  createContext(null);

function stableSerialize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function TripProvider({
  children,
}) {
  const { user } = useAuth();
  const [trips, setTrips] =
    useState([]);

  const [loading, setLoading] =
    useState(true);
  const [loadedUid, setLoadedUid] = useState(null);

  const [
    storageError,
    setStorageError,
  ] = useState(null);
  const lastSyncedTrips = useRef(null);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    setTrips([]);
    setLoadedUid(null);
    lastSyncedTrips.current = null;
    setStorageError(null);

    if (!user) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeToTrips(
      user.uid,
      (storedTrips) => {
        const serialized = stableSerialize(storedTrips);
        lastSyncedTrips.current = serialized;
        setTrips((current) => stableSerialize(current) === serialized ? current : storedTrips);
        setLoadedUid(user.uid);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore trips could not be loaded:", error);
        setStorageError("Trips could not be loaded from your account.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  // ==========================================
  // SAVE AFTER STATE CHANGE
  // ==========================================

  useEffect(() => {
    if (loading || !user || loadedUid !== user.uid) {
      return;
    }

    async function persistTrips() {
      try {
        const serialized = stableSerialize(trips);
        if (serialized === lastSyncedTrips.current) return;
        await replaceUserTrips(user.uid, trips);
        lastSyncedTrips.current = serialized;
        setStorageError(null);
      } catch (error) {
        console.error("Firestore trips could not be saved:", error);
        setStorageError(
          "Your latest changes could not be saved to your account."
        );
      }
    }

    persistTrips();
  }, [trips, loading, user?.uid, loadedUid]);

  // ==========================================
  // REFRESH
  // ==========================================

  async function refreshTrips() {
    // Firestore keeps this list in sync in real time.
    try {
      setStorageError(null);
      return true;
    } catch (error) {
      setStorageError(
        "Trips could not be refreshed."
      );

      return false;
    }
  }

  // ==========================================
  // ADD TRIP
  // ==========================================

  function addTrip(tripData) {
    const tripId =
      Date.now().toString();

    const templateItems =
      TEMPLATES[
        tripData.tripType
      ] || [];

    const suggestedItems = [
      ...COMMON_ITEMS,
      ...templateItems,
    ].map((item, index) => ({
      id:
        `${tripId}-item-${index + 1}`,

      name: item.name,

      category:
        item.category,

      quantity:
        item.quantity,

      isPacked: false,
    }));

    const newTrip = {
      id: tripId,

      destination:
        tripData.destination,

      startDate:
        tripData.startDate,

      endDate:
        tripData.endDate,

      tripType:
        tripData.tripType,

      items:
        suggestedItems,

      createdAt:
        new Date().toISOString(),
    };

    setTrips((current) => [
      ...current,
      newTrip,
    ]);

    return newTrip;
  }

  // ==========================================
  // DELETE TRIP
  // ==========================================

  function deleteTrip(tripId) {
    setTrips((current) =>
      current.filter(
        (trip) =>
          trip.id !== tripId
      )
    );
  }

  // ==========================================
  // ADD ITEM
  // ==========================================

  function addItem(
    tripId,
    itemData
  ) {
    const newItem = {
      id:
        Date.now().toString(),

      name:
        itemData.name,

      category:
        itemData.category,

      quantity:
        Number(
          itemData.quantity
        ),

      isPacked: false,
    };

    setTrips((current) =>
      current.map((trip) => {
        if (
          trip.id !== tripId
        ) {
          return trip;
        }

        return {
          ...trip,

          items: [
            ...trip.items,
            newItem,
          ],
        };
      })
    );

    return newItem;
  }

  // ==========================================
  // TOGGLE ITEM
  // ==========================================

  function toggleItem(
    tripId,
    itemId
  ) {
    setTrips((current) =>
      current.map((trip) => {
        if (
          trip.id !== tripId
        ) {
          return trip;
        }

        return {
          ...trip,

          items:
            trip.items.map(
              (item) => {
                if (
                  item.id !== itemId
                ) {
                  return item;
                }

                return {
                  ...item,

                  isPacked:
                    !item.isPacked,
                };
              }
            ),
        };
      })
    );
  }

  // ==========================================
  // DELETE ITEM
  // ==========================================

  function deleteItem(
    tripId,
    itemId
  ) {
    setTrips((current) =>
      current.map((trip) => {
        if (
          trip.id !== tripId
        ) {
          return trip;
        }

        return {
          ...trip,

          items:
            trip.items.filter(
              (item) =>
                item.id !== itemId
            ),
        };
      })
    );
  }

  // ==========================================
  // CLEAR ALL TRIPS
  // ==========================================

  async function clearTrips() {
    try {
      setStorageError(null);
      setTrips([]);

      return true;
    } catch (error) {
      setStorageError(
        "Trip data could not be cleared."
      );

      return false;
    }
  }

  return (
    <TripContext.Provider
      value={{
        trips,
        loading,
        storageError,

        addTrip,
        deleteTrip,

        addItem,
        toggleItem,
        deleteItem,

        refreshTrips,
        clearTrips,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export default TripContext;
