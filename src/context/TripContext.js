import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  TEMPLATES,
  COMMON_ITEMS,
} from "../constants/templates";

import {
  loadTrips,
  saveTrips,
  clearTripsStorage,
} from "../services/storage";

const TripContext =
  createContext(null);

export function TripProvider({
  children,
}) {
  const [trips, setTrips] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    storageError,
    setStorageError,
  ] = useState(null);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    async function initializeTrips() {
      try {
        setStorageError(null);

        const storedTrips =
          await loadTrips();

        setTrips(storedTrips);
      } catch (error) {
        setTrips([]);

        setStorageError(
          "Saved trips could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }

    initializeTrips();
  }, []);

  // ==========================================
  // SAVE AFTER STATE CHANGE
  // ==========================================

  useEffect(() => {
    if (loading) {
      return;
    }

    async function persistTrips() {
      try {
        await saveTrips(trips);
      } catch (error) {
        setStorageError(
          "Your latest changes could not be saved."
        );
      }
    }

    persistTrips();
  }, [trips, loading]);

  // ==========================================
  // REFRESH
  // ==========================================

  async function refreshTrips() {
    try {
      setStorageError(null);

      const storedTrips =
        await loadTrips();

      setTrips(storedTrips);

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

      await clearTripsStorage();

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