import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import TripCard from "../components/TripCard";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import useTrips from "../hooks/useTrips";

export default function TripsScreen({ navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const { trips, loading, storageError, refreshTrips } = useTrips();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refreshTrips();
    setRefreshing(false);
  }

  if (loading) return <Loading message="Loading your trips..." />;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {storageError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={19} color={COLORS.danger} />
          <Text style={styles.errorText}>{storageError}</Text>
        </View>
      )}

      <FlatList
        data={trips}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={trips.length > 1 ? styles.cardRow : undefined}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={[styles.list, trips.length === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TripCard
            trip={item}
            index={index}
            onPress={() => navigation.navigate("TripDetail", { tripId: item.id })}
          />
        )}
        ListHeaderComponent={(
          <View>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>PACKPAL · YOUR TRAVEL BOARD</Text>
                <Text style={styles.title}>Where to next?</Text>
                <Text style={styles.subtitle}>Keep every little travel detail in one place.</Text>
              </View>
              <View style={styles.countBubble}>
                <Text style={styles.countNumber}>{trips.length}</Text>
                <Text style={styles.countLabel}>{trips.length === 1 ? "trip" : "trips"}</Text>
              </View>
            </View>

            <Pressable
              onPress={() => navigation.navigate("NewTrip")}
              style={({ pressed }) => [styles.createBanner, pressed && styles.createBannerPressed]}
            >
              <View style={styles.bannerIcon}><Ionicons name="add" size={22} color={COLORS.surface} /></View>
              <View style={styles.bannerTextWrap}>
                <Text style={styles.bannerTitle}>Plan a new escape</Text>
                <Text style={styles.bannerSubtitle}>Start with a destination and dates</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={30} color={COLORS.surface} />
            </Pressable>

            {trips.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your trips</Text>
                <Text style={styles.sectionHint}>Tap a card for a quick view</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={(
          <EmptyState
            icon="airplane-outline"
            title="Your journey starts here"
            message="Create your first trip and PackPal will prepare a packing list for you."
            actionLabel="Create Trip"
            onAction={() => navigation.navigate("NewTrip")}
          />
        )}
      />
    </SafeAreaView>
  );
}

function createStyles(COLORS) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    list: { paddingHorizontal: 18, paddingTop: 13, paddingBottom: 28 },
    emptyList: { flexGrow: 1 },
    cardRow: { gap: 12, alignItems: "flex-start" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
    headerCopy: { flex: 1, paddingRight: 12 },
    eyebrow: { color: COLORS.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginBottom: 8 },
    title: { color: COLORS.text, fontSize: 29, lineHeight: 34, fontWeight: "900", letterSpacing: -1.1 },
    subtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 5 },
    countBubble: { width: 58, height: 58, borderRadius: 21, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
    countNumber: { color: COLORS.primary, fontSize: 19, fontWeight: "900" },
    countLabel: { color: COLORS.primary, fontSize: 9, fontWeight: "700", marginTop: -1 },
    createBanner: { minHeight: 72, backgroundColor: COLORS.primary, borderRadius: 22, paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center", marginBottom: 22 },
    createBannerPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
    bannerIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
    bannerTextWrap: { flex: 1, marginLeft: 11 },
    bannerTitle: { color: COLORS.surface, fontSize: 14, fontWeight: "800" },
    bannerSubtitle: { color: COLORS.surface, opacity: 0.78, fontSize: 10, marginTop: 4 },
    sectionHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 },
    sectionTitle: { color: COLORS.text, fontSize: 19, fontWeight: "900", letterSpacing: -0.4 },
    sectionHint: { color: COLORS.textMuted, fontSize: 10, fontWeight: "600" },
    errorContainer: { marginHorizontal: 18, marginTop: 8, padding: 12, borderRadius: 13, backgroundColor: COLORS.dangerLight, flexDirection: "row", alignItems: "center", gap: 8 },
    errorText: { flex: 1, color: COLORS.danger, fontSize: 12, lineHeight: 17 },
  });
}
