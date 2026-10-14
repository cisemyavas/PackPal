import React, { useState } from "react";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { loginWithEmail, registerWithEmail } from "../services/authService";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";
import { TYPE } from "../constants/typography";

function CredentialField({ label, c, ...inputProps }) {
  return (
    <View style={{ minHeight: 78, borderRadius: 24, backgroundColor: c.surface, paddingHorizontal: 20, paddingTop: 15, paddingBottom: 12, justifyContent: "center" }}>
      <Text style={[TYPE.caption, { color: c.textSecondary, marginBottom: 6 }]}>{label}</Text>
      <TextInput
        placeholderTextColor={c.textSecondary}
        style={[TYPE.body, { color: c.text, minHeight: 25, padding: 0 }]}
        {...inputProps}
      />
    </View>
  );
}

export default function LoginScreen() {
  const { colors: c, language } = useTheme();
  const { isFirebaseConfigured: configured } = useAuth();
  const tr = language !== "en";
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password || (isRegistering && !name.trim())) {
      Alert.alert(tr ? "Eksik bilgi" : "Missing information", tr ? "Lütfen gerekli alanların tümünü doldur." : "Please complete all required fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert(tr ? "Şifre çok kısa" : "Password too short", tr ? "Şifre en az 6 karakter olmalı." : "Use at least 6 characters.");
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
      Alert.alert(tr ? "İşlem başarısız" : "Unable to continue", messages[error.code] || error.message || "Tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      Alert.alert(tr ? "E-posta gerekli" : "Email required", tr ? "Önce e-posta adresini gir." : "Enter your email address first.");
      return;
    }
    try {
      if (!auth) throw new Error("Firebase ayarları eksik.");
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(tr ? "E-posta gönderildi" : "Email sent", tr ? "Şifre sıfırlama bağlantısı için gelen kutunu kontrol et." : "Check your inbox for the reset link.");
    } catch (error) {
      Alert.alert(tr ? "Gönderilemedi" : "Unable to send", error.message || "Lütfen tekrar deneyin.");
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 34, flexGrow: 1 }}>
          <View style={{ minHeight: 240, padding: 24, borderRadius: 24, backgroundColor: c.primaryLight, justifyContent: "flex-start" }}>
            <View style={{ width: 68, height: 68, borderRadius: 22, backgroundColor: c.button, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Text style={[TYPE.heading, { color: "#fff" }]}>PP</Text>
            </View>
            <Text style={[TYPE.heading, { color: c.text, lineHeight: 36 }]}>{tr ? "Hafif hazırlan.\nDolu dolu yaşa." : "Pack lightly.\nLive fully."}</Text>
            <Text style={[TYPE.caption, { color: c.textSecondary, marginTop: 12 }]}>
              {tr ? "Yolculuğunun her adımında yanında." : "With you at every step of your journey."}
            </Text>
          </View>
          <Text style={[TYPE.title, { color: c.text, marginTop: 16, marginBottom: 12 }]}>
            {isRegistering ? (tr ? "Hesabını oluştur" : "Create your account") : (tr ? "Tekrar hoş geldin" : "Welcome back")}
          </Text>
          <Text style={[TYPE.body, { color: c.textSecondary, marginBottom: 16 }]}>
            {isRegistering ? (tr ? "Yolculuklarını güvenle kaydet." : "Save your travels securely.") : (tr ? "Bir sonraki macerana giriş yap." : "Sign in for your next adventure.")}
          </Text>
          {!configured ? <Text style={[TYPE.caption, { color: c.danger, marginBottom: 14 }]}>Firebase kurulumu tamamlanmamış. src/config/firebase.js dosyasını kontrol et.</Text> : null}
          <View style={{ gap: 16 }}>
            {isRegistering ? <CredentialField label={tr ? "Ad soyad" : "Name"} c={c} value={name} onChangeText={setName} placeholder={tr ? "Adın" : "Your name"} autoCapitalize="words" /> : null}
            <CredentialField label={tr ? "E-posta" : "Email"} c={c} value={email} onChangeText={setEmail} placeholder="ornek@eposta.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <CredentialField label={tr ? "Şifre" : "Password"} c={c} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoComplete={isRegistering ? "new-password" : "current-password"} />
          </View>
          {!isRegistering ? (
            <Pressable onPress={handleResetPassword} accessibilityRole="button" style={{ alignSelf: "flex-start", paddingVertical: 16 }}>
              <Text style={[TYPE.caption, { color: c.primary }]}>{tr ? "Şifremi unuttum" : "Forgot password"}</Text>
            </Pressable>
          ) : <View style={{ height: 16 }} />}
          <Pressable accessibilityRole="button" disabled={busy} onPress={handleSubmit}
            style={({ pressed }) => ({ height: 52, borderRadius: 16, backgroundColor: c.button, alignItems: "center", justifyContent: "center", opacity: pressed || busy ? 0.72 : 1 })}>
            {busy ? <ActivityIndicator color="#fff" /> : (
              <Text style={[TYPE.label, { color: "#fff" }]}>{isRegistering ? (tr ? "Kayıt ol" : "Create account") : (tr ? "Giriş yap" : "Sign in")}</Text>
            )}
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setIsRegistering(v => !v)} style={{ alignSelf: "flex-start", paddingVertical: 17 }}>
            <Text style={[TYPE.label, { color: c.primary }]}>
              {isRegistering ? (tr ? "Zaten hesabın var mı? Giriş yap" : "Already have an account? Sign in") : (tr ? "Hesabın yok mu? Kayıt ol" : "Need an account? Register")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
