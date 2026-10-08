import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getUserProfile, updateUserProfile } from "../services/firestoreService";
import { updateAccountName } from "../services/authService";
import { COLORS } from "../constants/colors";

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getUserProfile(user.uid)
      .then((profile) => {
        if (!active) return;
        setName(profile?.name || user.displayName || "");
        setTheme(profile?.theme || "light");
        setLanguage(profile?.language || "en");
      })
      .catch((error) => Alert.alert("Profile error", error.message))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user.uid]);

  async function saveProfile() {
    if (!name.trim()) {
      Alert.alert("Name required", "Enter your name before saving.");
      return;
    }
    setSaving(true);
    try {
      if (name.trim() !== (user.displayName || "")) {
        await updateAccountName(user, name);
        setUser({ ...user, displayName: name.trim() });
      }
      await updateUserProfile(user.uid, { name: name.trim(), theme, language });
      Alert.alert("Saved", "Your profile and preferences were saved.");
    } catch (error) {
      Alert.alert("Could not save", error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.avatar}><Ionicons name="person" size={34} color={COLORS.primary} /></View>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.sub}>Your PackPal account and preferences</Text>
        </View>

        <Text style={styles.label}>ACCOUNT</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={COLORS.textMuted} />
          <Text style={[styles.fieldLabel, styles.emailLabel]}>Email</Text>
          <View style={styles.readonly}><Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} /><Text style={styles.email}>{user.email}</Text></View>
        </View>

        <Text style={styles.label}>PREFERENCES</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Theme</Text>
          <View style={styles.options}>
            <Choice label="Light" icon="sunny-outline" selected={theme === "light"} onPress={() => setTheme("light")} />
            <Choice label="Dark" icon="moon-outline" selected={theme === "dark"} onPress={() => setTheme("dark")} />
          </View>
          <Text style={[styles.fieldLabel, styles.languageLabel]}>Language</Text>
          <View style={styles.options}>
            <Choice label="English" icon="globe-outline" selected={language === "en"} onPress={() => setLanguage("en")} />
            <Choice label="Türkçe" icon="globe-outline" selected={language === "tr"} onPress={() => setLanguage("tr")} />
          </View>
          <Text style={styles.hint}>Your choices are saved to your PackPal profile.</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.save, pressed && styles.pressed]} onPress={saveProfile} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save profile</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Choice({ label, icon, selected, onPress }) {
  return <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Ionicons name={icon} size={17} color={selected ? COLORS.primary : COLORS.textSecondary} /><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>{selected && <Ionicons name="checkmark-circle" size={17} color={COLORS.primary} />}</Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background }, loader: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 36 }, hero: { alignItems: "center", paddingVertical: 12, marginBottom: 20 },
  avatar: { width: 74, height: 74, borderRadius: 25, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primaryLight, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text }, sub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  label: { marginLeft: 3, marginBottom: 8, fontSize: 11, letterSpacing: 1, fontWeight: "800", color: COLORS.textMuted },
  card: { padding: 16, borderRadius: 18, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 8 }, input: { height: 48, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 13, color: COLORS.text },
  emailLabel: { marginTop: 16 }, readonly: { flexDirection: "row", alignItems: "center", gap: 9, minHeight: 38 }, email: { color: COLORS.textSecondary, fontSize: 14 },
  options: { flexDirection: "row", gap: 9 }, choice: { flex: 1, minHeight: 44, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  choiceSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight }, choiceText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "600" }, choiceTextSelected: { color: COLORS.primary }, languageLabel: { marginTop: 17 }, hint: { color: COLORS.textMuted, fontSize: 12, marginTop: 11 },
  save: { height: 52, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" }, saveText: { color: "#fff", fontWeight: "800", fontSize: 15 }, pressed: { opacity: 0.85 },
});
