import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { createSharedTrip, joinSharedTrip, subscribeToMySharedTrips } from '../services/sharedTripService';

export default function SharedTripsScreen({ navigation }) {
  const { colors: c, language } = useTheme();
  const { user } = useAuth();
  const tr = language !== 'en';
  const [trips, setTrips] = useState([]);
  const [mode, setMode] = useState('list');
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [code, setCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToMySharedTrips(user.uid, setTrips, (e) => setError(e.message || String(e)));
  }, [user?.uid]);

  const label = { fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 6 };
  const input = { borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.surface,
    color: c.text, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12, fontSize: 15 };
  const btn = { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: c.primary,
    borderRadius: 15, alignItems: 'center', marginTop: 8 };
  const btnText = { color: '#FFFFFF', fontSize: 15, fontWeight: '800' };
  const card = { backgroundColor: c.surface, borderRadius: 22, borderWidth: 1, borderColor: c.border, padding: 18, marginBottom: 13 };

  async function create() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const result = await createSharedTrip({ title, destination, startDate: startDate.trim(), endDate: endDate.trim() });
      setNewCode(result.inviteCode);
      setTitle(''); setDestination(''); setStartDate(''); setEndDate('');
      setMode('created');
    } catch (e) { setError(e.message || String(e)); } finally { setBusy(false); }
  }
  async function join() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const tripId = await joinSharedTrip(code);
      setCode(''); setMode('list');
      navigation.navigate('SharedTripDetail', { tripId });
    } catch (e) { setError(e.message || String(e)); } finally { setBusy(false); }
  }
  async function shareCode(value) {
    try { await Share.share({ message: tr ? `PackPal ortak valiz davet kodum: ${value}` : `My PackPal shared packing invite code: ${value}` }); }
    catch (e) { Alert.alert('Paylaşım', e.message || String(e)); }
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text style={{ color: c.text, fontSize: 28, fontWeight: '800', marginBottom: 6 }}>
          {tr ? 'Ortak Valiz' : 'Shared Packing'}
        </Text>
        <Text style={{ color: c.textSecondary, marginBottom: 20, lineHeight: 21 }}>
          {tr ? 'Arkadaşlarınla aynı seyahate hazırlan. Herkes kendi PackPal hesabıyla katılır.' : 'Plan and pack together. Each participant needs a PackPal account.'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {[['list', tr ? 'Seyahatlerim' : 'My trips'], ['create', tr ? 'Oluştur' : 'Create'], ['join', tr ? 'Kodla katıl' : 'Join']].map(([key, text]) => (
            <Pressable key={key} onPress={() => { setMode(key); setError(''); }}
              style={{ backgroundColor: mode === key ? c.primaryLight : c.surface, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 11 }}>
              <Text style={{ color: mode === key ? c.primary : c.text, fontSize: 12, fontWeight: '700' }}>{text}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={{ color: c.danger, marginBottom: 15 }}>{error}</Text> : null}

        {mode === 'create' ? (
          <View style={card}>
            <Text style={label}>{tr ? 'Seyahat adı' : 'Trip name'}</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Kamp arkadaşları" placeholderTextColor={c.textSecondary} style={input} maxLength={100} />
            <Text style={label}>{tr ? 'Varış yeri' : 'Destination'}</Text>
            <TextInput value={destination} onChangeText={setDestination} placeholder="Antalya" placeholderTextColor={c.textSecondary} style={input} maxLength={100} />
            <Text style={label}>{tr ? 'Başlangıç (isteğe bağlı)' : 'Start date (optional)'}</Text>
            <TextInput value={startDate} onChangeText={setStartDate} placeholder="2026-11-05" placeholderTextColor={c.textSecondary} style={input} autoCapitalize="none" />
            <Text style={label}>{tr ? 'Bitiş (isteğe bağlı)' : 'End date (optional)'}</Text>
            <TextInput value={endDate} onChangeText={setEndDate} placeholder="2026-11-08" placeholderTextColor={c.textSecondary} style={input} autoCapitalize="none" />
            <Pressable disabled={busy} onPress={create} style={[btn, { opacity: busy ? 0.5 : 1 }]}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={btnText}>{tr ? 'Ortak seyahati oluştur' : 'Create shared trip'}</Text>}
            </Pressable>
          </View>
        ) : null}

        {mode === 'join' ? (
          <View style={card}>
            <Text style={label}>{tr ? '20 karakterli davet kodu' : '20-character invitation code'}</Text>
            <TextInput value={code} onChangeText={setCode} style={input} placeholder="Davet kodu" placeholderTextColor={c.textSecondary} autoCapitalize="none" autoCorrect={false} maxLength={20} />
            <Pressable disabled={busy} onPress={join} style={[btn, { opacity: busy ? 0.5 : 1 }]}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={btnText}>{tr ? 'Seyahate katıl' : 'Join trip'}</Text>}
            </Pressable>
          </View>
        ) : null}

        {mode === 'created' ? (
          <View style={card}>
            <Ionicons name="checkmark-circle" color={c.primary} size={32} />
            <Text style={{ color: c.text, fontSize: 19, fontWeight: '800', marginTop: 8 }}>{tr ? 'Seyahat hazır!' : 'Trip created!'}</Text>
            <Text style={{ color: c.textSecondary, marginVertical: 12 }}>{tr ? 'Bu kodu PackPal hesabı olan arkadaşlarınla paylaş.' : 'Share this code with friends who use PackPal.'}</Text>
            <Text selectable style={{ color: c.primary, fontWeight: '800', fontSize: 20, letterSpacing: 1, marginBottom: 10 }}>{newCode}</Text>
            <Pressable onPress={() => shareCode(newCode)} style={btn}><Text style={btnText}>{tr ? 'Kodu paylaş' : 'Share code'}</Text></Pressable>
            <Pressable onPress={() => setMode('list')} style={{ padding: 15, alignItems: 'center' }}><Text style={{ color: c.primary, fontWeight: '700' }}>{tr ? 'Seyahatlerime dön' : 'Back to my trips'}</Text></Pressable>
          </View>
        ) : null}

        {mode === 'list' ? (
          trips.length ? trips.map((trip) => (
            <Pressable key={trip.id} style={card} onPress={() => navigation.navigate('SharedTripDetail', { tripId: trip.id })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="people-circle-outline" size={32} color={c.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 17, fontWeight: '800' }}>{trip.title}</Text>
                  <Text style={{ color: c.textSecondary, marginTop: 4 }}>{trip.destination}{trip.startDate ? ` · ${trip.startDate}` : ''}</Text>
                </View>
                <Ionicons name="chevron-forward" color={c.textSecondary} size={20} />
              </View>
            </Pressable>
          )) : <View style={card}><Text style={{ color: c.textSecondary, lineHeight: 23 }}>{tr ? 'Henüz ortak valizin yok. Yeni bir seyahat oluşturabilir veya kodla katılabilirsin.' : 'No shared trips yet. Create one or join using an invite code.'}</Text></View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
