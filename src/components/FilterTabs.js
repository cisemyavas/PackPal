import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  COLORS,
} from "../constants/colors";

const FILTERS = [
  {
    key: "ALL",
    label: "All",
    icon: "apps-outline",
  },
  {
    key: "PACKED",
    label: "Packed",
    icon: "checkmark-circle-outline",
  },
  {
    key: "MISSING",
    label: "Missing",
    icon: "ellipse-outline",
  },
];

export default function FilterTabs({
  activeFilter,
  onChange,
}) {
  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => {
        const isActive =
          activeFilter === filter.key;

        return (
          <Pressable
            key={filter.key}
            style={({ pressed }) => [
              styles.button,

              isActive &&
                styles.activeButton,

              pressed &&
                styles.pressedButton,
            ]}
            onPress={() =>
              onChange(filter.key)
            }
          >
            <Ionicons
              name={filter.icon}
              size={17}
              color={
                isActive
                  ? "#FFFFFF"
                  : COLORS.textSecondary
              }
            />

            <Text
              style={[
                styles.text,

                isActive &&
                  styles.activeText,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flexDirection: "row",

      gap: 8,

      marginTop: 14,
      marginBottom: 12,

      padding: 5,

      borderRadius: 16,

      backgroundColor:
        COLORS.surface,

      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    button: {
      flex: 1,

      minHeight: 44,

      borderRadius: 12,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 6,
    },

    activeButton: {
      backgroundColor:
        COLORS.primary,
    },

    pressedButton: {
      opacity: 0.8,
    },

    text: {
      fontSize: 13,

      fontWeight: "700",

      color:
        COLORS.textSecondary,
    },

    activeText: {
      color: "#FFFFFF",
    },
  });