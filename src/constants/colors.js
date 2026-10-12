export const PALETTES = [
  { id: "forest", label: "Forest", swatch: "#2F6B4F" },
  { id: "coral", label: "Coral", swatch: "#F06B63" },
  { id: "ocean", label: "Ocean", swatch: "#2186B5" },
  { id: "lime", label: "Lime", swatch: "#B3C92E" },
];

const ACCENTS = {
  forest: { primary: "#2F6B4F", primaryDark: "#214C38", light: "#E4EFE8", dark: "#8BC5A4" },
  coral: { primary: "#E85F62", primaryDark: "#BF414B", light: "#FCE9E6", dark: "#FF9B92" },
  ocean: { primary: "#2186B5", primaryDark: "#176389", light: "#E3F2F8", dark: "#7FC7E5" },
  lime: { primary: "#8DA51E", primaryDark: "#647515", light: "#F0F4D9", dark: "#C3D855" },
};

export function getColors(mode = "light", palette = "forest") {
  const accent = ACCENTS[palette] || ACCENTS.forest;
  const dark = mode === "dark";

  return {
    primary: dark ? accent.dark : accent.primary,
    primaryDark: accent.primaryDark,
    primaryLight: dark ? "#29352E" : accent.light,
    background: dark ? "#101613" : "#F5F3EB",
    surface: dark ? "#1B241F" : "#FFFEF9",
    surfaceAlt: dark ? "#232E28" : "#ECEADF",
    text: dark ? "#F4F5EF" : "#1D2821",
    textSecondary: dark ? "#B4C0B8" : "#68756C",
    textMuted: dark ? "#84928A" : "#98A198",
    border: dark ? "#344139" : "#E2E1D7",
    success: dark ? "#72C99B" : "#2F8A59",
    successLight: dark ? "#263B30" : "#E1F2E7",
    warning: dark ? "#F0B969" : "#C47A2A",
    warningLight: dark ? "#3C3223" : "#FBF0DC",
    danger: dark ? "#FF8A82" : "#D74B4B",
    dangerLight: dark ? "#402A29" : "#FBE5E2",
    info: dark ? "#7EC8E8" : "#3185A8",
    infoLight: dark ? "#21353D" : "#E3F2F7",
    packed: dark ? "#72C99B" : "#2F8A59",
    missing: dark ? "#F0B969" : "#C47A2A",
  };
}

// Default palette for code that needs a non-hook fallback.
export const COLORS = getColors("light", "forest");
