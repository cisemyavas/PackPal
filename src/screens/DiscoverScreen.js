import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, TextInput, View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { PageHeader, RoundedCard } from "../components/RefinedUI";
import { TYPE } from "../constants/typography";
import CartoMap from "../components/CartoMap";

export default function DiscoverScreen({ route }) {
  const { colors: c, language } = useTheme();
  const { user } = useAuth();
  const tr = language !== "en";
  const [tab, setTab] = useState(route?.params?.screen === "journal" ? "journal" : "map");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activePlace, setActivePlace] = useState("galata");
  const [targetRegion, setTargetRegion] = useState(null);
  const [entries, setEntries] = useState([]);
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const storageKey = `packpal:journal:${user?.uid || "guest"}`;

  useEffect(() => {
    if (route?.params?.screen === "journal") setTab("journal");
  }, [route?.params?.screen]);
  useEffect(() => {
    let live = true;
    setHydrated(false);
    AsyncStorage.getItem(storageKey)
      .then(raw => { if (live) setEntries(raw ? JSON.parse(raw) : []); })
      .catch(() => { if (live) setEntries([]); })
      .finally(() => { if (live) setHydrated(true); });
    return () => { live = false; };
  }, [storageKey]);
  async function saveEntries(next) {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      setEntries(next);
    } catch (error) {
      Alert.alert(tr ? "Kaydedilemedi" : "Could not save", error.message);
    }
  }
  function addEntry() {
    if (!place.trim()) { Alert.alert(tr ? "Yer adı gerekli" : "Place name required"); return; }
    const newEntry = { id: String(Date.now()), place: place.trim(), note: note.trim() };
    saveEntries([newEntry, ...entries]);
    setPlace(""); setNote("");
  }
  function removeEntry(id) {
    Alert.alert(tr ? "Kaydı sil?" : "Delete entry?", "", [
      { text: tr ? "İptal" : "Cancel", style: "cancel" },
      { text: tr ? "Sil" : "Delete", style: "destructive", onPress: () => saveEntries(entries.filter(e => e.id !== id)) },
    ]);
  }
  function handleSelectPlace(placeId) {
    if (placeId !== "galata") return;
    setActivePlace("galata");
    setSelectedLocation(null);
    setTargetRegion({
      latitude: 41.0256,
      longitude: 28.9739,
      latitudeDelta: 0.015,
      longitudeDelta: 0.016,
    });
  }

  const openSearch = async () => {
    const text = query.trim();
    if (!text) {
      Alert.alert(tr ? "Konum gerekli" : "Location required",
        tr ? "Lütfen bir şehir veya konum yaz." : "Please enter a city or location.");
      return;
    }
    if (searching) return;
    setSearching(true);
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=1&language=${tr ? "tr" : "en"}&format=json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
      const data = await response.json();
      const location = data?.results?.[0];
      const latitude = Number(location?.latitude);
      const longitude = Number(location?.longitude);
      if (!location || !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
          Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        Alert.alert(tr ? "Konum bulunamadı" : "Location not found",
          tr ? "Başka bir şehir veya konum adı deneyebilirsin." : "Try another city or location name.");
        return;
      }
      setSelectedLocation({ name: location.name || text, country: location.country || "" });
      setActivePlace(null);
      setTargetRegion({
        latitude,
        longitude,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      });
      setTab("map");
    } catch (error) {
      Alert.alert(tr ? "Arama başarısız" : "Search failed",
        tr ? "İnternet bağlantını kontrol edip tekrar dene." : "Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };
  const locationSubtitle = selectedLocation
    ? `${selectedLocation.name}${selectedLocation.country ? `, ${selectedLocation.country}` : ""} · ${tr ? "Etkileşimli harita" : "Interactive map"}`
    : (tr ? "İstanbul, Türkiye · Etkileşimli harita" : "Istanbul, Turkey · Interactive map");
  const chip = (id, title) => <Pressable onPress={() => setTab(id)}
    style={{ backgroundColor: tab === id ? c.primaryLight : c.surfaceAlt, paddingHorizontal: 10, height: 28, borderRadius: 14, justifyContent: "center", marginRight: 12 }}>
    <Text style={[TYPE.micro, { color: tab === id ? c.primary : c.textSecondary }]}>{title}</Text>
  </Pressable>;

  return <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.background }}>
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 132, gap: 16 }}>
      <PageHeader eyebrow={tr ? "MERAKININ PEŞİNDEN GİT" : "FOLLOW YOUR CURIOSITY"}
        title={tr ? "Keşfet" : "Discover"} subtitle={locationSubtitle}
        icon="compass-outline" onAction={openSearch} />
      <View style={{ minHeight: 52, backgroundColor: c.surface, borderRadius: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 }}>
        <Ionicons name="search-outline" size={20} color={c.textSecondary} />
        <TextInput placeholder={tr ? "Bir yer ya da deneyim ara" : "Search for a place or experience"}
          placeholderTextColor={c.textSecondary} value={query} onChangeText={setQuery}
          onSubmitEditing={openSearch} returnKeyType="search" style={[TYPE.body, { color: c.text, flex: 1 }]} />
        {searching ? <ActivityIndicator size="small" color={c.primary} /> : query.trim() ?
          <Pressable accessibilityRole="button" accessibilityLabel={tr ? "Konum ara" : "Search location"}
            onPress={openSearch}><Ionicons name="arrow-forward" size={20} color={c.primary} /></Pressable> : null}
      </View>
      <View style={{ flexDirection: "row" }}>
        {chip("map", tr ? "Harita" : "Map")}{chip("journal", tr ? "Keşif günlüğüm" : "My discovery journal")}
      </View>
      {tab === "map" ? <>
        <CartoMap targetRegion={targetRegion} showGalataLabel={activePlace === "galata"}
          onSelectPlace={handleSelectPlace} />
        {activePlace === "galata" ? <RoundedCard style={{ padding: 20, minHeight: 130 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={[TYPE.title, { color: c.text }]}>{tr ? "Galata Kulesi" : "Galata Tower"}</Text>
            <View style={{ marginLeft: 12, borderRadius: 14, backgroundColor: c.primaryLight, paddingHorizontal: 9, paddingVertical: 6 }}>
              <Text style={[TYPE.micro, { color: c.primary }]}>{tr ? "Haritada işaretli" : "Pinned on map"}</Text>
            </View>
          </View>
          <Text style={[TYPE.body, { color: c.textSecondary, marginBottom: 10 }]}>{tr ? "Şehri bir de yukarıdan keşfet." : "See the city from above."}</Text>
          <Pressable onPress={() => Linking.openURL(tr ? "https://tr.wikipedia.org/wiki/Galata_Kulesi" : "https://en.wikipedia.org/wiki/Galata_Tower")}><Text style={[TYPE.label, { color: c.primary }]}>{tr ? "Devamını oku →" : "Read more →"}</Text></Pressable>
        </RoundedCard> : null}
      </> : <>
        <RoundedCard style={{ padding: 20, gap: 12 }}>
          <Text style={[TYPE.subtitle, { color: c.text }]}>{tr ? "Yeni keşif notu" : "New discovery note"}</Text>
          <TextInput placeholder={tr ? "Ziyaret ettiğin yer" : "Place you visited"} placeholderTextColor={c.textSecondary} value={place} onChangeText={setPlace}
            style={[TYPE.body, { backgroundColor: c.surfaceAlt, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: c.text }]} />
          <TextInput placeholder={tr ? "Kişisel notların..." : "Your notes..."} placeholderTextColor={c.textSecondary} multiline numberOfLines={3}
            value={note} onChangeText={setNote} style={[TYPE.body, { minHeight: 80, textAlignVertical: "top", backgroundColor: c.surfaceAlt, borderRadius: 14, padding: 14, color: c.text }]} />
          <Pressable onPress={addEntry} style={{ height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center", backgroundColor: c.button }}>
            <Text style={[TYPE.label, { color: "#fff" }]}>{tr ? "Notu kaydet" : "Save note"}</Text>
          </Pressable>
        </RoundedCard>
        {hydrated && entries.length === 0 ? <Text style={[TYPE.caption, { color: c.textSecondary, textAlign: "center" }]}>{tr ? "Henüz bir keşif notun yok." : "No discovery notes yet."}</Text> : null}
        {entries.map(item => <RoundedCard key={item.id} style={{ padding: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Text style={[TYPE.subtitle, { color: c.text, flex: 1 }]}>{item.place}</Text>
            <Pressable accessibilityLabel={tr ? "Notu sil" : "Delete note"} onPress={() => removeEntry(item.id)}><Ionicons name="trash-outline" size={20} color={c.danger} /></Pressable>
          </View>
          {item.note ? <Text style={[TYPE.body, { color: c.textSecondary, marginTop: 8 }]}>{item.note}</Text> : null}
        </RoundedCard>)}
      </>}
    </ScrollView>
  </SafeAreaView>;
}
