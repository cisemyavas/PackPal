import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { GlassSurface } from '../components/GlassUI';

const ICONS = {
  Plan: ['calendar-outline', 'calendar'],
  Packing: ['bag-handle-outline', 'bag-handle'],
  Home: ['home-outline', 'home-outline'],
  Discover: ['compass-outline', 'compass'],
  Profile: ['person-outline', 'person'],
};

function GlassTab({ route, active, label, navigation, onPress }) {
  const { colors, resolvedMode } = useTheme();
  const animated = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(animated, { toValue: active ? 1 : 0, duration: 220,
      easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [active, animated]);
  const tint = colors.primary;
  const iconName = ICONS[route.name] || ['ellipse-outline', 'ellipse'];
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      testID={`packpal-tab-${route.name}`}
      onPress={onPress}
      onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
      style={styles.tab}
      android_ripple={{ color: "transparent", borderless: false, radius: 0 }}
    >
      <Animated.Image pointerEvents="none"
        source={require('../../assets/figma_glass/tab-dot-halo.png')}
        resizeMode="contain"
        style={[styles.dotHalo, { tintColor: tint,
          opacity: animated.interpolate({ inputRange: [0, 1], outputRange: [0, resolvedMode === 'dark' ? .60 : .50] }),
          transform: [{ scale: animated.interpolate({ inputRange: [0, 1], outputRange: [.65, 1] }) }],
        }]}
      />
      <Animated.View pointerEvents="none" style={[styles.dot, {
        backgroundColor: tint,
        opacity: animated,
        transform: [{ translateY: animated.interpolate({ inputRange: [0, 1], outputRange: [-3, 0] }) }],
      }]} />
      <Animated.View style={{ transform: [{ scale: animated.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }}>
        <Ionicons name={iconName[0]} size={21} color={active ? tint : colors.textSecondary} />
      </Animated.View>
      <Text numberOfLines={1} style={[styles.label, { color: active ? tint : colors.textSecondary, fontFamily: active ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function GlassTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { a.remove(); b.remove(); };
  }, []);
  if (keyboardVisible) return null;
  return (
    <View pointerEvents="box-none" style={[styles.position, { bottom: Math.max(16, insets.bottom + 8) }]}>
      <GlassSurface navigation intensity={45} radius={24} style={styles.bar}>
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options || {};
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const active = index === state.index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!event.defaultPrevented && route.name === 'Plan') navigation.navigate('Plan', { screen: 'Trips' });
            else if (!active && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return <GlassTab key={route.key} route={route} active={active} label={String(label)} navigation={navigation} onPress={onPress} />;
        })}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  position: { position: 'absolute', left: 20, right: 20, zIndex: 50 },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, overflow: 'hidden' },
  tab: { flex: 1, height: 48, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4, gap: 2 },
  label: { fontSize: 9, lineHeight: 14, includeFontPadding: false, textAlign: 'center' },
  dotHalo: { position: 'absolute', top: -12, width: 21, height: 21 },
  dot: { position: 'absolute', top: -6, width: 6, height: 6, borderRadius: 3, elevation: 0 },
});
