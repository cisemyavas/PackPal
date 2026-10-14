import React, { useMemo, useRef, useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Camera, Map, Marker } from "@maplibre/maplibre-react-native";
import { useTheme } from "../context/ThemeContext";
import { TYPE } from "../constants/typography";

// The app starts at the Figma sample place, NOT at the user's current location.
// MapLibre geographic coordinates are always [longitude, latitude].
export const GALATA_COORDINATES = [28.9739, 41.0256];

// EXPO_PUBLIC_ variables are compiled into the client; this is a public map key,
// NOT a server-side secret. Restrict it in the CARTO dashboard for production.
const CARTO_KEY = (process.env.EXPO_PUBLIC_CARTO_BASEMAP_KEY || "").trim();
const HAS_CARTO_KEY = Boolean(CARTO_KEY && CARTO_KEY !== "YOUR_CARTO_KEY");
const ATTRIBUTION = "© OpenStreetMap contributors · © CARTO";

function IconButton({ onPress, name, label, color, backgroundColor, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={{
        height: 42,
        width: 42,
        borderRadius: 15,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Ionicons name={name} size={22} color={color} />
    </Pressable>
  );
}

/**
 * Embedded, interactive CARTO vector map for the PackPal Discover screen.
 * Does not change Firebase, journal data, or the navigation tree.
 */
export default function CartoMap({ onSelectPlace, mapHeight = 268 }) {
  const { colors: c, resolvedMode, language } = useTheme();
  const tr = language !== "en";
  const cameraRef = useRef(null);
  const [userCoord, setUserCoord] = useState(null);
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState(false);

  const mapStyle = useMemo(() => {
    if (!HAS_CARTO_KEY) return null;
    const cartoStyle = resolvedMode === "dark" ? "dark-matter" : "positron";
    return `https://basemaps.cartocdn.com/gl/${cartoStyle}-gl-style/style.json?key=${encodeURIComponent(CARTO_KEY)}`;
  }, [resolvedMode]);

  async function locateMe() {
    if (locating) return;
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          tr ? "Konum izni gerekli" : "Location permission needed",
          tr
            ? "Konumunu göstermek için uygulamaya konum izni verebilirsin. Haritayı izinsiz de kullanabilirsin."
            : "Allow location access to see your position. You can still explore the map without it."
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = [location.coords.longitude, location.coords.latitude];
      setUserCoord(coords);
      cameraRef.current?.flyTo({ center: coords, zoom: 15, duration: 900 });
    } catch (error) {
      Alert.alert(
        tr ? "Konum alınamadı" : "Could not get location",
        error?.message || (tr ? "Tekrar deneyebilirsin." : "Please try again.")
      );
    } finally {
      setLocating(false);
    }
  }

  function focusGalata() {
    cameraRef.current?.flyTo({ center: GALATA_COORDINATES, zoom: 15.5, duration: 750 });
    onSelectPlace?.("galata");
  }

  if (!mapStyle) {
    return (
      <View
        style={{
          height: mapHeight,
          backgroundColor: c.surfaceAlt,
          borderRadius: 24,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          gap: 12,
        }}
      >
        <Ionicons name="map-outline" size={36} color={c.primary} />
        <Text style={[TYPE.subtitle, { color: c.text, textAlign: "center" }]}>
          {tr ? "CARTO haritası hazır" : "CARTO map is ready"}
        </Text>
        <Text style={[TYPE.caption, { color: c.textSecondary, textAlign: "center" }]}>
          {tr
            ? "Haritayı etkinleştirmek için .env.local dosyasına EXPO_PUBLIC_CARTO_BASEMAP_KEY ekle."
            : "To enable the map, add EXPO_PUBLIC_CARTO_BASEMAP_KEY to .env.local."}
        </Text>
        <Pressable onPress={() => Linking.openURL("https://carto.com/basemaps/apikey/")}>
          <Text style={[TYPE.label, { color: c.primary }]}>
            {tr ? "Ücretsiz CARTO anahtarı al →" : "Get a free CARTO key →"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ height: mapHeight, borderRadius: 24, backgroundColor: c.surfaceAlt, overflow: "hidden" }}>
      <Map
        key={resolvedMode}
        style={{ flex: 1 }}
        mapStyle={mapStyle}
        androidView="texture"
        attribution={false}
        logo={false}
        compass={false}
        onDidFailLoadingMap={() => setMapError(true)}
        onDidFinishLoadingMap={() => setMapError(false)}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{ center: GALATA_COORDINATES, zoom: 14.5, pitch: 0 }}
          minZoom={2}
          maxZoom={19}
        />
        <Marker id="packpal-galata" lngLat={GALATA_COORDINATES} onPress={focusGalata}>
          <View
            style={{
              width: 44, height: 44, borderRadius: 16, backgroundColor: c.button,
              alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF",
            }}
          >
            <Ionicons name="location" color="#FFFFFF" size={24} />
          </View>
        </Marker>
        {userCoord ? (
          <Marker id="packpal-user-location" lngLat={userCoord}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#4A9CF6", borderWidth: 3, borderColor: "#FFFFFF" }} />
          </Marker>
        ) : null}
      </Map>
      <View pointerEvents="box-none" style={{ position: "absolute", right: 12, top: 12 }}>
        <IconButton
          name={locating ? "hourglass-outline" : "locate-outline"}
          label={tr ? "Konumuma git" : "Find my location"}
          disabled={locating}
          onPress={locateMe}
          color={c.primary}
          backgroundColor={c.surface}
        />
        <IconButton
          name="compass-outline"
          label={tr ? "Galata Kulesi'ne dön" : "Back to Galata Tower"}
          onPress={focusGalata}
          color={c.primary}
          backgroundColor={c.surface}
        />
      </View>
      <Pressable
        onPress={focusGalata}
        accessibilityRole="button"
        style={{ position: "absolute", left: 12, bottom: 38, backgroundColor: c.surface, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 13 }}
      >
        <Text style={[TYPE.micro, { color: c.primary }]}>
          {tr ? "Galata Kulesi" : "Galata Tower"}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL("https://carto.com/attribution/")}
        style={{ position: "absolute", bottom: 7, left: 9, right: 9, alignItems: "flex-start" }}
      >
        <Text style={{ fontSize: 9, color: c.textSecondary, backgroundColor: c.surface, borderRadius: 4, overflow: "hidden", paddingHorizontal: 4, paddingVertical: 2 }}>
          {ATTRIBUTION}
        </Text>
      </Pressable>
      {mapError ? (
        <View pointerEvents="none" style={{ position: "absolute", top: 16, left: 14, right: 66, backgroundColor: c.surface, borderRadius: 10, padding: 10 }}>
          <Text style={[TYPE.caption, { color: c.danger || c.text }]}>
            {tr ? "Harita yüklenemedi. CARTO anahtarını ve internetini kontrol et." : "Map loading failed. Check your CARTO key and internet."}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
