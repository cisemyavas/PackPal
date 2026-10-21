import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, TYPE } from '../constants/typography';
import { formatTripDates, ProgressTrack, TripCover } from './RefinedUI';
import { GlassSurface } from './GlassUI';
import FilterTabs from './FilterTabs';

const ACTIONS = [
  { id: 'item', icon: 'bag-handle-outline', tr: 'Eşya ekle', en: 'Add item' },
  { id: 'weather', icon: 'sunny-outline', tr: 'Hava', en: 'Weather' },
  { id: 'itinerary', icon: 'calendar-outline', tr: 'Gezi planı', en: 'Itinerary' },
];

// Visual update only: trip editing, weather, itinerary and packing actions keep existing screens.
export default function CompactTripHeader({ trip, packedCount, totalCount, percentage, filter, onFilter, navigation }) {
  const { colors: c, language } = useTheme();
  const tr = language !== 'en';
  const remaining = totalCount - packedCount;
  const open = key => {
    if (key === 'item') navigation.navigate('AddItem', { tripId: trip.id });
    if (key === 'weather') navigation.navigate('Weather', { tripId: trip.id });
    if (key === 'itinerary') navigation.navigate('Itinerary', {
      scope: 'personal', tripId: trip.id, title: trip.destination,
      destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate,
    });
  };
  return (
    <View style={styles.wrapper}>
      <GlassSurface style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.cover}><TripCover trip={trip} height={56} /></View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.destination, { color: c.text }]} numberOfLines={1}>{trip.destination}</Text>
            <Text style={[TYPE.caption, { color: c.textSecondary }]} numberOfLines={1}>{formatTripDates(trip, language)}</Text>
          </View>
        </View>
        <View style={styles.progressMeta}>
          <Text style={[TYPE.caption, { color: c.textSecondary }]}>{tr ? 'Valiz hazırlığı' : 'Packing progress'}</Text>
          <Text style={[TYPE.caption, { color: c.textSecondary }]}>{packedCount}/{totalCount} · %{percentage}</Text>
        </View>
        <ProgressTrack percentage={percentage} />
        <View style={styles.actionRow}>
          {ACTIONS.map(action => (
            <Pressable key={action.id} onPress={() => open(action.id)} accessibilityRole="button"
              style={({ pressed }) => [styles.action, { backgroundColor: c.primaryLight, opacity: pressed ? .75 : 1 }]}>
              <Ionicons name={action.icon} size={17} color={c.primary} />
              <Text numberOfLines={1} style={[styles.actionText, { color: c.primary }]}>{tr ? action.tr : action.en}</Text>
            </Pressable>
          ))}
        </View>
      </GlassSurface>
      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{tr ? 'Valiz listesi' : 'Packing list'}</Text>
        <Text style={[TYPE.caption, { color: c.primary }]}>{tr ? `${remaining} eşya kaldı` : `${remaining} remaining`}</Text>
      </View>
      <FilterTabs activeFilter={filter} onChange={onFilter} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingTop: 4, paddingBottom: 16, gap: 18 },
  card: { borderRadius: 24, padding: 16, gap: 11 },
  topRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  cover: { width: 56, height: 56, borderRadius: 14, overflow: 'hidden' },
  destination: { fontFamily: FONTS.bold, fontSize: 16, lineHeight: 24 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: 3 },
  action: { height: 41, flex: 1, minWidth: 0, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 4, paddingHorizontal: 3 },
  actionText: { fontFamily: FONTS.semibold, fontSize: 10.5, includeFontPadding: false },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 30 },
});
