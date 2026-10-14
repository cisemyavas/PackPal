import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { TYPE } from "../constants/typography";
import { getPackingProgress } from "../utils/progress";

const SCENERY = {
  cappadocia: require("../../assets/figma_refined/cappadocia.jpeg"),
  rome: require("../../assets/figma_refined/rome.jpeg"),
};

function formatDate(value, language) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return value || "";
  const [year, month, day] = value.split("-").map(Number);
  const labels = language === "en"
    ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    : ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return `${day} ${labels[month - 1]} ${year}`;
}

export function formatTripDates(trip, language = "tr") {
  if (!trip) return "";
  const first = formatDate(trip.startDate, language);
  const last = formatDate(trip.endDate, language);
  if (!first) return last;
  if (!last || trip.endDate === trip.startDate) return first;
  if (String(trip.startDate).slice(0, 7) === String(trip.endDate).slice(0, 7)) {
    const firstDay = Number(String(trip.startDate).slice(8, 10));
    return `${firstDay}–${last}`;
  }
  return `${first} – ${last}`;
}

export function PageHeader({ eyebrow, title, subtitle, icon, onAction }) {
  const { colors: c } = useTheme();
  return (
    <View style={styles.header}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[TYPE.micro, { color: c.primary, marginBottom: 4 }]}>{eyebrow}</Text>
        <Text style={[TYPE.heading, { color: c.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[TYPE.caption, { color: c.textSecondary, marginTop: 4 }]} numberOfLines={2}>{subtitle}</Text>
      </View>
      {icon ? <Pressable onPress={onAction} accessibilityRole="button" disabled={!onAction}
        style={[styles.headerAction, { backgroundColor: c.primaryLight }]}
      ><Ionicons name={icon} size={22} color={c.primary} /></Pressable> : null}
    </View>
  );
}

export function ActionButton({ label, icon, secondary, onPress, style }) {
  const { colors: c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button"
      style={({ pressed }) => [{ backgroundColor: secondary ? c.primaryLight : c.button, borderRadius: 16,
        height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 9,
        opacity: pressed ? 0.82 : 1 }, style]}>
      {icon ? <Ionicons name={icon} size={19} color={secondary ? c.primary : "#fff"} style={{ marginRight: 6 }} /> : null}
      <Text style={[TYPE.label, { color: secondary ? c.primary : "#fff" }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

export function RoundedCard({ children, style }) {
  const { colors: c } = useTheme();
  return <View style={[{ borderRadius: 24, backgroundColor: c.surface, overflow: "hidden" }, style]}>{children}</View>;
}

export function ProgressTrack({ percentage = 0 }) {
  const { colors: c } = useTheme();
  const value = Math.min(100, Math.max(0, Number(percentage) || 0));
  return (
    <View style={{ height: 6, borderRadius: 12, backgroundColor: c.surfaceAlt, overflow: "hidden" }}>
      <View style={{ width: `${value}%`, height: 6, borderRadius: 12, backgroundColor: c.primary }} />
    </View>
  );
}

function coverForTrip(trip) {
  const destination = String(trip?.destination || "").toLocaleLowerCase("tr-TR");
  if (/kapadokya|cappadocia|göreme/.test(destination)) return SCENERY.cappadocia;
  if (/roma|rome/.test(destination)) return SCENERY.rome;
  return null;
}

// The bundled scenery files are replaced with the ORIGINAL Figma images by the installer.
// User destinations without a matching supplied cover keep the simple theme treatment.
export function TripCover({ trip, height = 158 }) {
  const { colors: c } = useTheme();
  const userPhoto = trip?.imageUri || trip?.photoUri || trip?.coverUri || trip?.image;
  const cover = (typeof userPhoto === "string" && /^(https?:|file:|content:)/i.test(userPhoto))
    ? { uri: userPhoto } : coverForTrip(trip);
  if (cover) return <Image source={cover} style={{ height, width: "100%" }} resizeMode="cover" />;
  const type = trip?.tripType;
  const icon = type === "BEACH" ? "sunny-outline" : type === "WINTER" ? "snow-outline" :
    type === "CAMPING" ? "leaf-outline" : type === "BUSINESS" ? "briefcase-outline" : "airplane-outline";
  return (
    <View style={{ height, backgroundColor: c.surfaceAlt, justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <View style={{ position: "absolute", width: 240, height: 240, borderRadius: 120, left: -95, top: -125, backgroundColor: c.primaryLight }} />
      <View style={{ position: "absolute", width: 160, height: 160, borderRadius: 80, right: -55, bottom: -75, backgroundColor: c.primaryLight }} />
      <Ionicons name={icon} size={44} color={c.primary} />
    </View>
  );
}

export function TripHeroCard({ trip, onPress, compact = false }) {
  const { colors: c, language } = useTheme();
  if (!trip) return null;
  return (
    <Pressable onPress={onPress} accessibilityRole="button"
      style={[{ backgroundColor: c.surface, borderRadius: 24, overflow: "hidden" }, compact && { minHeight: 120, flexDirection: "row" }]}>
      {compact ? <View style={{ width: 110 }}><TripCover trip={trip} height={120} /></View> : <TripCover trip={trip} height={158} />}
      <View style={{ padding: 16, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          {compact ? <Text style={[TYPE.micro, { color: c.textSecondary, marginBottom: 7 }]}>{language === "en" ? "NEXT DESTINATION" : "SONRAKİ ROTA"}</Text> : null}
          <Text style={[TYPE.title, { color: c.text }]} numberOfLines={1}>{trip.destination || "Seyahat"}</Text>
          <Text style={[TYPE.caption, { color: c.textSecondary, marginTop: 4 }]} numberOfLines={1}>
            {formatTripDates(trip, language)}
          </Text>
        </View>
        {!compact && <Ionicons name="arrow-forward-outline" size={22} color={c.primary} />}
      </View>
    </Pressable>
  );
}

export function PackingProgressCard({ trip, onPress, short = false }) {
  const { colors: c, language } = useTheme();
  const items = trip?.items || [];
  const { packedCount, totalCount, percentage } = getPackingProgress(items);
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ borderRadius: 24, backgroundColor: c.surface, padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={[TYPE.label, { color: c.text }]}>{short ? "Valiz hazırlığı" : language === "en" ? "Packing in progress" : "Valizin hazırlanıyor"}</Text>
          <Text style={[TYPE.caption, { color: c.textSecondary }]}>{packedCount} / {totalCount} {language === "en" ? "items ready" : "eşya hazır"}</Text>
        </View>
        <Text style={[TYPE.subtitle, { color: c.primary }]}>%{percentage}</Text>
      </View>
      <ProgressTrack percentage={percentage} />
    </Pressable>
  );
}

export function IconTile({ icon, style }) {
  const { colors: c } = useTheme();
  return <View style={[{ width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceAlt }, style]}>
    <Ionicons name={icon} size={22} color={c.primary} />
  </View>;
}

const styles = StyleSheet.create({
  header: { minHeight: 76, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 },
  headerAction: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
