import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const BACKGROUNDS = {
  dark: require('../../assets/figma_glass/background-dark.png'),
  light: require('../../assets/figma_glass/background-light.png'),
};

// Keep the backdrop inside EACH existing screen. Never cover React Navigation
// or move screen content beneath a new fullscreen overlay (the V4 regression).
export function GlassPage({ children, style }) {
  const { resolvedMode } = useTheme();
  const source = BACKGROUNDS[resolvedMode === 'dark' ? 'dark' : 'light'];
  return (
    <View style={[styles.page, style]}>
      <Image pointerEvents="none" source={source} resizeMode="stretch"
        style={styles.background} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

// Legacy entry point retained for compatibility with existing feature screens.
export function GlassBackground() { return null; }

// Stable native glass simulation on both Android Expo Go and iPhone Expo Go.
// Alpha lives ONLY in the fill color, not the parent opacity. This prevents
// rectangular compositing artifacts on Android without affecting children.
export function GlassSurface({ children, style, radius = 24, navigation = false }) {
  const { resolvedMode } = useTheme();
  const dark = resolvedMode === 'dark';
  return (
    <View style={[styles.glass, {
      borderRadius: radius,
      borderColor: dark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.79)',
      backgroundColor: dark
        ? (navigation ? 'rgba(199,214,255,0.13)' : 'rgba(199,214,255,0.115)')
        : (navigation ? 'rgba(255,255,255,0.59)' : 'rgba(255,255,255,0.43)'),
    }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, position: 'relative' },
  background: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  content: { flex: 1 },
  glass: { borderWidth: 1.2, elevation: 0, shadowOpacity: 0 },
});
