import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  addSharedItem, changeSharedItem, createAnotherInviteCode, removeSharedItem,
  removeSharedParticipant, leaveSharedTrip,
  subscribeToSharedItems, subscribeToSharedMembers, subscribeToSharedTrip,
} from '../services/sharedTripService';

export default function SharedTripDetailScreen({ route, navigation }) {
  const tripId = route.params?.tripId;
  const { user } = useAuth();
  const { colors: c, language } = useTheme();
  const tr = language !== 'en';
  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [assignedTo, setAssignedTo] = useState(null);
  const [assigningItemId, setAssigningItemId] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [accessLost, setAccessLost] = useState(false);
  const leavingRef = useRef(false);

  useEffect(() => {
    if (!tripId) return;
    const failed = (e) => {
      if (leavingRef.current) return;
      if (e?.code === 'permission-denied') setAccessLost(true);
      else setError(e.message || String(e));
    };
    const stopTrip = subscribeToSharedTrip(tripId, setTrip, failed);
    const stopMembers = subscribeToSharedMembers(tripId, setMembers, failed);
    const stopItems = subscribeToSharedItems(tripId, setItems, failed);
    return () => { stopTrip(); stopMembers(); stopItems(); };
  }, [tripId]);

  useEffect(() => {
    if (!accessLost) return;
    Alert.alert(
      tr ? 'Ortak seyahat erişimi kapandı' : 'Shared trip access ended',
      tr ? 'Artık bu ortak seyahatin katılımcısı değilsin.' : 'You no longer have access to this shared trip.',
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  }, [accessLost, tr, navigation]);

  const complete = useMemo(() => items.filter((item) => item.isPacked).length, [items]);
  const card = { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
    borderRadius: 22, padding: 18, marginBottom: 14 };
  const input = { flex: 1, borderWidth: 1, borderColor: c.border, color: c.text,
    backgroundColor: c.surfaceAlt, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11 };
  const action = { borderRadius: 12, padding: 11, backgroundColor: c.primary, alignItems: 'center' };

  async function run(task) {
    if (busy) return;
    setBusy(true); setError('');
    try { await task(); } catch (e) { setError(e.message || String(e)); }
    finally { setBusy(false); }
  }
  async function add() {
    await run(async () => {
      await addSharedItem(tripId, { name, quantity: Number(quantity), assignedTo });
      setName(''); setQuantity('1'); setAssignedTo(null);
    });
  }
  function confirmDelete(item) {
    Alert.alert(tr ? 'Eşyayı sil?' : 'Delete item?', item.name, [
      { text: tr ? 'İptal' : 'Cancel', style: 'cancel' },
      { text: tr ? 'Sil' : 'Delete', style: 'destructive', onPress: () => run(() => removeSharedItem(tripId, item.id)) },
    ]);
  }
  function invite() {
    Alert.alert(
      tr ? 'Davet kodu yenilensin mi?' : 'Rotate invite code?',
      tr ? 'Eski tüm kodlar iptal olacak. Mevcut katılımcılar kalacak.' : 'All previous codes will stop working. Existing members stay.',
      [
        { text: tr ? 'Vazgeç' : 'Cancel', style: 'cancel' },
        { text: tr ? 'Yenile' : 'Rotate', onPress: () => run(async () => { setInviteCode(await createAnotherInviteCode(tripId)); }) },
      ],
    );
  }
  function confirmKick(member) {
    Alert.alert(
      tr ? 'Katılımcıyı çıkar?' : 'Remove participant?',
      tr ? `${member.displayName} ortak valizden çıkarılacak. Eski davet kodları da iptal edilecek.` : `${member.displayName} will lose access. Previous invitation codes will be invalidated.`,
      [
        { text: tr ? 'İptal' : 'Cancel', style: 'cancel' },
        { text: tr ? 'Çıkar' : 'Remove', style: 'destructive', onPress: () => run(async () => { setInviteCode(await removeSharedParticipant(tripId, member.id)); }) },
      ],
    );
  }
  function confirmLeave() {
    Alert.alert(
      tr ? 'Seyahatten ayrıl?' : 'Leave shared trip?',
      tr ? 'Ortak seyahat listenden kalkacak. Diğer katılımcıların eşyaları silinmeyecek.' : 'This trip will disappear from your list. Shared items will stay for other members.',
      [
        { text: tr ? 'İptal' : 'Cancel', style: 'cancel' },
        { text: tr ? 'Ayrıl' : 'Leave', style: 'destructive', onPress: () => run(async () => {
          leavingRef.current = true;
          try { await leaveSharedTrip(tripId); navigation.goBack(); }
          catch (e) { leavingRef.current = false; throw e; }
        }) },
      ],
    );
  }
  async function shareCode() {
    if (!inviteCode) return;
    try { await Share.share({ message: tr ? `PackPal ortak valiz davet kodu: ${inviteCode}` : `PackPal shared packing invite: ${inviteCode}` }); }
    catch (e) { setError(e.message || String(e)); }
  }
  const memberName = (id) => members.find((m) => m.id === id)?.displayName || (tr ? 'Atanmamış' : 'Unassigned');

  if (!tripId) return <Text>Trip ID missing</Text>;
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 130 }}>
        <Text style={{ fontWeight: '800', fontSize: 27, color: c.text, marginBottom: 4 }}>{trip?.title || (tr ? 'Ortak Seyahat' : 'Shared Trip')}</Text>
        <Text style={{ color: c.textSecondary, marginBottom: 20 }}>{trip?.destination || '...'}{trip?.startDate ? ` · ${trip.startDate}` : ''}</Text>
        {error ? <Text style={{ color: c.danger, marginBottom: 14 }}>{error}</Text> : null}

        <View style={card}>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: 17, marginBottom: 8 }}>{tr ? 'Hazırlık durumu' : 'Packing progress'}</Text>
          <Text style={{ color: c.textSecondary, marginBottom: 12 }}>{complete} / {items.length} {tr ? 'eşya hazır' : 'items packed'}</Text>
          <View style={{ height: 9, borderRadius: 9, backgroundColor: c.surfaceAlt, overflow: 'hidden' }}>
            <View style={{ width: `${items.length ? complete * 100 / items.length : 0}%`, height: '100%', backgroundColor: c.primary, borderRadius: 9 }} />
          </View>
        </View>

        <View style={card}>
          <Text style={{ color: c.text, fontWeight: '800', fontSize: 17, marginBottom: 10 }}>{tr ? 'Katılımcılar' : 'Participants'} ({members.length})</Text>
          <View style={{ gap: 8 }}>
            {members.map((m) => (
              <View key={m.id} style={{ backgroundColor: c.primaryLight, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ flex: 1, fontWeight: '700', color: c.primary }}>
                  {m.displayName}{trip?.ownerUid === m.id ? ' ★' : ''}
                </Text>
                {trip?.ownerUid === user?.uid && m.id !== user?.uid ? (
                  <Pressable disabled={busy} accessibilityRole="button" accessibilityLabel={tr ? `${m.displayName} katılımcısını çıkar` : `Remove ${m.displayName}`}
                    onPress={() => confirmKick(m)} style={{ padding: 5 }}>
                    <Ionicons name="person-remove-outline" size={21} color={c.danger} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
          {trip?.ownerUid === user?.uid ? <>
            <Pressable disabled={busy} onPress={invite} style={[action, { marginTop: 15, opacity: busy ? 0.6 : 1 }]}>
              <Text style={{ color: 'white', fontWeight: '800' }}>{tr ? 'Davet kodunu yenile' : 'Rotate invite code'}</Text>
            </Pressable>
            <Text style={{ marginTop: 7, color: c.textSecondary, fontSize: 12 }}>
              {tr ? 'Önceki kodlar iptal edilir; mevcut üyeler kalır.' : 'Previous codes expire; current members stay.'}
            </Text>
            {inviteCode ? <>
              <Text selectable style={{ color: c.primary, fontSize: 20, fontWeight: '800', marginTop: 12, letterSpacing: 1 }}>{inviteCode}</Text>
              <Pressable onPress={shareCode} style={{ padding: 10 }}>
                <Text style={{ color: c.primary, fontWeight: '700' }}>{tr ? 'Yeni kodu paylaş' : 'Share new code'}</Text>
              </Pressable>
            </> : null}
          </> : <Pressable disabled={busy} onPress={confirmLeave}
            style={{ borderWidth: 1, borderColor: c.danger, borderRadius: 12, padding: 12, marginTop: 14, alignItems: 'center', opacity: busy ? 0.5 : 1 }}>
            <Text style={{ color: c.danger, fontWeight: '700' }}>{tr ? 'Ortak seyahatten ayrıl' : 'Leave shared trip'}</Text>
          </Pressable>}
        </View>

        <View style={card}>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '800', marginBottom: 10 }}>{tr ? 'Listeye eşya ekle' : 'Add an item'}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput placeholder={tr ? 'Örn. Çadır' : 'e.g. Tent'} placeholderTextColor={c.textSecondary} style={input} value={name} onChangeText={setName} maxLength={100} />
            <TextInput placeholder="1" placeholderTextColor={c.textSecondary} keyboardType="number-pad" style={[input, { flex: 0, width: 55, textAlign: 'center' }]} value={quantity} onChangeText={setQuantity} maxLength={2} />
          </View>
          <Text style={{ color: c.textSecondary, marginTop: 12, marginBottom: 8 }}>{tr ? 'Kim getirecek?' : 'Who will bring it?'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[{ id: null, displayName: tr ? 'Henüz belli değil' : 'Unassigned' }, ...members].map((m) => (
              <Pressable key={m.id || 'none'} onPress={() => setAssignedTo(m.id)} style={{ backgroundColor: assignedTo === m.id ? c.primaryLight : c.surfaceAlt, padding: 10, borderRadius: 12 }}>
                <Text style={{ color: assignedTo === m.id ? c.primary : c.text, fontWeight: '700', fontSize: 12 }}>{m.displayName}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable disabled={busy} onPress={add} style={[action, { marginTop: 14, opacity: busy ? 0.6 : 1 }]}>
            {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '800' }}>{tr ? 'Eşya ekle' : 'Add item'}</Text>}
          </Pressable>
        </View>

        <Text style={{ color: c.text, fontSize: 20, fontWeight: '800', marginBottom: 14 }}>{tr ? 'Ortak liste' : 'Shared list'}</Text>
        {!items.length ? <View style={card}><Text style={{ color: c.textSecondary }}>{tr ? 'Henüz eşya eklenmedi.' : 'No items yet.'}</Text></View> : null}
        {items.map((item) => (
          <View key={item.id} style={card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable disabled={busy} onPress={() => run(() => changeSharedItem(tripId, item.id, { isPacked: !item.isPacked }))} style={{ padding: 4 }}>
                <Ionicons name={item.isPacked ? 'checkmark-circle' : 'ellipse-outline'} color={item.isPacked ? c.success : c.primary} size={27} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '800', fontSize: 15, textDecorationLine: item.isPacked ? 'line-through' : 'none' }}>{item.name} · {item.quantity}</Text>
                <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 4 }}>{item.assignedTo ? memberName(item.assignedTo) : (tr ? 'Atanmamış' : 'Unassigned')}</Text>
              </View>
              <Pressable onPress={() => setAssigningItemId(assigningItemId === item.id ? null : item.id)} style={{ padding: 5 }}>
                <Ionicons name="person-add-outline" color={c.primary} size={21} />
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} style={{ padding: 5 }}>
                <Ionicons name="trash-outline" color={c.danger} size={21} />
              </Pressable>
            </View>
            {assigningItemId === item.id ? <View style={{ marginTop: 12, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {[{ id: null, displayName: tr ? 'Atamayı kaldır' : 'Unassign' }, ...members].map((m) => (
                <Pressable key={m.id || 'none'} onPress={() => run(async () => { await changeSharedItem(tripId, item.id, { assignedTo: m.id }); setAssigningItemId(null); })}
                  style={{ backgroundColor: c.surfaceAlt, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 }}>
                  <Text style={{ color: c.primary, fontWeight: '700', fontSize: 12 }}>{m.displayName}</Text>
                </Pressable>
              ))}
            </View> : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
