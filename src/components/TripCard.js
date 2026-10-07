import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import ProgressBar from "./ProgressBar";

import {
  getPackingProgress,
} from "../utils/progress";

import {
  COLORS,
} from "../constants/colors";

function getTripIcon(tripType) {
  switch (tripType) {
    case "BEACH":
      return "sunny-outline";

    case "CITY":
      return "business-outline";

    case "BUSINESS":
      return "briefcase-outline";

    case "CAMPING":
      return "leaf-outline";

    case "WINTER":
      return "snow-outline";

    default:
      return "airplane-outline";
  }
}

export default function TripCard({
  trip,
  onPress,
}) {
  const {
    packedCount,
    totalCount,
    percentage,
  } = getPackingProgress(
    trip.items
  );

  const tripIcon =
    getTripIcon(
      trip.tripType
    );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed &&
          styles.cardPressed,
      ]}
    >
      {/* TOP */}

      <View style={styles.topRow}>
        <View
          style={
            styles.destinationArea
          }
        >
          <View
            style={styles.iconBox}
          >
            <Ionicons
              name={tripIcon}
              size={22}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.titleArea}>
            <Text
              style={styles.destination}
              numberOfLines={1}
            >
              {trip.destination}
            </Text>

            <View
              style={styles.dateRow}
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color={
                  COLORS.textSecondary
                }
              />

              <Text style={styles.date}>
                {trip.startDate}
                {"  →  "}
                {trip.endDate}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={COLORS.textMuted}
        />
      </View>

      {/* TYPE */}

      <View style={styles.typeRow}>
        <View
          style={styles.typeBadge}
        >
          <Text
            style={
              styles.tripType
            }
          >
            {trip.tripType}
          </Text>
        </View>
      </View>

      {/* PROGRESS */}

      <View
        style={
          styles.progressSection
        }
      >
        <View
          style={
            styles.progressHeader
          }
        >
          <Text
            style={
              styles.progressLabel
            }
          >
            Packing progress
          </Text>

          <Text
            style={
              styles.progressPercentage
            }
          >
            {percentage}%
          </Text>
        </View>

        <ProgressBar
          packedCount={packedCount}
          totalCount={totalCount}
          percentage={percentage}
        />
      </View>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        COLORS.surface,

      padding: 18,

      borderRadius: 18,

      marginBottom: 14,

      borderWidth: 1,
      borderColor:
        COLORS.border,

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.06,
      shadowRadius: 8,

      elevation: 2,
    },

    cardPressed: {
      opacity: 0.88,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    destinationArea: {
      flex: 1,

      flexDirection: "row",
      alignItems: "center",
    },

    iconBox: {
      width: 46,
      height: 46,

      borderRadius: 14,

      backgroundColor:
        COLORS.primaryLight,

      alignItems: "center",
      justifyContent:
        "center",

      marginRight: 12,
    },

    titleArea: {
      flex: 1,
    },

    destination: {
      fontSize: 20,
      fontWeight: "700",

      color: COLORS.text,
    },

    dateRow: {
      marginTop: 6,

      flexDirection: "row",
      alignItems: "center",

      gap: 5,
    },

    date: {
      flex: 1,

      fontSize: 13,

      color:
        COLORS.textSecondary,
    },

    typeRow: {
      flexDirection: "row",

      marginTop: 14,
    },

    typeBadge: {
      paddingHorizontal: 11,
      paddingVertical: 6,

      borderRadius: 20,

      backgroundColor:
        COLORS.primaryLight,
    },

    tripType: {
      color:
        COLORS.primaryDark,

      fontSize: 12,
      fontWeight: "700",

      letterSpacing: 0.4,
    },

    progressSection: {
      marginTop: 14,

      paddingTop: 14,

      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
    },

    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",

      marginBottom: 2,
    },

    progressLabel: {
      fontSize: 13,
      fontWeight: "600",

      color:
        COLORS.textSecondary,
    },

    progressPercentage: {
      fontSize: 13,
      fontWeight: "700",

      color: COLORS.primary,
    },
  });