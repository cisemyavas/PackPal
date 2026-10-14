
export const PALETTES = [
  { id: "purple", label: "Mor", swatch: "#AA8AFF" },
  { id: "blue", label: "Mavi", swatch: "#82B2FF" },
  { id: "pink", label: "Pembe", swatch: "#F59CCD" },
  { id: "orange", label: "Turuncu", swatch: "#FFB185" },
  { id: "yellow", label: "Sarı", swatch: "#F0D16B" },
  { id: "green", label: "Yeşil", swatch: "#72D7AA" },
  { id: "cyan", label: "Turkuaz", swatch: "#70D3E2" },
];

// Figma PackPal / Refined vurgu renkleri
const ACCENTS = {
  purple: {
    primary: "#7145DE",
    dark: "#AA8AFF",
    primaryDark: "#5832B2",
    light: "#EEE7FF",
    darkLight: "#302548",
    button: "#7950F2",
  },

  blue: {
    primary: "#225FCB",
    dark: "#82B2FF",
    primaryDark: "#194A9F",
    light: "#E7EFFF",
    darkLight: "#1D3154",
    button: "#225FCB",
  },

  pink: {
    primary: "#B82672",
    dark: "#F59CCD",
    primaryDark: "#911A58",
    light: "#FCE8F3",
    darkLight: "#49253D",
    button: "#B82672",
  },

  orange: {
    primary: "#A54712",
    dark: "#FFB185",
    primaryDark: "#80350D",
    light: "#FFF0E6",
    darkLight: "#492D25",
    button: "#A54712",
  },

  yellow: {
    primary: "#87610B",
    dark: "#F0D16B",
    primaryDark: "#654907",
    light: "#FFF6D8",
    darkLight: "#43391F",
    button: "#87610B",
  },

  green: {
    primary: "#14764F",
    dark: "#72D7AA",
    primaryDark: "#0E573A",
    light: "#E3F5EC",
    darkLight: "#203D35",
    button: "#14764F",
  },

  cyan: {
    primary: "#086D80",
    dark: "#70D3E2",
    primaryDark: "#064D5C",
    light: "#DDF5F8",
    darkLight: "#203D48",
    button: "#086D80",
  },
};

// Eski kayıtlı renk tercihleri için uyumluluk
const LEGACY_PALETTES = {
  forest: "green",
  coral: "pink",
  ocean: "blue",
  lime: "yellow",
};

// Figma açık tema renkleri
const LIGHT_THEME = {
  background: "#F8F7F4",
  surface: "#FFFFFF",
  surfaceAlt: "#EEEDF4",
  text: "#202130",
  textSecondary: "#646777",
  textMuted: "#858695",
  border: "#E6E4ED",
  white: "#FFFFFF",

  success: "#197953",
  successLight: "#E5F5ED",
  warning: "#8D6012",
  warningLight: "#FBF0DC",

  danger: "#D74B4B",
  dangerLight: "#FBE5E2",
  info: "#3185A8",
  infoLight: "#E3F2F7",
};

// Figma koyu tema renkleri
const DARK_THEME = {
  background: "#0B1020",
  surface: "#171E32",
  surfaceAlt: "#202841",
  text: "#F7F8FF",
  textSecondary: "#B2BBD1",
  textMuted: "#8894B0",
  border: "#2C354D",
  white: "#FFFFFF",

  success: "#78D9AE",
  successLight: "#203E35",
  warning: "#F0C373",
  warningLight: "#3C3223",

  danger: "#FF8A82",
  dangerLight: "#402A29",
  info: "#7EC8E8",
  infoLight: "#21353D",
};

export function getColors(mode = "light", palette = "purple") {
  const dark = mode === "dark";

  // Eski renk isimlerini yeni sistemle eşleştir.
  const paletteId = LEGACY_PALETTES[palette] || palette;

  const accent = ACCENTS[paletteId] || ACCENTS.purple;

  const theme = dark ? DARK_THEME : LIGHT_THEME;

  const primary = dark ? accent.dark : accent.primary;

  return {
    ...theme,

    // Aktif vurgu rengi
    primary,

    primaryDark: accent.primaryDark,

    primaryLight: dark
      ? accent.darkLight
      : accent.light,

    // Buton renkleri
    button: accent.button,
    buttonText: "#FFFFFF",

    // Seçili öğeler
    accent: primary,
    active: primary,
    selected: primary,

    // Valiz durumları
    packed: theme.success,
    missing: theme.warning,

    // Navigasyon ve kartlar
    card: theme.surface,
    tabBar: theme.surface,
    tabBarActive: primary,
    tabBarInactive: theme.textSecondary,

    // Input alanları
    inputBackground: theme.surface,
    placeholder: theme.textSecondary,

    // İlerleme çubuğu
    progressTrack: theme.surfaceAlt,
    progressFill: primary,

    // Görsel yardımcı değerler
    transparent: "transparent",
    overlay: dark
      ? "rgba(0, 0, 0, 0.55)"
      : "rgba(0, 0, 0, 0.25)",
  };
}

// Varsayılan tema: Figma Light + Mor
export const COLORS = getColors("light", "purple");

export default COLORS;
