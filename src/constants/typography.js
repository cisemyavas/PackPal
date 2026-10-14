
/**
 * PackPal / Refined Typography
 * Figma Design System
 *
 * Font: Plus Jakarta Sans
 */

export const FONTS = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
};

// ==========================================
// FIGMA TYPOGRAPHY STYLES
// ==========================================

export const TYPE = {
  display: {
    fontFamily: FONTS.extrabold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    includeFontPadding: false,
  },

  heading: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    includeFontPadding: false,
  },

  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    includeFontPadding: false,
  },

  subtitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    includeFontPadding: false,
  },

  label: {
    fontFamily: FONTS.semibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    includeFontPadding: false,
  },

  body: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
    includeFontPadding: false,
  },

  caption: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
    includeFontPadding: false,
  },

  micro: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0,
    includeFontPadding: false,
  },
};

export default TYPE;
