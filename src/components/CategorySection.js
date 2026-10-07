import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  CATEGORY_LABELS,
} from "../constants/categories";

import {
  COLORS,
} from "../constants/colors";

function getCategoryIcon(category) {
  switch (category) {
    case "CLOTHING":
      return "shirt-outline";

    case "DOCUMENTS":
      return "document-text-outline";

    case "ELECTRONICS":
      return "phone-portrait-outline";

    case "TOILETRIES":
      return "water-outline";

    case "HEALTH":
      return "medkit-outline";

    case "OTHER":
      return "cube-outline";

    default:
      return "folder-outline";
  }
}

export default function CategorySection({
  category,
  count,
}) {
  const icon =
    getCategoryIcon(category);

  const label =
    CATEGORY_LABELS[category] ||
    category;

  return (
    <View style={styles.container}>
      <View style={styles.leftArea}>
        <View style={styles.iconBox}>
          <Ionicons
            name={icon}
            size={18}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.title}>
          {label}
        </Text>
      </View>

      <View style={styles.countBadge}>
        <Text style={styles.count}>
          {count}{" "}
          {count === 1
            ? "item"
            : "items"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 22,
    marginBottom: 10,
  },

  leftArea: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor:
      COLORS.primaryLight,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",

    color: COLORS.text,
  },

  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 20,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  count: {
    fontSize: 12,
    fontWeight: "600",

    color:
      COLORS.textSecondary,
  },
});