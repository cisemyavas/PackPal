import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  COLORS,
} from "../constants/colors";

export default function ProgressBar({
  packedCount,
  totalCount,
  percentage,
  showInfo = true,
}) {
  // Beklenmeyen bir değer gelirse bar taşmasın.
  const safePercentage = Math.min(
    Math.max(percentage || 0, 0),
    100
  );

  return (
    <View style={styles.container}>
      {showInfo && (
        <View style={styles.infoRow}>
          <Text style={styles.text}>
            {packedCount} / {totalCount} packed
          </Text>

          <View style={styles.percentageBadge}>
            <Text style={styles.percentage}>
              {safePercentage}%
            </Text>
          </View>
        </View>
      )}

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${safePercentage}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  text: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
  },

  percentage: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },

  track: {
    width: "100%",
    height: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 999,
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },
});