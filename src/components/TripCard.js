import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ProgressBar from "./ProgressBar";
import { getPackingProgress } from "../utils/progress";

function getTripIcon(tripType) {
  switch (tripType) {
    case "BEACH": return "sunny-outline";
    case "CITY": return "business-outline";
    case "BUSINESS": return "briefcase-outline";
    case "CAMPING": return "leaf-outline";
    case "WINTER": return "snow-outline";
    default: return "airplane-outline";
  }
}

export default function TripCard({ trip, onPress, index = 0 }) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const [expanded, setExpanded] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const reveal = useRef(new Animated.Value(0)).current;
  const entrance = useRef(new Animated.Value(0)).current;
  const { packedCount, totalCount, percentage } = getPackingProgress(trip.items || []);

  useEffect(() => {
    const animation = Animated.timing(entrance, {
      toValue: 1,
      duration: 420,
      delay: Math.min(index * 65, 300),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [entrance, index]);

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    Animated.spring(reveal, { toValue: next ? 1 : 0, friction: 9, tension: 90, useNativeDriver: false }).start();
  }

  return (
    <Animated.View style={[styles.card, { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }, { scale }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${trip.destination}, ${percentage}% packed`}
        onPress={toggleExpanded}
        onPressIn={() => Animated.spring(scale, { toValue: 0.975, friction: 8, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }).start()}
        style={styles.cardPressable}
      >
        <View style={styles.cover}>
          <View style={styles.coverTop}>
            <View style={styles.typeBadge}>
              <Ionicons name={getTripIcon(trip.tripType)} size={13} color={COLORS.primary} />
              <Text style={styles.typeText}>{trip.tripType || "TRIP"}</Text>
            </View>
            <View style={styles.coverIcon}>
              <Ionicons name={getTripIcon(trip.tripType)} size={43} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.destination} numberOfLines={2}>{trip.destination}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.date} numberOfLines={1}>{trip.startDate}  →  {trip.endDate}</Text>
          </View>
          <View style={styles.expandHint}>
            <Text style={styles.expandHintText}>{expanded ? "Less" : "Quick view"}</Text>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={15} color={COLORS.primary} />
          </View>
        </View>
      </Pressable>

      <Animated.View style={[styles.expanded, { height: reveal.interpolate({ inputRange: [0, 1], outputRange: [0, 130] }), opacity: reveal }]} pointerEvents={expanded ? "auto" : "none"}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Packing progress</Text>
            <Text style={styles.progressValue}>{percentage}%</Text>
          </View>
          <ProgressBar packedCount={packedCount} totalCount={totalCount} percentage={percentage} showInfo={false} />
          <Text style={styles.itemCount}>{packedCount} of {totalCount} items packed</Text>
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.openButton, pressed && styles.openButtonPressed]}
          >
            <Text style={styles.openButtonText}>Open packing list</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.surface} />
          </Pressable>
        </Animated.View>
      </Animated.View>
  );
}

function createStyles(COLORS) {
  return StyleSheet.create({
    card: {
      flex: 1,
      minWidth: 0,
      marginBottom: 14,
      borderRadius: 23,
      overflow: "hidden",
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowColor: "#102018",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 3,
    },
    cardPressable: { flex: 1 },
    cover: {
      minHeight: 190,
      padding: 14,
      backgroundColor: COLORS.surfaceAlt,
      justifyContent: "space-between",
    },
    coverTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    typeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: COLORS.surface,
    },
    typeText: { color: COLORS.textSecondary, fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
    coverIcon: {
      width: 54,
      height: 54,
      borderRadius: 20,
      backgroundColor: COLORS.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ rotate: "-8deg" }],
    },
    destination: { marginTop: 8, color: COLORS.text, fontSize: 21, lineHeight: 25, fontWeight: "800", letterSpacing: -0.5 },
    dateRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
    date: { flex: 1, color: COLORS.textSecondary, fontSize: 10, fontWeight: "600" },
    expandHint: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
    expandHintText: { color: COLORS.primary, fontSize: 10, fontWeight: "800" },
    expanded: { paddingHorizontal: 14, paddingTop: 13, paddingBottom: 14, backgroundColor: COLORS.surface, overflow: "hidden" },
    progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    progressLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: "700" },
    progressValue: { color: COLORS.primary, fontSize: 14, fontWeight: "900" },
    itemCount: { color: COLORS.textMuted, fontSize: 10, marginTop: 7 },
    openButton: { minHeight: 39, marginTop: 12, borderRadius: 13, paddingHorizontal: 11, backgroundColor: COLORS.primary, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    openButtonPressed: { opacity: 0.84 },
    openButtonText: { color: COLORS.surface, fontSize: 10, fontWeight: "800" },
  });
}
