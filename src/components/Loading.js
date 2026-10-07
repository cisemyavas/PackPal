import {
  ActivityIndicator,
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

export default function Loading({
  message = "Loading...",
}) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons
            name="airplane-outline"
            size={30}
            color={COLORS.primary}
          />
        </View>

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.title}>
          Just a moment
        </Text>

        <Text style={styles.text}>
          {message}
        </Text>
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
    maxWidth: 320,

    paddingVertical: 30,
    paddingHorizontal: 24,

    borderRadius: 22,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,

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
    width: 62,
    height: 62,

    borderRadius: 20,

    marginBottom: 20,

    backgroundColor:
      COLORS.primaryLight,

    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: 18,

    fontSize: 18,

    fontWeight: "800",

    color:
      COLORS.text,
  },

  text: {
    marginTop: 6,

    fontSize: 14,

    lineHeight: 20,

    color:
      COLORS.textSecondary,

    textAlign: "center",
  },
});