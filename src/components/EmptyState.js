import { useTheme } from "../context/ThemeContext";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

export default function EmptyState({
  title,
  message,
  icon = "folder-open-outline",
  actionLabel,
  onAction,
}) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  return (
    <View style={styles.container}>
      <View
        style={styles.iconBox}
      >
        <Ionicons
          name={icon}
          size={34}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      {message ? (
        <Text style={styles.message}>
          {message}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <Pressable
          style={({ pressed }) => [
            styles.button,

            pressed &&
              styles.buttonPressed,
          ]}
          onPress={onAction}
        >
          <Ionicons
            name="add"
            size={19}
            color="#FFFFFF"
          />

          <Text
            style={styles.buttonText}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(COLORS) {
  return StyleSheet.create({
    container: {
      flex: 1,

      minHeight: 280,

      alignItems: "center",
      justifyContent:
        "center",

      paddingHorizontal: 32,
      paddingVertical: 36,
    },

    iconBox: {
      width: 70,
      height: 70,

      borderRadius: 23,

      backgroundColor:
        COLORS.primaryLight,

      alignItems: "center",
      justifyContent:
        "center",

      marginBottom: 17,
    },

    title: {
      fontSize: 20,

      fontWeight: "800",

      color: COLORS.text,

      textAlign: "center",
    },

    message: {
      maxWidth: 300,

      marginTop: 8,

      fontSize: 14,

      lineHeight: 20,

      color:
        COLORS.textSecondary,

      textAlign: "center",
    },

    button: {
      minHeight: 48,

      marginTop: 20,

      paddingHorizontal: 20,

      borderRadius: 14,

      backgroundColor:
        COLORS.primary,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap: 7,
    },

    buttonPressed: {
      opacity: 0.78,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    buttonText: {
      color: "#FFFFFF",

      fontSize: 15,

      fontWeight: "700",
    },
  });
}
