import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import useTrips from "../hooks/useTrips";
import { getWeatherForDestination } from "../services/weatherApi";
import { TYPE } from "../constants/typography";
import { IconTile, PageHeader, PackingProgressCard, RoundedCard, TripHeroCard } from "../components/RefinedUI";

const COPY = {
  tr: {
    intro: "Seyahatini planla, valizini hazırla ve yeni yerler keşfet. Hepsi PackPal'de!",
    features: "PackPal ile neler yapabilirsin?",
    packing: ["Valizini Hazırla", "İhtiyacın olan her şeyi listele, hiçbir şeyi unutma.", "Valize Git"],
    plan: ["Gezini Planla", "Seyahatlerini, rotalarını ve aktivitelerini düzenle.", "Plan Oluştur"],
    shared: ["Ortak Valiz Hazırla", "Arkadaşlarınla paylaş, kimin ne getireceğini belirle.", "Birlikte Hazırlan"],
    discover: ["Çevreni Keşfet", "Yakınındaki tarihi ve turistik yerleri keşfet.", "Keşfet"],
    upcoming: "Sıradaki Yolculuğun", emptyTitle: "İlk macerana hazır mısın?",
    empty: "Henüz bir seyahat planlamadın. İlk maceranı oluşturmaya ne dersin?",
    newTrip: "Yeni Seyahat Oluştur", weather: "Seyahat hava durumu", loading: "Seyahatler yükleniyor...",
    weatherEmpty: "Tahmin henüz mevcut değil", days: "gün kaldı", today: "Bugün başlıyor", details: "Seyahat Detayına Git",
    eyebrow: "YENİ ROTALAR, YENİ HİKÂYELER", hello: "Merhaba", subtitle: "Yeni maceran nerede başlıyor?",
  },
  en: {
    intro: "Plan your trips, pack your bags and discover new places. All in PackPal!",
    features: "What can you do with PackPal?",
    packing: ["Pack Your Bags", "List everything you need and never forget an item.", "Open Packing"],
    plan: ["Plan Your Trip", "Organize your trips, routes and activities.", "Create a Plan"],
    shared: ["Pack Together", "Share a list with friends and decide who brings what.", "Shared Packing"],
    discover: ["Explore Nearby", "Discover historical landmarks and attractions nearby.", "Explore"],
    upcoming: "Your Next Journey", emptyTitle: "Ready for your first adventure?",
    empty: "No trips planned yet. Why not create your first adventure?",
    newTrip: "Create a Trip", weather: "Trip weather", loading: "Loading trips...",
    weatherEmpty: "Forecast not available yet", days: "days to go", today: "Starts today", details: "View Trip Details",
    eyebrow: "NEW PLACES, NEW STORIES", hello: "Hello", subtitle: "Where will your next adventure begin?",
  },
};

