
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useColorScheme } from "react-native";

import { useAuth } from "./AuthContext";

import { getUserProfile } from "../services/firestoreService";

import { getColors, PALETTES } from "../constants/colors";

// ==========================================
// THEME CONTEXT
// ==========================================

const ThemeContext = createContext(null);

// Figma görünüm modları
const VALID_MODES = ["light", "dark", "system"];

// Figma renk paletleri
const VALID_PALETTES = PALETTES.map((item) => item.id);

// Eski kayıtlı renkleri yeni renklerle eşleştir
const LEGACY_PALETTES = {
  forest: "green",
  coral: "pink",
  ocean: "blue",
  lime: "yellow",
};

// Varsayılan PackPal görünümü
const DEFAULT_MODE = "dark";
const DEFAULT_PALETTE = "purple";
const DEFAULT_LANGUAGE = "tr";

// ==========================================
// HELPERS
// ==========================================

function normalizeMode(value) {
  return VALID_MODES.includes(value)
    ? value
    : DEFAULT_MODE;
}

function normalizePalette(value) {
  const normalized = LEGACY_PALETTES[value] || value;

  return VALID_PALETTES.includes(normalized)
    ? normalized
    : DEFAULT_PALETTE;
}

function normalizeLanguage(value) {
  return value === "en" ? "en" : "tr";
}

// ==========================================
// THEME PROVIDER
// ==========================================

export function ThemeProvider({ children }) {
  const { user } = useAuth();

  // Telefonun sistem görünümünü takip et
  const systemColorScheme = useColorScheme();

  const [mode, setMode] = useState(DEFAULT_MODE);

  const [palette, setPalette] = useState(
    DEFAULT_PALETTE
  );

  const [language, setLanguage] = useState(
    DEFAULT_LANGUAGE
  );

  const [loading, setLoading] = useState(
    Boolean(user?.uid)
  );

  // ==========================================
  // FIREBASE PROFIL AYARLARINI OKU
  // ==========================================

  useEffect(() => {
    let active = true;

    async function loadPreferences() {
      if (!user?.uid) {
        setMode(DEFAULT_MODE);
        setPalette(DEFAULT_PALETTE);
        setLanguage(DEFAULT_LANGUAGE);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const profile = await getUserProfile(user.uid);

        if (!active) return;

        setMode(normalizeMode(profile?.theme));

        setPalette(
          normalizePalette(profile?.colorTheme)
        );

        setLanguage(
          normalizeLanguage(profile?.language)
        );
      } catch (error) {
        if (!active) return;

        console.warn(
          "Tema tercihleri yüklenemedi:",
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPreferences();

    return () => {
      active = false;
    };
  }, [user?.uid]);

  // ==========================================
  // TEMA MODU
  // ==========================================

  // Kullanıcı "system" seçtiğinde telefonun
  // açık/koyu görünümünü kullan.
  const resolvedMode =
    mode === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : mode;

  // ==========================================
  // TEMA VE RENK DEĞİŞTİRME
  // ==========================================

  const applyPreferences = useCallback(
    (preferences = {}) => {
      const {
        theme: nextMode,
        colorTheme: nextPalette,
        language: nextLanguage,
      } = preferences;

      if (VALID_MODES.includes(nextMode)) {
        setMode(nextMode);
      }

      if (nextPalette !== undefined) {
        setPalette(
          normalizePalette(nextPalette)
        );
      }

      if (
        nextLanguage === "tr" ||
        nextLanguage === "en"
      ) {
        setLanguage(nextLanguage);
      }
    },
    []
  );

  // ==========================================
  // AKTIF RENKLER
  // ==========================================

  const colors = useMemo(() => {
    return getColors(resolvedMode, palette);
  }, [resolvedMode, palette]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = useMemo(
    () => ({
      // Kullanıcının seçtiği mod
      mode,

      // Gerçekte kullanılan light/dark modu
      resolvedMode,

      // Seçilen vurgu rengi
      palette,

      // Aktif uygulama renkleri
      colors,

      // Dil tercihi
      language,

      // Firebase yükleme durumu
      loading,

      // Tercihleri anlık değiştir
      applyPreferences,
    }),
    [
      mode,
      resolvedMode,
      palette,
      colors,
      language,
      loading,
      applyPreferences,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
