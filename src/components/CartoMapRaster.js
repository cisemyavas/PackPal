import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, Modal, Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, UrlTile } from "react-native-maps";
import * as Location from "expo-location";
import { useTheme } from "../context/ThemeContext";
import { TYPE } from "../constants/typography";

const GALATA = { latitude: 41.0256, longitude: 28.9739 };
const INITIAL_REGION = { ...GALATA, latitudeDelta: 0.015, longitudeDelta: 0.016 };
const CARTO_KEY = (process.env.EXPO_PUBLIC_CARTO_BASEMAP_KEY || "").trim();
const HAS_KEY = Boolean(CARTO_KEY && CARTO_KEY !== "YOUR_CARTO_KEY");
const ATTRIBUTION = "© OpenStreetMap contributors · © CARTO";

function MapButton({ icon, accessibilityLabel, onPress, disabled, colors }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={{
        width: 42, height: 42, borderRadius: 15, marginBottom: 8,
        justifyContent: "center", alignItems: "center",
        backgroundColor: colors.surface, opacity: disabled ? 0.5 : 1,
      }}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
    </Pressable>
  );
}

/** CARTO PNG tiles rendered in react-native-maps, which is available in Expo Go. */
export default function CartoMapRaster({
  onSelectPlace,
  targetRegion,
  showGalataLabel = true,
  mapHeight = 268,
  fullscreenMode = false,
  onClose,
}) {
  const { colors: c, resolvedMode, language } = useTheme();
  const tr = language !== "en";
  const mapRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
const [currentRegion, setCurrentRegion] = useState(
  targetRegion || INITIAL_REGION
);

  // Move the existing map only when the parent supplies a search result.
  useEffect(() => {
    if (!targetRegion) return;
    mapRef.current?.animateToRegion(targetRegion, 750);
  }, [targetRegion]);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [tileError, setTileError] = useState("");
  const [checking, setChecking] = useState(false);
  const [retry, setRetry] = useState(0);

  const tileStyle = resolvedMode === "dark" ? "dark_all" : "light_all";
  const tileRoot = `https://basemaps.cartocdn.com/rastertiles/${tileStyle}`;
  const tileUrl = `${tileRoot}/{z}/{x}/{y}.png?key=${encodeURIComponent(CARTO_KEY)}`;

  // A small tile request reveals network / API errors rather than showing
  // an unexplained empty gray map. It does not depend on WebGL or a CDN JS file.
  useEffect(() => {
    if (!HAS_KEY) return;
    let active = true;
    const controller = new AbortController();
    setTileError("");
    setChecking(true);
    fetch(`${tileRoot}/0/0/0.png?key=${encodeURIComponent(CARTO_KEY)}`, {
      method: "GET", signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`CARTO HTTP ${response.status}`);
        const contentType = response.headers.get("content-type") || "";
        if (contentType && !contentType.includes("image/")) {
          throw new Error("CARTO yanıtı harita görüntüsü değil");
        }
        if (active) setTileError("");
      })
      .catch((error) => {
        if (active && error?.name !== "AbortError") {
          setTileError(error?.message || "CARTO bağlantısı kurulamadı");
        }
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; controller.abort(); };
  }, [tileRoot, retry]);

  const focusGalata = useCallback(() => {
    mapRef.current?.animateToRegion(INITIAL_REGION, 650);
    onSelectPlace?.("galata");
  }, [onSelectPlace]);

  async function locateMe() {
    if (locating) return;
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          tr ? "Konum izni gerekli" : "Location permission needed",
          tr ? "Konumunu görmek için izin verebilirsin. Harita izinsiz de çalışır."
             : "Allow location access to see your location. The map works without it."
        );
        return;
      }
      const result = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const location = { latitude: result.coords.latitude, longitude: result.coords.longitude };
      setUserLocation(location);
      mapRef.current?.animateToRegion({ ...location, latitudeDelta: 0.012, longitudeDelta: 0.014 }, 750);
    } catch (error) {
      Alert.alert(tr ? "Konum alınamadı" : "Location unavailable", error?.message || "Try again");
    } finally {
      setLocating(false);
    }
  }

  if (!HAS_KEY) {
    return (
      <View style={{ height: mapHeight, borderRadius: 24, backgroundColor: c.surfaceAlt,
        justifyContent: "center", alignItems: "center", paddingHorizontal: 22, gap: 10 }}>
        <Ionicons name="map-outline" size={32} color={c.primary} />
        <Text style={[TYPE.subtitle, { color: c.text, textAlign: "center" }]}>
          {tr ? "CARTO anahtarı bulunamadı" : "CARTO key not found"}
        </Text>
        <Text style={[TYPE.caption, { color: c.textSecondary, textAlign: "center" }]}>
          EXPO_PUBLIC_CARTO_BASEMAP_KEY
        </Text>
      </View>
    );
  }

  return (
    <View style={{ height: mapHeight, borderRadius: 24, overflow: "hidden", backgroundColor: c.surfaceAlt }}>
      <MapView
        key={resolvedMode}
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={(region) => {
  setCurrentRegion(region);
}}
        onMapReady={() => {
          if (targetRegion) mapRef.current?.animateToRegion(targetRegion, 750);
        }}
        mapType={Platform.OS === "android" ? "none" : "standard"}
        rotateEnabled={false}
        pitchEnabled={false}
        showsCompass={false}
        showsBuildings={false}
        showsPointsOfInterest={false}
      >
        <UrlTile
          key={`${tileStyle}-${retry}`}
          urlTemplate={tileUrl}
          maximumZ={20}
          tileSize={256}
          flipY={false}
          shouldReplaceMapContent={Platform.OS === "ios"}
          zIndex={1}
        />
        <Marker coordinate={GALATA} onPress={() => onSelectPlace?.("galata")}>
          <View style={{ width: 43, height: 43, borderRadius: 15, backgroundColor: c.button,
            justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#fff" }}>
            <Ionicons name="location" size={24} color="#fff" />
          </View>
        </Marker>
        {userLocation ? <Marker coordinate={userLocation} tracksViewChanges={false}>
          <View style={{ width: 17, height: 17, backgroundColor: "#4A9CF6", borderRadius: 9,
            borderWidth: 3, borderColor: "#fff" }} />
        </Marker> : null}
      </MapView>
      <View pointerEvents="box-none" style={{ position: "absolute", right: 12, top: 12 }}>
        <MapButton
  icon={fullscreenMode ? "contract-outline" : "expand-outline"}
  accessibilityLabel={
    fullscreenMode
      ? (tr ? "Haritayı küçült" : "Minimize map")
      : (tr ? "Haritayı büyüt" : "Expand map")
  }
  onPress={
    fullscreenMode
      ? onClose
      : () => setFullscreen(true)
  }
  colors={c}
/>
        <MapButton icon={locating ? "hourglass-outline" : "locate-outline"}
          accessibilityLabel={tr ? "Konumuma git" : "Find my location"}
          onPress={locateMe} disabled={locating} colors={c} />
        <MapButton icon="compass-outline"
          accessibilityLabel={tr ? "Galata Kulesi'ne dön" : "Back to Galata Tower"}
          onPress={focusGalata} colors={c} />
          {!fullscreenMode && (
  <Modal
    visible={fullscreen}
    animationType="slide"
    presentationStyle="fullScreen"
    onRequestClose={() => setFullscreen(false)}
    statusBarTranslucent
  >
    <View
      style={{
        flex: 1,
        backgroundColor: c.background,
        paddingTop: Platform.OS === "android" ? 36 : 54,
        paddingBottom: 18,
        paddingHorizontal: 8,
      }}
    >
      <CartoMapRaster
        fullscreenMode
        mapHeight="100%"
        targetRegion={currentRegion}
        showGalataLabel={showGalataLabel}
        onSelectPlace={onSelectPlace}
        onClose={() => setFullscreen(false)}
      />
    </View>
  </Modal>
)}
      </View>
      {showGalataLabel ? <Pressable accessibilityRole="button" onPress={focusGalata}
        style={{ position: "absolute", left: 12, bottom: 38, backgroundColor: c.surface,
          paddingHorizontal: 11, paddingVertical: 7, borderRadius: 13 }}>
        <Text style={[TYPE.micro, { color: c.primary }]}>{tr ? "Galata Kulesi" : "Galata Tower"}</Text>
      </Pressable> : null}
      <Pressable accessibilityRole="link"
        onPress={() => Linking.openURL("https://carto.com/attribution/")}
        style={{ position: "absolute", left: 9, bottom: 7 }}>
        <Text style={{ fontSize: 9, color: c.textSecondary, backgroundColor: c.surface,
          paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, overflow: "hidden" }}>
          {ATTRIBUTION}
        </Text>
      </Pressable>
      {checking && !tileError ? <View pointerEvents="none"
        style={{ position: "absolute", top: 15, left: 15, backgroundColor: c.surface,
          borderRadius: 10, padding: 7 }}>
        <ActivityIndicator size="small" color={c.primary} />
      </View> : null}
      {tileError ? <View style={{ position: "absolute", top: 69, left: 12, right: 64,
        backgroundColor: c.surface, borderRadius: 12, padding: 10, gap: 6 }}>
        <Text style={[TYPE.caption, { color: c.danger || c.text }]}>
          {tr ? "CARTO döşemeleri yüklenemedi" : "CARTO map tiles couldn't load"}: {tileError}
        </Text>
        <Pressable onPress={() => setRetry(x => x + 1)}>
          <Text style={[TYPE.label, { color: c.primary }]}>{tr ? "Tekrar dene →" : "Try again →"}</Text>
        </Pressable>
      </View> : null}
    </View>
  );
}
