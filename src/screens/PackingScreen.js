import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import useTrips from "../hooks/useTrips";
import { getPackingProgress } from "../utils/progress";
import { CATEGORY_LABELS } from "../constants/categories";
import { TYPE } from "../constants/typography";
import { IconTile, PageHeader, ProgressTrack, RoundedCard, formatTripDates } from "../components/RefinedUI";

export default function PackingScreen({ navigation }) {
  const { colors: c, language } = useTheme();
  const { trips, toggleItem } = useTrips();
  const [tripId, setTripId] = useState(null);
  const [selecting, setSelecting] = useState(false);
  useEffect(() => {
    if (!trips.length) { setTripId(null); return; }
    if (!trips.some(t => String(t.id) === String(tripId))) setTripId(trips[0].id);
  }, [trips, tripId]);
  const trip = trips.find(t => String(t.id) === String(tripId));
  const { packedCount, totalCount, percentage } = getPackingProgress(trip?.items || []);
  const grouped = useMemo(() => {
    const categories = new Map();
    for (const item of trip?.items || []) {
      const key = item.category || "OTHER";
      if (!categories.has(key)) categories.set(key, []);
      categories.get(key).push(item);
    }
    return [...categories.entries()];
  }, [trip?.items]);
  const tr = language !== "en";
  const openTripScreen = (screen, params) => navigation.navigate("Plan", { screen, params });
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 124, gap: 16 }}>
        <PageHeader eyebrow={tr ? "AZ EŞYA, ÇOK DENEYİM" : "PACK LIGHT, EXPERIENCE MORE"}
          title={tr ? "Valizim" : "Packing"} subtitle={tr ? "Her şey yerli yerinde." : "Everything in its place."}
          icon="add" onAction={() => trip ? openTripScreen("AddItem", { tripId: trip.id }) : openTripScreen("NewTrip")} />
        {!trip ? (
          <RoundedCard style={{ padding: 22, gap: 12 }}>
            <Text style={[TYPE.subtitle, { color: c.text }]}>Önce seyahat oluştur</Text>
            <Text style={[TYPE.caption, { color: c.textSecondary }]}>Valiz listesini görmek için seyahat ekleyebilirsin.</Text>
            <Pressable onPress={() => openTripScreen("NewTrip")}><Text style={[TYPE.label, { color: c.primary }]}>＋ Seyahat ekle</Text></Pressable>
          </RoundedCard>
        ) : <>
          <Pressable onPress={() => setSelecting(value => !value)} style={{ minHeight: 64, borderRadius: 24, backgroundColor: c.surface, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20 }}>
            <Ionicons name="airplane-outline" size={22} color={c.primary} />
            <Text style={[TYPE.label, { color: c.text, flex: 1 }]} numberOfLines={1}>{trip.destination} · {formatTripDates(trip, language)}</Text>
            <Ionicons name={selecting ? "chevron-up" : "chevron-down"} color={c.textSecondary} size={18} />
          </Pressable>
          {selecting ? <RoundedCard style={{ padding: 8 }}>
            {trips.map(t => <Pressable key={String(t.id)} onPress={() => { setTripId(t.id); setSelecting(false); }}
              style={{ padding: 12, borderRadius: 12, backgroundColor: String(t.id) === String(tripId) ? c.primaryLight : "transparent" }}>
              <Text style={[TYPE.label, { color: String(t.id) === String(tripId) ? c.primary : c.text }]}>{t.destination}</Text>
            </Pressable>)}
          </RoundedCard> : null}
          <RoundedCard style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <View>
                <Text style={[TYPE.subtitle, { color: c.text }]}>{percentage >= 100 ? "Valizin hazır!" : tr ? "Neredeyse hazırsın!" : "You're getting ready!"}</Text>
                <Text style={[TYPE.caption, { color: c.textSecondary }]}>{packedCount} {tr ? "eşya hazır" : "ready"} · {totalCount - packedCount} {tr ? "eşya kaldı" : "remaining"}</Text>
              </View>
              <Text style={[TYPE.title, { color: c.primary }]}>%{percentage}</Text>
            </View>
            <ProgressTrack percentage={percentage} />
          </RoundedCard>
          <RoundedCard style={{ minHeight: 90, padding: 20, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <IconTile icon="sunny-outline" />
            <View style={{ flex: 1 }}>
              <Text style={[TYPE.label, { color: c.text }]}>{tr ? "Hava durumunu kontrol et" : "Check your weather"}</Text>
              <Text style={[TYPE.caption, { color: c.textSecondary }]}>{tr ? "Hava durumuna göre eşyalarını hazırla." : "Pack for the forecast."}</Text>
              <Pressable onPress={() => openTripScreen("Weather", { tripId: trip.id })} style={{ paddingTop: 4 }}><Text style={[TYPE.caption, { color: c.primary }]}>Tahmini gör →</Text></Pressable>
            </View>
          </RoundedCard>
          {grouped.map(([category, items]) => (
            <View key={category} style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={[TYPE.subtitle, { color: c.text }]}>{CATEGORY_LABELS[category] || category}</Text>
                <Text style={[TYPE.caption, { color: c.textSecondary }]}>{items.filter(item => item.isPacked).length} / {items.length} hazır</Text>
              </View>
              <RoundedCard style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
                {items.map((item, index) => <Pressable key={String(item.id)} onPress={() => toggleItem(trip.id, item.id)}
                  style={{ minHeight: 52, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: index === items.length - 1 ? 0 : 1, borderColor: c.border }}>
                  <View style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: item.isPacked ? c.successLight : c.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name={item.isPacked ? "checkmark" : "bag-handle-outline"} size={20} color={item.isPacked ? c.success : c.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[TYPE.label, { color: item.isPacked ? c.textSecondary : c.text, textDecorationLine: item.isPacked ? "line-through" : "none" }]}>{item.name}</Text>
                    <Text style={[TYPE.caption, { color: c.textSecondary }]}>{item.quantity || 1} adet</Text>
                  </View>
                </Pressable>)}
              </RoundedCard>
            </View>
          ))}
          {!grouped.length ? <RoundedCard style={{ padding: 20 }}><Text style={[TYPE.label, { color: c.textSecondary }]}>Bu seyahatte henüz eşya yok.</Text></RoundedCard> : null}
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}
