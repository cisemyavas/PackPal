import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import useTrips from "../hooks/useTrips";
import { logout } from "../services/authService";
import { TYPE } from "../constants/typography";

function SettingsRow({ icon, title, detail, onPress, last = false, danger = false }) {
  const { colors: c } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ height: 59, flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}>
      <View style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: c.primaryLight, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name={icon} size={21} color={danger ? c.danger : c.primary} />
      </View>
      <View style={{ flex: 1, height: 59, marginLeft: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: last ? 0 : 1, borderBottomColor: c.border }}>
        <Text numberOfLines={1} style={[TYPE.label, { flex: 1, color: danger ? c.danger : c.text }]}>{title}</Text>
        {detail ? <Text style={[TYPE.caption, { color: c.textSecondary, marginRight: 10 }]}>{detail}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
      </View>
    </Pressable>
  );
}

export default function ProfileHomeScreen({ navigation }) {
  const { colors: c, mode, resolvedMode, palette, language } = useTheme();
  const { user } = useAuth();
  const { trips } = useTrips();
  const isEN = language === "en";
  const name = user?.displayName || user?.email?.split("@")[0] || "PackPal";
  const initials = name.split(/\s+/).slice(0, 2).map(s => s[0] || "").join("").toUpperCase();
  const group = (title, children) => <View style={{ marginTop: 12 }}><Text style={[TYPE.caption, { color: c.textSecondary, marginBottom: 12 }]}>{title}</Text><View style={{ backgroundColor: c.surface, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: c.border }}>{children}</View></View>;
  const handleLogout = () => Alert.alert(isEN ? "Sign out?" : "Çıkış yapılsın mı?", isEN ? "You can log in again later." : "Daha sonra tekrar giriş yapabilirsin.", [
    { text: isEN ? "Cancel" : "İptal", style: "cancel" },
    { text: isEN ? "Sign out" : "Çıkış yap", style: "destructive", onPress: () => logout().catch(e => Alert.alert("Hata", e?.message || "Çıkış yapılamadı")) },
  ]);
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 125 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.navigate("EditProfile")} accessibilityRole="button" style={{ height: 92, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderRadius: 24, backgroundColor: c.surface }}>
          <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: c.primaryLight, alignItems: "center", justifyContent: "center" }}><Text style={[TYPE.title, { color: c.primary }]}>{initials}</Text></View>
          <View style={{ flex: 1, marginLeft: 12 }}><Text style={[TYPE.subtitle, { color: c.text }]} numberOfLines={1}>{name}</Text><Text style={[TYPE.caption, { color: c.textSecondary, marginTop: 4 }]}>{isEN ? "Edit profile details" : "Profil bilgilerini düzenle"}</Text></View>
          <Ionicons name="create-outline" size={22} color={c.primary} />
        </Pressable>
        {group(isEN ? "My travels" : "Yolculuklarım", <>
          <SettingsRow icon="airplane-outline" title={isEN ? "My trips" : "Seyahatlerim"} detail={`${trips.length} ${isEN ? "plans" : "plan"}`} onPress={() => navigation.getParent()?.navigate("Plan")} />
          <SettingsRow icon="compass-outline" title={isEN ? "Discovery journal" : "Keşif günlüğüm"} onPress={() => navigation.getParent()?.navigate("Discover", { screen: "journal" })} last />
        </>)}
        {group(isEN ? "Appearance" : "Görünüm", <>
          <SettingsRow icon="moon-outline" title={isEN ? "Display mode" : "Görünüm modu"} detail={mode === "system" ? (isEN ? "System" : "Sistem") : resolvedMode === "dark" ? (isEN ? "Dark" : "Koyu") : (isEN ? "Light" : "Açık")} onPress={() => navigation.navigate("Appearance")} />
          <SettingsRow icon="color-palette-outline" title={isEN ? "Accent color" : "Vurgu rengi"} detail={palette === "purple" ? (isEN ? "Purple" : "Mor") : palette} onPress={() => navigation.navigate("Appearance")} />
          <SettingsRow icon="globe-outline" title={isEN ? "App language" : "Uygulama dili"} detail={isEN ? "English" : "Türkçe"} onPress={() => navigation.navigate("Appearance")} last />
        </>)}
        {group(isEN ? "Account" : "Hesap", <>
          <SettingsRow icon="shield-checkmark-outline" title={isEN ? "Account and permissions" : "Hesap ve izinler"} onPress={() => navigation.navigate("SettingsDetail")} />
          <SettingsRow icon="log-out-outline" title={isEN ? "Sign out" : "Çıkış yap"} danger onPress={handleLogout} last />
        </>)}
      </ScrollView>
    </SafeAreaView>
  );
}
