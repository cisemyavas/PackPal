import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { useIsFocused } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { TYPE } from "../constants/typography";

// Android Expo Go Leaflet prototype: Google Maps SDK and MapLibre Native are NOT used.
// iOS continues to use the existing CartoMapRaster unchanged.
const GALATA = { latitude: 41.0256, longitude: 28.9739 };
const CARTO_KEY = (process.env.EXPO_PUBLIC_CARTO_BASEMAP_KEY || "").trim();
const HAS_KEY = Boolean(CARTO_KEY && CARTO_KEY !== "YOUR_CARTO_KEY");
const ATTRIBUTION = "© OpenStreetMap contributors · © CARTO";

function makeHtml(tileUrl) {
  // This key is an EXPO_PUBLIC_ client key, not a server-side secret.
  // JSON encoding prevents user-provided text from becoming executable JS.
  const safeUrl = JSON.stringify(tileUrl).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
html,body,#map{height:100%;width:100%;margin:0;padding:0;overflow:hidden}
body{background:#ecebea}#map{position:absolute;inset:0}
.pin{border:2px solid #fff;border-radius:14px;background:#7856de;color:#fff;
width:34px;height:34px;display:flex;align-items:center;justify-content:center;
font-size:21px;box-shadow:0 2px 9px #0004}
.poi{border:2px solid #7856de;border-radius:50%;background:#fff;color:#7856de;
width:27px;height:27px;display:flex;align-items:center;justify-content:center;
font-size:16px;box-shadow:0 2px 5px #0002}
.dot{border:3px solid #fff;border-radius:50%;background:#4a9cf6;width:14px;height:14px;
box-shadow:0 1px 8px #0004}
.leaflet-container{background:#e4e4e4}
</style></head><body><div id="map"></div>
<script>
(function(){
  var tileUrl=${safeUrl};
  function send(type,more){if(window.ReactNativeWebView&&window.ReactNativeWebView.postMessage){
    window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({type:type},more||{})));}}
  function start(){
    if(!window.L){send('error',{reason:'Leaflet library is unavailable'});return;}
    try{
      var map=L.map('map',{zoomControl:false,attributionControl:false,preferCanvas:false,
        scrollWheelZoom:false, doubleClickZoom:true,zoomSnap:0.5,zoomDelta:0.5,
        minZoom:2,maxZoom:19}).setView([41.0256,28.9739],14.5);
      var layer=L.tileLayer(tileUrl,{tileSize:256,minZoom:2,maxZoom:19,
        maxNativeZoom:19,updateWhenIdle:true}).addTo(map);
      var seenTile=false, errorCount=0;
      layer.on('tileload',function(){if(!seenTile){seenTile=true;send('tiles');}});
      layer.on('tileerror',function(){if(!seenTile && ++errorCount===4){
        send('tile-error',{reason:'CARTO tile images could not load'});}});
      var galata=L.marker([41.0256,28.9739],{
        icon:L.divIcon({className:'',html:'<div class="pin">⌖</div>',iconSize:[38,38],iconAnchor:[19,38]})
      }).addTo(map);
      galata.on('click',function(){send('galata');});
      var userMarker=null;
      var landmarksLayer=L.layerGroup().addTo(map);
      map.on('dragstart',function(){send('user-pan');});
      function valid(lat,lng){return typeof lat==='number'&&isFinite(lat)&&Math.abs(lat)<=90&&
        typeof lng==='number'&&isFinite(lng)&&Math.abs(lng)<=180;}
      window.packpal={receive:function(command){
        if(!command||typeof command!=='object')return;
        if(command.type==='move'&&valid(command.latitude,command.longitude)){
          var z=(typeof command.zoom==='number'&&isFinite(command.zoom))?command.zoom:13;
          map.flyTo([command.latitude,command.longitude],Math.max(2,Math.min(19,z)),{animate:true,duration:0.65});
        }
        if(command.type==='user'){
          if(!valid(command.latitude,command.longitude))return;
          var ll=[command.latitude,command.longitude];
          if(!userMarker){userMarker=L.marker(ll,{interactive:false,
            icon:L.divIcon({className:'',html:'<div class="dot"></div>',iconSize:[20,20],iconAnchor:[10,10]})
          }).addTo(map);}else{userMarker.setLatLng(ll);}
        }
        if(command.type==='clear-user'&&userMarker){map.removeLayer(userMarker);userMarker=null;}
        if(command.type==='landmarks'){
          landmarksLayer.clearLayers();
          (Array.isArray(command.items)?command.items:[]).forEach(function(item){
            if(!item || !valid(item.latitude,item.longitude))return;
            var marker=L.marker([item.latitude,item.longitude],{
              icon:L.divIcon({className:'',html:'<div class="poi">⌂</div>',iconSize:[31,31],iconAnchor:[15,15]})
            }).addTo(landmarksLayer);
            marker.on('click',function(){send('landmark',{id:String(item.id)});});
          });
        }
      }};
      send('ready');
      setTimeout(function(){map.invalidateSize();},150);
    }catch(e){send('error',{reason:String(e&&e.message||e)});}
  }
  // Try a second CDN if the first cannot be loaded by Android WebView.
  var sites=['https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
             'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];
  function load(index){
    if(index>=sites.length){send('error',{reason:'Leaflet JavaScript could not be downloaded'});return;}
    var script=document.createElement('script'),done=false;
    var limit=setTimeout(function(){if(done)return;done=true;script.remove();load(index+1);},8500);
    script.src=sites[index];
    script.onload=function(){if(done)return;done=true;clearTimeout(limit);start();};
    script.onerror=function(){if(done)return;done=true;clearTimeout(limit);load(index+1);};
    document.head.appendChild(script);
  }
  load(0);
})();
</script></body></html>`;
}

const isValid = (value) => Number.isFinite(value);
const calcZoom = (region) => {
  const d = Math.abs(region?.latitudeDelta);
  return isValid(d) && d > 0 ? Math.max(2, Math.min(18, Math.log2(180 / d) + 0.5)) : 13;
};
function MapButton({ name, label, onPress, disabled, c }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    disabled={disabled} onPress={onPress}
    style={{ width:42,height:42,borderRadius:15,marginBottom:8,backgroundColor:c.surface,
      alignItems:"center",justifyContent:"center",opacity:disabled?0.5:1 }}>
    <Ionicons name={name} size={22} color={c.primary}/>
  </Pressable>;
}

export default function CartoMapAndroid({
  onSelectPlace, onSelectLandmark, onLocationUpdate, landmarks = [],
  targetRegion, showGalataLabel = true, mapHeight = 268,
}) {
  const { colors: c, resolvedMode, language } = useTheme();
  const tr = language !== "en";
  const isFocused = useIsFocused();
  const webRef = useRef(null);
  const readyRef = useRef(false);
  const followRef = useRef(false);
  const focusRef = useRef(isFocused);
  const userRef = useRef(null);
  const requestRef = useRef(0);
  const subscriptionRef = useRef(null);
  const startingRef = useRef(false);
  const onLocationRef = useRef(onLocationUpdate);
  onLocationRef.current = onLocationUpdate;
  const [tracking, setTracking] = useState(false);
  const [following, setFollowing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapStatus, setMapStatus] = useState("loading");
  const [mapError, setMapError] = useState("");
  const [retry, setRetry] = useState(0);
  const [webReady, setWebReady] = useState(false);
  const tileStyle = resolvedMode === "dark" ? "dark_all" : "light_all";
  const tileUrl = `https://basemaps.cartocdn.com/rastertiles/${tileStyle}/{z}/{x}/{y}.png?key=${encodeURIComponent(CARTO_KEY)}`;
  const html = useMemo(() => makeHtml(tileUrl), [tileUrl]);
  const webSource = useMemo(() => ({ html }), [html]);

  const inject = useCallback((command) => {
    if (!readyRef.current) return;
    const payload = JSON.stringify(command).replace(/</g, "\\u003c");
    webRef.current?.injectJavaScript(`window.packpal && window.packpal.receive(${payload}); true;`);
  }, []);

  const focusAt = useCallback((point, zoom = 15) => {
    if (!point || !isValid(point.latitude) || !isValid(point.longitude)) return;
    inject({ type: "move", latitude: point.latitude, longitude: point.longitude, zoom });
  }, [inject]);

  useEffect(() => {
    if (!targetRegion) return;
    followRef.current = false;
    setFollowing(false);
    focusAt(targetRegion, calcZoom(targetRegion));
  }, [targetRegion, focusAt]);

  useEffect(() => {
    const safeItems = landmarks.filter((p) => isValid(p.latitude) && isValid(p.longitude))
      .slice(0, 100).map((p) => ({ id: String(p.id), latitude: p.latitude, longitude: p.longitude }));
    inject({ type: "landmarks", items: safeItems });
  }, [landmarks, inject]);

  const stopTracking = useCallback(() => {
    requestRef.current += 1;
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    startingRef.current = false;
    followRef.current = false;
    userRef.current = null;
    setTracking(false);
    setFollowing(false);
    setLocating(false);
    inject({ type: "clear-user" });
    onLocationRef.current?.(null);
  }, [inject]);

  useEffect(() => {
    focusRef.current = isFocused;
    if (!isFocused) stopTracking();
  }, [isFocused, stopTracking]);

  useEffect(() => () => {
    requestRef.current += 1;
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    onLocationRef.current?.(null);
  }, []);

  const handleMapMessage = useCallback((event) => {
    let msg;
    try { msg = JSON.parse(event.nativeEvent.data); } catch (_) { return; }
    if (msg.type === "ready") {
      readyRef.current = true;
      setWebReady(true);
      setMapError("");
      inject({ type: "landmarks", items: landmarks.filter((p) => isValid(p.latitude) && isValid(p.longitude))
        .slice(0, 100).map((p) => ({ id: String(p.id), latitude: p.latitude, longitude: p.longitude })) });
      if (userRef.current) inject({ type: "user", ...userRef.current });
      if (followRef.current && userRef.current) focusAt(userRef.current, 16);
      else if (targetRegion) focusAt(targetRegion, calcZoom(targetRegion));
    } else if (msg.type === "tiles") {
      setMapStatus("loaded");
      setMapError("");
    } else if (msg.type === "tile-error" || msg.type === "error") {
      setMapStatus("error");
      setMapError(msg.reason || "Map error");
    } else if (msg.type === "user-pan") {
      if (followRef.current) { followRef.current = false; setFollowing(false); }
    } else if (msg.type === "galata") {
      onSelectPlace?.("galata");
    } else if (msg.type === "landmark") {
      const selected = landmarks.find((p) => String(p.id) === String(msg.id));
      if (selected) onSelectLandmark?.(selected);
    }
  }, [landmarks, inject, focusAt, targetRegion, onSelectPlace, onSelectLandmark]);

  const focusGalata = useCallback(() => {
    followRef.current = false;
    setFollowing(false);
    focusAt(GALATA, 15);
    onSelectPlace?.("galata");
  }, [focusAt, onSelectPlace]);

  async function locateMe() {
    if (startingRef.current) return;
    if (subscriptionRef.current) {
      const value = !followRef.current;
      followRef.current = value;
      setFollowing(value);
      if (value && userRef.current) focusAt(userRef.current, 16);
      return;
    }
    startingRef.current = true;
    setLocating(true);
    const id = ++requestRef.current;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (id !== requestRef.current || !focusRef.current) return;
      if (permission.status !== "granted") {
        Alert.alert(tr ? "Konum izni gerekli" : "Location permission needed",
          tr ? "Canlı takip için konum izni ver." : "Allow location to use live tracking.");
        return;
      }
      followRef.current = true;
      setFollowing(true);
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 3000 },
        (result) => {
          if (id !== requestRef.current || !focusRef.current) return;
          const { latitude, longitude } = result.coords;
          if (!isValid(latitude) || !isValid(longitude)) return;
          const position = { latitude, longitude };
          userRef.current = position;
          inject({ type: "user", ...position });
          onLocationRef.current?.({ ...position, accuracy: result.coords.accuracy });
          if (followRef.current) focusAt(position, 16);
        }
      );
      if (id !== requestRef.current || !focusRef.current) {
        subscription.remove(); return;
      }
      subscriptionRef.current = subscription;
      setTracking(true);
    } catch (e) {
      if (id === requestRef.current) {
        followRef.current = false;
        setFollowing(false);
        Alert.alert(tr ? "Canlı konum başlatılamadı" : "Live location failed", e?.message || "Try again");
      }
    } finally {
      if (id === requestRef.current) {
        startingRef.current = false;
        setLocating(false);
      }
    }
  }

  if (!HAS_KEY) return <View style={{ height: mapHeight, borderRadius: 24, backgroundColor: c.surfaceAlt,
    justifyContent: "center", alignItems: "center", padding: 20 }}>
    <Text style={[TYPE.caption, { color: c.text }]}>
      {tr ? "CARTO anahtarı bulunamadı" : "CARTO key not found"}
    </Text>
  </View>;

  return <View style={{ height: mapHeight, borderRadius: 24, overflow: "hidden", backgroundColor: c.surfaceAlt }}>
    <WebView
      key={`${resolvedMode}-${retry}`}
      ref={webRef}
      originWhitelist={["*"]}
      source={webSource}
      style={{ flex: 1, backgroundColor: c.surfaceAlt }}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      onMessage={handleMapMessage}
      onError={(event) => { setMapStatus("error"); setMapError(event.nativeEvent?.description || "WebView error"); }}
      onLoadStart={() => { readyRef.current = false; setWebReady(false); setMapStatus("loading"); setMapError(""); }}
      mixedContentMode="never"
    />
    <View pointerEvents="box-none" style={{ position: "absolute", top: 12, right: 12 }}>
      <MapButton name={locating ? "hourglass-outline" : following ? "navigate" : "locate-outline"}
        label={tr ? "Konumumu takip et" : "Follow my location"} c={c}
        disabled={locating} onPress={locateMe}/>
      {tracking ? <MapButton name="stop-circle-outline"
        label={tr ? "Canlı konumu kapat" : "Stop live location"} c={c} onPress={stopTracking}/> : null}
      <MapButton name="compass-outline" label={tr ? "Galata Kulesi'ne dön" : "Back to Galata Tower"}
        c={c} onPress={focusGalata}/>
    </View>
    {showGalataLabel ? <Pressable accessibilityRole="button" onPress={focusGalata}
      style={{ position: "absolute", bottom: 38, left: 12, backgroundColor: c.surface,
        borderRadius: 13, paddingHorizontal: 11, paddingVertical: 7 }}>
      <Text style={[TYPE.micro, { color: c.primary }]}>{tr ? "Galata Kulesi" : "Galata Tower"}</Text>
    </Pressable> : null}
    <Pressable accessibilityRole="link" onPress={() => Linking.openURL("https://carto.com/attribution/")}
      style={{ position: "absolute", left: 9, bottom: 7 }}>
      <Text style={{ fontSize: 9, color: c.textSecondary, backgroundColor: c.surface,
        paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, overflow: "hidden" }}>
        {ATTRIBUTION}
      </Text>
    </Pressable>
    {mapStatus !== "loaded" ? <View pointerEvents={mapError ? "auto" : "none"}
      style={{ position: "absolute", top: 52, left: 12, maxWidth: "70%", backgroundColor: c.surface,
        borderRadius: 10, padding: 8 }}>
      {mapError ? <>
        <Text style={[TYPE.caption, { color: c.danger || c.text }]}>
          {tr ? "Android Leaflet haritası yüklenemedi" : "Android Leaflet map failed"}: {mapError}
        </Text>
        <Pressable onPress={() => { readyRef.current = false; setMapStatus("loading"); setMapError(""); setRetry((n) => n + 1); }}>
          <Text style={[TYPE.label, { color: c.primary }]}>{tr ? "Tekrar dene →" : "Retry →"}</Text>
        </Pressable>
      </> : <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <ActivityIndicator size="small" color={c.primary}/>
        <Text style={[TYPE.micro, { color: c.text }]}>
          {webReady ? (tr ? "Harita döşemeleri bekleniyor" : "Waiting for map tiles")
                    : (tr ? "Leaflet yükleniyor" : "Loading Leaflet")}
        </Text>
      </View>}
    </View> : null}
  </View>;
}
