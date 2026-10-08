import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { isFirebaseConfigured } from "../config/firebase";
import { loginWithEmail, registerWithEmail } from "../services/authService";
import { COLORS } from "../constants/colors";

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { isFirebaseConfigured: configured } = useAuth();

  async function handleSubmit() {
    if (!email.trim() || !password || (isRegistering && !name.trim())) {
      Alert.alert("Eksik bilgi", "Lütfen gerekli alanların tümünü doldur.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Şifre çok kısa", "Şifre en az 6 karakter olmalı.");
      return;
    }

    setBusy(true);
    try {
      if (isRegistering) await registerWithEmail({ name, email, password });
      else await loginWithEmail(email, password);
    } catch (error) {
      const messages = {
        "auth/email-already-in-use": "Bu e-posta ile zaten bir hesap var.",
        "auth/invalid-credential": "E-posta veya şifre hatalı.",
        "auth/invalid-email": "Geçerli bir e-posta adresi gir.",
        "auth/weak-password": "Daha güçlü bir şifre seç.",
        "auth/network-request-failed": "Bağlantını kontrol edip tekrar dene.",
      };
      Alert.alert("İşlem başarısız", messages[error.code] || error.message || "Tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}><Ionicons name="airplane" size={28} color="#fff" /></View>
          <Text style={styles.brand}>PackPal</Text>
          <Text style={styles.tagline}>Plan your trip. Pack with confidence.</Text>

          {!configured && (
            <View style={styles.notice}>
              <Ionicons name="information-circle-outline" size={21} color="#9A6700" />
              <Text style={styles.noticeText}>Firebase bağlantısı için önce src/config/firebase.js dosyasına Firebase proje bilgilerini ekle.</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.title}>{isRegistering ? "Create your account" : "Welcome back"}</Text>
            <Text style={styles.subtitle}>{isRegistering ? "Save your trips securely in your account." : "Sign in to see your saved trips."}</Text>

            {isRegistering && <Field icon="person-outline" placeholder="Name" value={name} onChangeText={setName} autoCapitalize="words" />}
            <Field icon="mail-outline" placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Field icon="lock-closed-outline" placeholder="Password (at least 6 characters)" value={password} onChangeText={setPassword} secureTextEntry />

            <Pressable style={({ pressed }) => [styles.submit, pressed && styles.pressed, busy && styles.disabled]} onPress={handleSubmit} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{isRegistering ? "Create account" : "Sign in"}</Text>}
            </Pressable>

            <Pressable style={styles.switch} onPress={() => setIsRegistering((value) => !value)}>
              <Text style={styles.switchText}>{isRegistering ? "Already have an account? " : "New to PackPal? "}<Text style={styles.switchAction}>{isRegistering ? "Sign in" : "Create account"}</Text></Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ icon, ...props }) {
  return <View style={styles.inputWrap}><Ionicons name={icon} size={19} color={COLORS.textMuted} /><TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} {...props} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background }, flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: 22, paddingBottom: 36 },
  logo: { alignSelf: "center", width: 58, height: 58, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  brand: { marginTop: 12, textAlign: "center", color: COLORS.text, fontSize: 29, fontWeight: "800" },
  tagline: { textAlign: "center", color: COLORS.textSecondary, marginTop: 5, marginBottom: 24 },
  notice: { flexDirection: "row", gap: 9, padding: 12, borderRadius: 12, backgroundColor: "#FFF7D6", marginBottom: 15, alignItems: "center" },
  noticeText: { flex: 1, color: "#6F5200", fontSize: 12, lineHeight: 17 },
  card: { backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, padding: 21 },
  title: { color: COLORS.text, fontSize: 23, fontWeight: "800" }, subtitle: { marginTop: 6, marginBottom: 20, color: COLORS.textSecondary, lineHeight: 19 },
  inputWrap: { height: 52, borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  input: { flex: 1, color: COLORS.text, fontSize: 15 }, submit: { height: 52, borderRadius: 13, marginTop: 5, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" }, pressed: { opacity: 0.85 }, disabled: { opacity: 0.65 },
  switch: { paddingTop: 18, alignItems: "center" }, switchText: { color: COLORS.textSecondary }, switchAction: { color: COLORS.primary, fontWeight: "700" },
});