function FeatureCard({ title, description, action, icon, color, surface, border, textColor, muted, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (toValue) => Animated.spring(scale, { toValue, useNativeDriver: true, speed: 22, bounciness: 4 }).start();
  return (
    <Animated.View style={{ width: "48.3%", transform: [{ scale }] }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${action}`} onPress={onPress}
        onPressIn={() => animate(0.97)} onPressOut={() => animate(1)}
        style={{ flex: 1, backgroundColor: surface, borderColor: border, borderWidth: 1, borderRadius: 24, padding: 15, minHeight: 205, overflow: "hidden" }}>
        <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: `${color}20`, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={[TYPE.label, { color: textColor, fontSize: 14, lineHeight: 20, marginBottom: 6 }]}>{title}</Text>
        <Text style={[TYPE.caption, { color: muted, fontSize: 11, lineHeight: 16, flexGrow: 1 }]}>{description}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12 }}>
          <Text style={{ color, fontSize: 11, fontFamily: "PlusJakartaSans_700Bold", flexShrink: 1 }}>{action}</Text>
          <Ionicons name="arrow-forward" size={14} color={color} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function dateValue(value) {
  if (!value) return null;
  if (typeof value === "object" && typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T12:00:00`);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function HomeScreen({ navigation }) {
  const { colors: c, language } = useTheme();
  const { user } = useAuth();
  const { trips = [], loading, storageError } = useTrips();
  const [weather, setWeather] = useState(null);
  const t = COPY[language === "en" ? "en" : "tr"];
  const firstName = (user?.displayName || user?.email?.split("@")[0] || (language === "en" ? "Traveler" : "Gezgin")).trim().split(/\s+/)[0];
  const go = (screen, params) => navigation.navigate("Plan", { screen, params });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const current = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return [...(Array.isArray(trips) ? trips : [])]
      .filter(trip => { const end = dateValue(trip.endDate) || dateValue(trip.startDate); return end && end >= now; })
      .sort((a, b) => (dateValue(a.startDate)?.getTime() || Infinity) - (dateValue(b.startDate)?.getTime() || Infinity))[0] || null;
  }, [trips]);
  const start = dateValue(current?.startDate);
  const daysLeft = start ? Math.max(0, Math.ceil((start.getTime() - today.getTime()) / 86400000)) : null;

  useEffect(() => {
    let active = true;
    setWeather(null);
    if (current?.destination && current?.startDate && current?.endDate) {
      getWeatherForDestination(current.destination, current.startDate, current.endDate)
        .then(result => { if (active) setWeather(result); }).catch(() => {});
    }
    return () => { active = false; };
  }, [current?.id, current?.destination, current?.startDate, current?.endDate]);
  const forecastDay = weather?.forecast?.[0];
  const temperature = forecastDay?.maxTemperature ?? forecastDay?.temperatureMax ?? forecastDay?.temperature_2m_max ?? forecastDay?.maxTemp;
  const accents = [c.primary, c.info || c.primary, c.secondary || c.primary, c.success || c.primary];
  const cards = [
    { key: "packing", icon: "bag-handle-outline", onPress: () => navigation.navigate("Packing") },
    { key: "plan", icon: "calendar-outline", onPress: () => go("Trips") },
    { key: "shared", icon: "people-outline", onPress: () => go("SharedTrips") },
    { key: "discover", icon: "compass-outline", onPress: () => navigation.navigate("Discover") },
  ];
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 124, gap: 18 }}>
        <PageHeader eyebrow={t.eyebrow} title={`${t.hello}, ${firstName} 👋`} subtitle={t.subtitle}
          icon="person-circle-outline" onAction={() => navigation.navigate("Profile")} />
        <Text style={[TYPE.caption, { color: c.textSecondary, lineHeight: 20, marginTop: -9 }]}>{t.intro}</Text>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="sparkles-outline" size={19} color={c.primary} />
            <Text style={[TYPE.subtitle, { color: c.text, flex: 1 }]}>{t.features}</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 }}>
            {cards.map((card, index) => (
              <FeatureCard key={card.key} title={t[card.key][0]} description={t[card.key][1]} action={t[card.key][2]}
                icon={card.icon} color={accents[index]} surface={c.surface} border={c.border}
                textColor={c.text} muted={c.textSecondary} onPress={card.onPress} />
            ))}
          </View>
        </View>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="airplane-outline" size={19} color={c.primary} />
            <Text style={[TYPE.subtitle, { color: c.text }]}>{t.upcoming}</Text>
          </View>
          {storageError ? <Text style={{ color: c.danger }}>{String(storageError)}</Text> : null}
          {loading ? <Text style={[TYPE.caption, { color: c.textSecondary }]}>{t.loading}</Text> : current ? (
            <View style={{ gap: 10 }}>
              <TripHeroCard trip={current} onPress={() => go("TripDetail", { tripId: current.id })} />
              {daysLeft !== null ? <Text style={[TYPE.caption, { color: c.primary, textAlign: "right" }]}>{daysLeft === 0 ? t.today : `${daysLeft} ${t.days}`}</Text> : null}
              <Pressable accessibilityRole="button" onPress={() => go("TripDetail", { tripId: current.id })}
                style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 5 }}>
                <Text style={{ color: c.primary, fontFamily: "PlusJakartaSans_700Bold", fontSize: 12 }}>{t.details}</Text>
                <Ionicons name="arrow-forward" size={15} color={c.primary} />
              </Pressable>
            </View>
          ) : (
            <RoundedCard style={{ padding: 22, alignItems: "center", gap: 11, borderRadius: 24 }}>
              <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: `${c.primary}20`, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="airplane-outline" size={30} color={c.primary} />
              </View>
              <Text style={[TYPE.subtitle, { color: c.text, textAlign: "center" }]}>{t.emptyTitle}</Text>
              <Text style={[TYPE.caption, { color: c.textSecondary, textAlign: "center", lineHeight: 20 }]}>{t.empty}</Text>
              <Pressable accessibilityRole="button" onPress={() => go("NewTrip")}
                style={{ backgroundColor: c.primary, borderRadius: 17, paddingVertical: 13, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 7, marginTop: 3 }}>
                <Ionicons name="add-circle-outline" size={18} color={c.onPrimary || "#FFFFFF"} />
                <Text style={{ color: c.onPrimary || "#FFFFFF", fontFamily: "PlusJakartaSans_700Bold", fontSize: 13 }}>{t.newTrip}</Text>
              </Pressable>
            </RoundedCard>
          )}
        </View>
        {current ? <>
          <RoundedCard style={{ minHeight: 76, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12, gap: 12 }}>
            <IconTile icon="sunny-outline" />
            <View style={{ flex: 1 }}>
              <Text style={[TYPE.label, { color: c.text }]}>{t.weather}</Text>
              <Text style={[TYPE.caption, { color: c.textSecondary }]} numberOfLines={1}>{current.destination || t.weatherEmpty}</Text>
            </View>
            {temperature != null && Number.isFinite(Number(temperature)) ?
              <Text style={[TYPE.title, { color: c.text }]}>{Math.round(Number(temperature))}°</Text> :
              <Text style={[TYPE.caption, { color: c.textSecondary }]}>—</Text>}
          </RoundedCard>
          <PackingProgressCard trip={current} onPress={() => navigation.navigate("Packing")} />
        </> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
