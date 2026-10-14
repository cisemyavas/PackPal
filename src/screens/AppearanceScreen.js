
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/firestoreService";
import { PALETTES } from "../constants/colors";

const FONT = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
};

const SWATCHES = {
  purple: { light: "#7145DE", dark: "#AA8AFF" },
  blue: { light: "#225FCB", dark: "#82B2FF" },
  pink: { light: "#B82672", dark: "#F59CCD" },
  orange: { light: "#A54712", dark: "#FFB185" },
  yellow: { light: "#87610B", dark: "#F0D16B" },
  green: { light: "#14764F", dark: "#72D7AA" },
  cyan: { light: "#086D80", dark: "#70D3E2" },
};

const MODES = [
  { id: "light", tr: "Açık", en: "Light" },
  { id: "dark", tr: "Koyu", en: "Dark" },
  { id: "system", tr: "Sistem", en: "System" },
];

export default function AppearanceScreen({ navigation }) {
  const {
    mode,
    resolvedMode,
    palette,
    colors,
    language,
    applyPreferences,
  } = useTheme();

  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [saving, setSaving] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const isDark = resolvedMode === "dark";
  const isEnglish = language === "en";
  const tileWidth = Math.max(70, (width - 64) / 3);

  async function changePreferences(changes) {
    if (saving) return;

    const previous = {
      theme: mode,
      colorTheme: palette,
      language,
    };

    applyPreferences(changes);
    setSaving(true);

    try {
      if (user?.uid) {
        await updateUserProfile(user.uid, changes);
      }
    } catch (error) {
      applyPreferences(previous);

      Alert.alert(
        "Kaydedilemedi",
        error?.message || "Tercihler kaydedilemedi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            accessibilityRole="button"
            onPress={() => {
              if (navigation?.canGoBack?.()) {
                navigation.goBack();
              }
            }}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.text}
            />
            <Text style={styles.backText}>
              {isEnglish ? "Profile" : "Profilim"}
            </Text>
          </Pressable>

          <Text style={styles.title}>
            {isEnglish ? "Appearance" : "Görünüm"}
          </Text>

          <Text style={styles.description}>
            {isEnglish
              ? "Make PackPal reflect your style."
              : "PackPal senin tarzını yansıtsın."}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          {isEnglish ? "Display mode" : "Görünüm modu"}
        </Text>

        <View style={styles.modeSelector}>
          {MODES.map((item) => {
            const selected = mode === item.id;

            return (
              <Pressable
                key={item.id}
                disabled={saving}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() =>
                  changePreferences({ theme: item.id })
                }
                style={[
                  styles.modeButton,
                  selected && {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeText,
                    selected && { color: colors.primary },
                  ]}
                >
                  {isEnglish ? item.en : item.tr}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.accentHeader}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? "Accent color" : "Vurgu rengi"}
          </Text>

          <Text style={styles.caption}>
            {isEnglish
              ? "Choose a color for light and dark mode."
              : "Rengini seç; açık ve koyu modda kullan."}
          </Text>
        </View>

        <View style={styles.paletteGrid}>
          {[0, 3, 6].map((start) => (
            <View key={start} style={styles.paletteRow}>
              {PALETTES.slice(start, start + 3).map((item) => {
                const selected = palette === item.id;

                const swatch =
                  SWATCHES[item.id]?.[
                    isDark ? "dark" : "light"
                  ] || item.swatch;

                return (
                  <Pressable
                    key={item.id}
                    disabled={saving}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() =>
                      changePreferences({
                        colorTheme: item.id,
                      })
                    }
                    style={[
                      styles.paletteCard,
                      { width: tileWidth },
                      selected && {
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: swatch },
                      ]}
                    />

                    <Text style={styles.paletteLabel}>
                      {item.label}
                      {selected ? " ✓" : ""}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>
              {isEnglish
                ? "Packing in progress"
                : "Valizin hazırlanıyor"}
            </Text>

            <Text style={styles.previewPercent}>
              %67
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.previewCaption}>
            {isEnglish
              ? "Your chosen color applies across the app."
              : "Seçtiğin renk uygulamanın tamamına yansır."}
          </Text>
        </View>

        {saving && (
          <ActivityIndicator
            style={{ marginTop: 12 }}
            color={colors.primary}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 120,
    },
    header: {
      gap: 8,
      marginBottom: 16,
    },
    backButton: {
      height: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    backText: {
      color: c.text,
      fontFamily: FONT.semibold,
      fontSize: 14,
      lineHeight: 20,
    },
    title: {
      color: c.text,
      fontFamily: FONT.bold,
      fontSize: 28,
      lineHeight: 36,
    },
    description: {
      color: c.textSecondary,
      fontFamily: FONT.regular,
      fontSize: 14,
      lineHeight: 22,
    },
    sectionTitle: {
      color: c.text,
      fontFamily: FONT.bold,
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      color: c.textSecondary,
      fontFamily: FONT.medium,
      fontSize: 12,
      lineHeight: 18,
    },
    modeSelector: {
      flexDirection: "row",
      height: 48,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 4,
      gap: 4,
      marginTop: 16,
      marginBottom: 16,
    },
    modeButton: {
      flex: 1,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    },
    modeText: {
      color: c.textSecondary,
      fontFamily: FONT.semibold,
      fontSize: 14,
      lineHeight: 20,
    },
    accentHeader: {
      gap: 4,
      marginBottom: 16,
    },
    paletteGrid: {
      gap: 12,
      marginBottom: 16,
    },
    paletteRow: {
      flexDirection: "row",
      gap: 12,
      height: 74,
    },
    paletteCard: {
      height: 74,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: "transparent",
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    colorCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
    },
    paletteLabel: {
      color: c.text,
      fontFamily: FONT.medium,
      fontSize: 12,
      lineHeight: 18,
    },
    previewCard: {
      height: 98,
      backgroundColor: c.surface,
      borderRadius: 24,
      padding: 20,
      gap: 12,
    },
    previewHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      height: 20,
    },
    previewTitle: {
      color: c.text,
      fontFamily: FONT.semibold,
      fontSize: 14,
      lineHeight: 20,
    },
    previewPercent: {
      color: c.primary,
      fontFamily: FONT.semibold,
      fontSize: 14,
      lineHeight: 20,
    },
    progressTrack: {
      height: 6,
      borderRadius: 12,
      backgroundColor: c.surfaceAlt,
      overflow: "hidden",
    },
    progressFill: {
      width: "67%",
      height: 6,
      borderRadius: 12,
      backgroundColor: c.primary,
    },
    previewCaption: {
      color: c.textSecondary,
      fontFamily: FONT.medium,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
