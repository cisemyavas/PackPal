import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import {
  ITINERARY_SCOPE,
  addItineraryActivity,
  deleteItineraryActivity,
  subscribeToItinerary,
  updateItineraryActivity,
} from '../services/itineraryService';

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function datesInRange(from, to) {
  if (!isDate(from) || !isDate(to) || to < from) return [];
  const out = [];
  let ms = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  for (let i = 0; ms <= end && i < 62; i++, ms += 86400000) {
    out.push(new Date(ms).toISOString().slice(0, 10));
  }
  return out;
}
function emptyForm(date) {
  return { title: '', date, startTime: '', placeName: '', notes: '' };
}

export default function ItineraryScreen({ route, navigation }) {
  const { colors: c, language } = useTheme();
  const tr = language !== 'en';
  const { scope, tripId, title, destination, startDate, endDate } = route.params || {};
  const validScope = scope === ITINERARY_SCOPE.PERSONAL || scope === ITINERARY_SCOPE.SHARED;
  const [selectedDate, setSelectedDate] = useState(isDate(startDate) ? startDate : today());
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm(isDate(startDate) ? startDate : today()));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: tr ? 'Gezi Planı' : 'Itinerary' });
  }, [navigation, tr]);

  useEffect(() => {
    if (!tripId || !validScope) {
      setError(tr ? 'Geçersiz seyahat bağlantısı.' : 'Invalid trip reference.');
      setLoading(false);
      return;
    }
    setLoading(true);
    let stop;
    try {
      stop = subscribeToItinerary(scope, tripId,
        (items) => { setActivities(items); setLoading(false); setError(''); },
        (e) => { setError(e?.message || String(e)); setLoading(false); },
      );
    } catch (e) {
      setError(e?.message || String(e));
      setLoading(false);
    }
    return () => { if (stop) stop(); };
  }, [scope, tripId, validScope]);

  const days = useMemo(() => {
    const planDays = datesInRange(startDate, endDate);
    return [...new Set([...planDays, selectedDate, ...activities.map((item) => item.date).filter(isDate)])].sort();
  }, [startDate, endDate, selectedDate, activities]);
  const daily = useMemo(() => activities.filter((item) => item.date === selectedDate), [activities, selectedDate]);
  const panel = { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 16 };
  const field = { borderWidth: 1, borderColor: c.border, color: c.text, backgroundColor: c.surfaceAlt,
    paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, fontSize: 15, marginTop: 5 };
  const caption = { color: c.textSecondary, fontSize: 12, fontWeight: '700' };
  const primary = { backgroundColor: c.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' };

  function openNew() {
    setEditing(null);
    setForm(emptyForm(selectedDate));
    setEditing({ id: null });
  }
  function openEdit(item) {
    setForm({ title: item.title || '', date: item.date || selectedDate,
      startTime: item.startTime || '', placeName: item.placeName || '', notes: item.notes || '' });
    setEditing({ id: item.id });
  }
  function setValue(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function save() {
    if (saving) return;
    if (!form.title.trim()) {
      Alert.alert(tr ? 'Eksik bilgi' : 'Missing information', tr ? 'Etkinlik adını gir.' : 'Enter a title.');
      return;
    }
    if (!isDate(form.date)) {
      Alert.alert(tr ? 'Geçersiz tarih' : 'Invalid date', 'YYYY-MM-DD');
      return;
    }
    if (isDate(startDate) && isDate(endDate) && (form.date < startDate || form.date > endDate)) {
      Alert.alert(tr ? 'Seyahat tarihi dışında' : 'Outside trip dates',
        tr ? 'Etkinlik günü seyahat tarihleri arasında olmalı.' : 'Choose a day within your trip dates.');
      return;
    }
    setSaving(true);
    try {
      if (editing?.id) await updateItineraryActivity(scope, tripId, editing.id, form);
      else await addItineraryActivity(scope, tripId, form);
      setSelectedDate(form.date);
      setEditing(null);
    } catch (e) {
      Alert.alert(tr ? 'Kaydedilemedi' : 'Could not save', e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }
  function confirmDelete(item) {
    Alert.alert(tr ? 'Etkinliği sil?' : 'Delete activity?', item.title,
      [{ text: tr ? 'İptal' : 'Cancel', style: 'cancel' },
       { text: tr ? 'Sil' : 'Delete', style: 'destructive', onPress: async () => {
         try { await deleteItineraryActivity(scope, tripId, item.id); }
         catch (e) { Alert.alert(tr ? 'Silinemedi' : 'Could not delete', e?.message || String(e)); }
       } }]);
  }

  if (!tripId || !validScope) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: c.background, padding: 20 }}>
      <Text style={{ color: c.danger }}>{tr ? 'Seyahat bilgisi bulunamadı.' : 'Trip not found.'}</Text>
    </SafeAreaView>;
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 130 }}>
        <Text style={{ fontSize: 25, fontWeight: '800', color: c.text, marginBottom: 5 }}>
          {title || destination || (tr ? 'Gezi Planım' : 'My Itinerary')}
        </Text>
        <Text style={{ color: c.textSecondary, marginBottom: 16 }}>
          {scope === ITINERARY_SCOPE.SHARED
            ? (tr ? 'Arkadaşlarınla ortak gezi programı' : 'A shared itinerary with your friends')
            : (tr ? 'Kişisel gezi programın' : 'Your personal itinerary')}
        </Text>
        {isDate(startDate) && isDate(endDate) ? <Text style={{ color: c.textSecondary, marginBottom: 12, fontSize: 12 }}>
          {startDate} → {endDate}
        </Text> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {days.map((date, i) => (
            <Pressable key={date} onPress={() => setSelectedDate(date)} accessibilityRole="button"
              style={{ backgroundColor: selectedDate === date ? c.primaryLight : c.surface,
                borderColor: selectedDate === date ? c.primary : c.border,
                borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginRight: 9 }}>
              <Text style={{ fontWeight: '800', color: selectedDate === date ? c.primary : c.text }}>{date.slice(5)}</Text>
              <Text style={{ fontSize: 11, marginTop: 3, color: c.textSecondary }}>
                {tr ? `Gün ${i + 1}` : `Day ${i + 1}`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable onPress={openNew} style={[primary, { marginBottom: 18, flexDirection: 'row', justifyContent: 'center', gap: 9 }]}
          accessibilityRole="button">
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800' }}>{tr ? 'Etkinlik Ekle' : 'Add Activity'}</Text>
        </Pressable>
        {loading ? <ActivityIndicator color={c.primary} /> : null}
        {error ? <View style={[panel, { marginBottom: 12 }]}>
          <Text style={{ color: c.danger }}>{error}</Text>
        </View> : null}
        {!loading && !error && daily.length === 0 ? (
          <View style={[panel, { alignItems: 'center', paddingVertical: 30 }]}>
            <Ionicons name="calendar-clear-outline" size={30} color={c.primary} />
            <Text style={{ color: c.text, fontWeight: '800', marginTop: 10 }}>
              {tr ? 'Bu güne henüz plan eklenmedi' : 'No plans for this day yet'}
            </Text>
            <Text style={{ color: c.textSecondary, textAlign: 'center', marginTop: 5 }}>
              {tr ? 'Bir etkinlik ekleyerek başlayabilirsin.' : 'Add an activity to get started.'}
            </Text>
          </View>
        ) : null}
        {daily.map((item) => (
          <View key={item.id} style={[panel, { marginBottom: 12 }]}>
            <Text style={{ color: c.primary, fontSize: 13, fontWeight: '800', marginBottom: 6 }}>
              {item.startTime || (tr ? 'Saat belirtilmedi' : 'No time set')}
            </Text>
            <Text style={{ color: c.text, fontSize: 17, fontWeight: '800' }}>{item.title}</Text>
            {item.placeName ? <Text style={{ color: c.textSecondary, marginTop: 6 }}>⌖ {item.placeName}</Text> : null}
            {item.notes ? <Text style={{ color: c.textSecondary, marginTop: 7 }}>{item.notes}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 18, marginTop: 14 }}>
              <Pressable onPress={() => openEdit(item)} accessibilityRole="button">
                <Text style={{ color: c.primary, fontWeight: '800' }}>{tr ? 'Düzenle' : 'Edit'}</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} accessibilityRole="button">
                <Text style={{ color: c.danger, fontWeight: '800' }}>{tr ? 'Sil' : 'Delete'}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <Modal visible={editing !== null} animationType="slide" transparent onRequestClose={() => { if (!saving) setEditing(null); }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <SafeAreaView edges={['bottom']} style={{ maxHeight: '88%', backgroundColor: c.surface,
            borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 22, paddingBottom: 30 }}>
              <Text style={{ color: c.text, fontWeight: '800', fontSize: 21, marginBottom: 18 }}>
                {editing?.id ? (tr ? 'Etkinliği düzenle' : 'Edit Activity') : (tr ? 'Yeni etkinlik' : 'New Activity')}
              </Text>
              {[
                ['title', tr ? 'Etkinlik adı *' : 'Activity title *', tr ? 'Örn. Parlamento ziyareti' : 'e.g. Parliament visit'],
                ['date', tr ? 'Tarih * (YYYY-MM-DD)' : 'Date * (YYYY-MM-DD)', '2026-11-05'],
                ['startTime', tr ? 'Saat (HH:mm)' : 'Time (HH:mm)', '10:30'],
                ['placeName', tr ? 'Mekân' : 'Place', tr ? 'Örn. Parlamento Binası' : 'e.g. Parliament Building'],
                ['notes', tr ? 'Notlar' : 'Notes', tr ? 'Biletleri kontrol et' : 'Check the tickets'],
              ].map(([key, label, placeholder]) => (
                <View key={key} style={{ marginBottom: 15 }}>
                  <Text style={caption}>{label}</Text>
                  <TextInput accessibilityLabel={label} value={form[key]} onChangeText={(v) => setValue(key, v)}
                    placeholder={placeholder} placeholderTextColor={c.textSecondary} style={[field,
                      key === 'notes' ? { minHeight: 83, textAlignVertical: 'top' } : null]}
                    multiline={key === 'notes'} maxLength={key === 'notes' ? 1000 : key === 'placeName' ? 120 : 100}
                    autoCapitalize={key === 'date' || key === 'startTime' ? 'none' : 'sentences'} />
                </View>
              ))}
              <Pressable onPress={save} disabled={saving} style={[primary, { opacity: saving ? 0.5 : 1 }]}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>
                  {tr ? 'Kaydet' : 'Save'}
                </Text>}
              </Pressable>
              <Pressable onPress={() => setEditing(null)} disabled={saving} style={{ alignItems: 'center', padding: 15 }}>
                <Text style={{ color: c.textSecondary, fontWeight: '700' }}>{tr ? 'Vazgeç' : 'Cancel'}</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
