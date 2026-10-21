import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Image, Linking, Modal, Pressable, ScrollView, Text, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RoundedCard } from "./RefinedUI";
import { TYPE } from "../constants/typography";
import { distanceMeters } from "../services/landmarkService";
import { fetchLandmarkDetails } from "../services/landmarkDetailService";

function previewText(full) {
  const text = String(full || "").replace(/\s+/g, " ").trim();
  if (text.length <= 290) return text;
  const cut = text.lastIndexOf(" ", 290);
  return text.slice(0, cut > 160 ? cut : 290).trimEnd() + "…";
}

export default function LandmarkInfoCard({ landmark, gpsPosition, colors: c, tr, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setDetails(null);
    setFailed(false);
    setLoading(true);
    fetchLandmarkDetails(landmark, tr ? "tr" : "en", controller.signal)
      .then((result) => { if (active) setDetails(result); })
      .catch((error) => {
        if (active && error?.name !== "AbortError") setFailed(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [landmark.id, landmark.url, tr, retry]);

  const sourceUrl = details?.sourceUrl || landmark.url;
  const openSource = () => {
    if (!/^https:\/\/(tr|en)\.wikipedia\.org\/wiki\//.test(sourceUrl || "")) return;
    Linking.openURL(sourceUrl).catch(() => {
      Alert.alert(tr ? "Bağlantı açılamadı" : "Could not open link");
    });
  };
  const noDescription = tr ? "Bu yer için Wikipedia açıklaması bulunamadı." :
    "No Wikipedia description is available for this place.";
  const unknown = tr ? "Bilgi alınamadı. Tekrar deneyebilirsin." :
    "Could not load the information. You can try again.";
  const distance = gpsPosition ? distanceMeters(gpsPosition, landmark) : Infinity;
  const fallbackEnglish = tr && details?.sourceLanguage === "en";

  return <>
    <RoundedCard style={{ padding: 18, gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={[TYPE.micro, { color: c.primary }]}>
            {landmark.kind === "auto"
              ? (tr ? "YAKININDA KEŞFEDİLECEK BİR YER" : "A PLACE TO DISCOVER NEARBY")
              : (tr ? "TARİHİ VE KÜLTÜREL NOKTA" : "HISTORIC AND CULTURAL PLACE")}
          </Text>
          <Text style={[TYPE.subtitle, { color: c.text, marginTop: 5 }]}>{landmark.name}</Text>
        </View>
        <Pressable onPress={onClose} accessibilityRole="button"
          accessibilityLabel={tr ? "Bilgi kartını kapat" : "Close information card"}>
          <Ionicons name="close-circle-outline" size={25} color={c.textSecondary} />
        </Pressable>
      </View>
      {Number.isFinite(distance) ? <Text style={[TYPE.caption, { color: c.textSecondary }]}>
        {tr ? `Yaklaşık ${Math.round(distance)} metre uzaklıkta` :
          `Approximately ${Math.round(distance)} metres away`}
      </Text> : null}
      {details?.imageUrl ? <Image source={{ uri: details.imageUrl }}
        style={{ width: "100%", height: 175, borderRadius: 14, backgroundColor: c.surfaceAlt }}
        resizeMode="cover" accessibilityLabel={tr ? "Tarihi yer fotoğrafı" : "Landmark photo"} /> : null}
      {loading ? <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <ActivityIndicator size="small" color={c.primary} />
        <Text style={[TYPE.caption, { color: c.textSecondary }]}>
          {tr ? "Wikipedia bilgileri yükleniyor..." : "Loading Wikipedia information..."}
        </Text>
      </View> : <Text style={[TYPE.body, { color: c.textSecondary }]}>
        {failed ? unknown : previewText(details?.description) || noDescription}
      </Text>}
      {fallbackEnglish ? <Text style={[TYPE.micro, { color: c.textSecondary }]}>
        {tr ? "Türkçe makale bulunamadı; İngilizce kaynak gösteriliyor." : ""}
      </Text> : null}
      {failed ? <Pressable onPress={() => setRetry((n) => n + 1)} accessibilityRole="button">
        <Text style={[TYPE.label, { color: c.primary }]}>{tr ? "Tekrar dene ↻" : "Retry ↻"}</Text>
      </Pressable> : null}
      <Pressable accessibilityRole="button" onPress={() => setExpanded(true)}
        style={{ alignSelf: "flex-start", paddingVertical: 7 }}>
        <Text style={[TYPE.label, { color: c.primary }]}>
          {tr ? "Devamını oku →" : "Read more →"}
        </Text>
      </Pressable>
      <Text style={[TYPE.micro, { color: c.textSecondary }]}>
        {tr ? "Kaynak: Wikipedia · Konum bilgileri yaklaşık olabilir" :
          "Source: Wikipedia · Location data may be approximate"}
      </Text>
    </RoundedCard>

    <Modal visible={expanded} animationType="slide" presentationStyle="pageSheet"
      onRequestClose={() => setExpanded(false)}>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12,
          flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[TYPE.micro, { color: c.primary }]}>
            {tr ? "KEŞFEDİLECEK YER" : "PLACE TO DISCOVER"}
          </Text>
          <Pressable onPress={() => setExpanded(false)} accessibilityRole="button"
            accessibilityLabel={tr ? "Ayrıntıları kapat" : "Close details"}>
            <Ionicons name="close" size={27} color={c.text} />
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 44, gap: 16 }}>
          {details?.imageUrl ? <Image source={{ uri: details.imageUrl }}
            style={{ width: "100%", height: 230, borderRadius: 18, backgroundColor: c.surfaceAlt }}
            resizeMode="cover" /> : null}
          <Text style={[TYPE.title, { color: c.text }]}>{details?.title || landmark.name}</Text>
          {fallbackEnglish ? <Text style={[TYPE.caption, { color: c.textSecondary }]}>
            {tr ? "Türkçe açıklama bulunamadığından İngilizce metin gösteriliyor." : ""}
          </Text> : null}
          {loading ? <ActivityIndicator color={c.primary} /> : <Text
            style={[TYPE.body, { color: c.text, lineHeight: 25 }]}>
            {failed ? unknown : details?.description || noDescription}
          </Text>}
          {failed ? <Pressable onPress={() => setRetry((n) => n + 1)}>
            <Text style={[TYPE.label, { color: c.primary }]}>{tr ? "Yeniden yükle" : "Reload"}</Text>
          </Pressable> : null}
          {sourceUrl ? <Pressable onPress={openSource} accessibilityRole="link"
            style={{ padding: 15, backgroundColor: c.primaryLight, borderRadius: 14,
              flexDirection: "row", alignItems: "center", gap: 9 }}>
            <Ionicons name="open-outline" size={18} color={c.primary} />
            <Text style={[TYPE.label, { color: c.primary, flex: 1 }]}>
              {tr ? "Wikipedia'da makalenin tamamını aç" : "Open full article on Wikipedia"}
            </Text>
          </Pressable> : null}
          <Text style={[TYPE.micro, { color: c.textSecondary }]}>
            {tr ? "Metin: Wikipedia · Görsel varsa Wikimedia üzerinden sunulur. Görselin lisans bilgisi kaynak sayfasındadır." :
              "Text: Wikipedia · Images, if available, are served via Wikimedia. See source for image licensing."}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </>;
}
