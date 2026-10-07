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

export default function ErrorMessage({
  message,
  onRetry,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color={COLORS.danger}
          />
        </View>

        <Text style={styles.title}>
          Something went wrong
        </Text>

        <Text style={styles.message}>
          {message}
        </Text>

        {onRetry && (
          <Pressable
            style={({ pressed }) => [
              styles.button,

              pressed &&
                styles.buttonPressed,
            ]}
            onPress={onRetry}
          >
            <Ionicons
              name="refresh-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text
              style={styles.buttonText}
            >
              Try Again
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    padding: 24,

    backgroundColor:
      COLORS.background,
  },

  card: {
    width: "100%",
    maxWidth: 330,

    paddingVertical: 30,
    paddingHorizontal: 24,

    borderRadius: 22,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    backgroundColor:
      COLORS.surface,

    alignItems: "center",

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 2,
  },

  iconBox: {
    width: 68,
    height: 68,

    borderRadius: 22,

    backgroundColor:
      COLORS.dangerLight,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 17,
  },

  title: {
    fontSize: 20,

    fontWeight: "800",

    color:
      COLORS.text,

    textAlign: "center",
  },

  message: {
    maxWidth: 280,

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
    justifyContent: "center",

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