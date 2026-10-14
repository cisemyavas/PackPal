import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { TYPE } from "../constants/typography";
import { PageHeader, PackingProgressCard, TripHeroCard } from "../components/RefinedUI";
import useTrips from "../hooks/useTrips";

export default function TripsScreen({ navigation }) {
  const { colors: c, language } = useTheme();
  const { trips, loading, storageError, refreshTrips } = useTrips();
  const [filter, setFilter] = useState("upcoming");
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const upcomingCount = trips.filter(t => !t.endDate || t.endDate >= today).length;
  const filtered = useMemo(() => trips.filter(t => filter === "past" ? Boolean(t.endDate && t.endDate < today) : !t.endDate || t.endDate >= today)
    .sort((a, b) => String(a.startDate || "").localeCompare(String(b.startDate || ""))), [trips, filter, today]);
  const tr = language !== "en";
  const onRefresh = async () => { setRefreshing(true); try { await refreshTrips(); } finally { setRefreshing(false); } };
  const chip = (id, name) => (
    <Pressable onPress={() => setFilter(id)} key={id} style={{ borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, marginRight: 12, backgroundColor: filter === id ? c.primaryLight : c.surfaceAlt }}>
      <Text style={[TYPE.micro, { color: filter === id ? c.primary : c.textSecondary }]}>{name}</Text>
    </Pressable>
  );
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList data={filtered} keyExtractor={t => String(t.id)} refreshing={refreshing} onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 124, gap: 16 }}
        ListHeaderComponent={<View>
          <PageHeader eyebrow={tr ? "SEYAHAT DEFTERİN" : "YOUR TRAVEL JOURNAL"}
            title={tr ? "Planlarım" : "My trips"} subtitle={tr ? "Yeni bir hikâye için yola çık." : "Start your next story."}
            icon="add" onAction={() => navigation.navigate("NewTrip")} />
          {storageError ? <Text style={{ color: c.danger, marginBottom: 12 }}>{storageError}</Text> : null}
          <View style={{ flexDirection: "row", marginBottom: 0 }}>
            {chip("upcoming", tr ? `Yaklaşan · ${upcomingCount}` : `Upcoming · ${upcomingCount}`)}
            {chip("past", tr ? "Geçmiş" : "Past")}
          </View>
        </View>}
        renderItem={({ item, index }) => <View style={{ gap: 16 }}>
          <TripHeroCard trip={item} compact={index > 0} onPress={() => navigation.navigate("TripDetail", { tripId: item.id })} />
          {index === 0 ? <PackingProgressCard trip={item} short onPress={() => navigation.navigate("TripDetail", { tripId: item.id })} /> : null}
        </View>}
        ListEmptyComponent={!loading ? <View style={{ backgroundColor: c.surface, borderRadius: 24, padding: 22, alignItems: "center", marginTop: 16 }}>
          <Text style={[TYPE.subtitle, { color: c.text, textAlign: "center" }]}>{filter === "past" ? "Henüz geçmiş seyahatin yok" : "Henüz seyahatin yok"}</Text>
          <Pressable onPress={() => navigation.navigate("NewTrip")} style={{ marginTop: 15, padding: 10 }}>
            <Text style={[TYPE.label, { color: c.primary }]}>＋ Yeni seyahat oluştur</Text>
          </Pressable>
        </View> : <Text style={[TYPE.caption, { color: c.textSecondary }]}>Yükleniyor...</Text>} />
    </SafeAreaView>
  );
}
