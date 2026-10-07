import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useState,
} from "react";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import TripCard from "../components/TripCard";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

import useTrips from "../hooks/useTrips";

import {
  COLORS,
} from "../constants/colors";

export default function TripsScreen({
  navigation,
}) {
  const {
    trips,
    loading,
    storageError,
    refreshTrips,
  } = useTrips();

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  // ==========================================
  // PULL TO REFRESH
  // ==========================================

  async function handleRefresh() {
    setRefreshing(true);

    await refreshTrips();

    setRefreshing(false);
  }

  // ==========================================
  // INITIAL LOADING
  // ==========================================

  if (loading) {
  return (
    <Loading message="Loading your trips..." />
  );
}
  return (
    <SafeAreaView
      style={styles.container}
      edges={["bottom"]}
    >
      {/* STORAGE ERROR */}

      {storageError && (
        <View
          style={
            styles.errorContainer
          }
        >
          <View
            style={styles.errorIcon}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={COLORS.danger}
            />
          </View>

          <Text
            style={styles.errorText}
          >
            {storageError}
          </Text>
        </View>
      )}

      <FlatList
        data={trips}
        keyExtractor={(item) =>
          item.id
        }

        refreshing={refreshing}
        onRefresh={handleRefresh}

        contentContainerStyle={[
          styles.list,

          trips.length === 0 &&
            styles.emptyList,
        ]}

        showsVerticalScrollIndicator={
          false
        }

        renderItem={({ item }) => (
          <TripCard
            trip={item}
            onPress={() =>
              navigation.navigate(
                "TripDetail",
                {
                  tripId:
                    item.id,
                }
              )
            }
          />
        )}

        ListHeaderComponent={
          trips.length > 0 ? (
            <View
              style={
                styles.header
              }
            >
              <View>
                <Text
                  style={
                    styles.title
                  }
                >
                  My Trips
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Keep your packing
                  organized and stress-free.
                </Text>
              </View>

              <View
                style={
                  styles.tripCount
                }
              >
                <Text
                  style={
                    styles.tripCountNumber
                  }
                >
                  {trips.length}
                </Text>

                <Text
                  style={
                    styles.tripCountLabel
                  }
                >
                  {trips.length === 1
                    ? "trip"
                    : "trips"}
                </Text>
              </View>
            </View>
          ) : null
        }

        ListEmptyComponent={
          <EmptyState
            icon="airplane-outline"
            title="Your journey starts here"
            message="Create your first trip and PackPal will prepare a packing list for you."
            actionLabel="Create Trip"
            onAction={() =>
              navigation.navigate(
                "NewTrip"
              )
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },

    list: {
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 30,
    },

    emptyList: {
      flexGrow: 1,
    },

    // ==========================================
    // HEADER
    // ==========================================

    header: {
      flexDirection: "row",

      alignItems: "flex-start",

      justifyContent:
        "space-between",

      marginBottom: 22,

      paddingTop: 4,
    },

    title: {
      fontSize: 28,

      fontWeight: "800",

      color: COLORS.text,

      letterSpacing: -0.5,
    },

    subtitle: {
      maxWidth: 250,

      marginTop: 5,

      fontSize: 14,

      lineHeight: 20,

      color:
        COLORS.textSecondary,
    },

    tripCount: {
      minWidth: 58,

      paddingHorizontal: 12,
      paddingVertical: 8,

      borderRadius: 14,

      backgroundColor:
        COLORS.primaryLight,

      alignItems: "center",
      justifyContent:
        "center",
    },

    tripCountNumber: {
      fontSize: 18,

      fontWeight: "800",

      color:
        COLORS.primary,
    },

    tripCountLabel: {
      marginTop: 1,

      fontSize: 11,

      fontWeight: "600",

      color:
        COLORS.primaryDark,
    },

    // ==========================================
    // STORAGE ERROR
    // ==========================================

    errorContainer: {
      marginHorizontal: 18,
      marginTop: 12,

      padding: 12,

      borderRadius: 12,

      backgroundColor:
        COLORS.dangerLight,

      flexDirection: "row",
      alignItems: "center",
    },

    errorIcon: {
      marginRight: 8,
    },

    errorText: {
      flex: 1,

      color:
        COLORS.danger,

      fontSize: 13,

      lineHeight: 18,
    },
  });