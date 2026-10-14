import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import useTrips from "../hooks/useTrips";
import { getWeatherForDestination } from "../services/weatherApi";
import { TYPE } from "../constants/typography";
import { ActionButton, IconTile, PageHeader, PackingProgressCard, RoundedCard, TripHeroCard } from "../components/RefinedUI";

export default function HomeScreen({ navigation }) {
  const { colors: c, language } = useTheme();
  const { user } = useAuth();
  const { trips, loading, storageError } = useTrips();
  const [weather, setWeather] = useState(null);
  const current = [...trips].sort((a, b) => String(a.startDate || "").localeCompare(String(b.startDate || "")))
    .find(t => !t.endDate || t.endDate >= new Date().toISOString().slice(0, 10)) || trips[0];
  const firstName = (user?.displayName || user?.email?.split("@")[0] || "Gezgin").trim().split(/\s+/)[0];
  const go = (screen, params) => navigation.navigate("Plan", { screen, params });

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
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 124, gap: 16 }}>
        <PageHeader eyebrow={language === "en" ? "NEW PLACES, NEW STORIES" : "YENİ ROTALAR, YENİ HİKÂYELER"}
          title={language === "en" ? `Hello, ${firstName}` : `Merhaba, ${firstName}`}
          subtitle={language === "en" ? "Ready for your next adventure?" : "Bir sonraki yolculuğuna hazır mısın?"}
          icon="notifications-outline" onAction={() => navigation.navigate("Profile")} />
        {storageError ? <Text style={{ color: c.danger }}>{storageError}</Text> : null}
        {loading ? <Text style={[TYPE.caption, { color: c.textSecondary }]}>Seyahatler yükleniyor...</Text> :
          current ? <TripHeroCard trip={current} onPress={() => go("TripDetail", { tripId: current.id })} /> :
          <RoundedCard style={{ padding: 24, alignItems: "center", gap: 10 }}>
            <Ionicons name="airplane-outline" size={34} color={c.primary} />
            <Text style={[TYPE.subtitle, { color: c.text }]}>Yeni bir yolculuğa hazır mısın?</Text>
            <Text style={[TYPE.caption, { color: c.textSecondary, textAlign: "center" }]}>İlk seyahatini oluştur ve valizini kolayca hazırla.</Text>
          </RoundedCard>}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <ActionButton style={{ flex: 1 }} label={language === "en" ? "New trip" : "Yeni seyahat"} icon="add" onPress={() => go("NewTrip")} />
          <ActionButton style={{ flex: 1 }} label={language === "en" ? "My packing" : "Valizime git"} secondary onPress={() => navigation.navigate("Packing")} />
        </View>
        <RoundedCard style={{ height: 80, flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 }}>
          <IconTile icon="sunny-outline" />
          <View style={{ flex: 1 }}>
            <Text style={[TYPE.label, { color: c.text }]}>{language === "en" ? "Travel weather" : "Seyahat hava durumu"}</Text>
            <Text style={[TYPE.caption, { color: c.textSecondary }]} numberOfLines={1}>{current ? `${current.destination} · Seyahat tahmini` : "Önce bir seyahat oluştur"}</Text>
          </View>
          {temperature != null ? <Text style={[TYPE.title, { color: c.text }]}>{Math.round(Number(temperature))}°</Text> :
            <Text style={[TYPE.caption, { color: c.textSecondary }]}>{current ? "—" : ""}</Text>}
        </RoundedCard>
        {current ? <PackingProgressCard trip={current} onPress={() => navigation.navigate("Packing")} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
