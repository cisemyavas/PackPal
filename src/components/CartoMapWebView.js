import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { useTheme } from "../context/ThemeContext";
import { TYPE } from "../constants/typography";

const GALATA = [28.9739, 41.0256]; // longitude, latitude
const CARTO_KEY = (process.env.EXPO_PUBLIC_CARTO_BASEMAP_KEY || "").trim();
const HAS_KEY = Boolean(CARTO_KEY && CARTO_KEY !== "YOUR_CARTO_KEY");
const ATTRIBUTION = "© OpenStreetMap contributors · © CARTO";

/** Self-contained WebGL map, using CARTO vector styles and MapLibre GL JS. */
function buildMapHtml(styleUrl, tr) {
  const title = tr ? "Galata Kulesi" : "Galata Tower";
  const style = JSON.stringify(styleUrl);
  const markerLabel = JSON.stringify(title);
  return `<!DOCTYPE html>
<html lang="${tr ? "tr" : "en"}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
<style>
html,body,#map { width:100%;height:100%;margin:0;padding:0;overflow:hidden; }
html,body { touch-action:none; }
.marker { height:40px;width:40px; border:2px solid #fff; border-radius:14px;
  display:flex;align-items:center;justify-content:center; background:#7950f2;
  box-shadow:0 3px 12px rgba(0,0,0,.25); color:#fff;font:24px system-ui; cursor:pointer; }
.user-dot { width:15px;height:15px;border-radius:50%;border:3px solid #fff;
  box-sizing:border-box;background:#4a9cf6;box-shadow:0 1px 8px rgba(0,0,0,.3); }
.maplibregl-control-container { display:none; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<script>
(function () {
  function send(type, extra) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({type:type},extra||{})));
    }
  }
  if (!window.maplibregl || !window.maplibregl.supported()) {
    send('error',{reason:'MapLibre GL JS / WebGL is not available'});return;
  }
  try {
    var map = new maplibregl.Map({
      container: 'map', style: ${style}, center: [${GALATA[0]},${GALATA[1]}],
      zoom:14.5, minZoom:2, maxZoom:19, attributionControl:false, dragRotate:false,
      pitchWithRotate:false
    });
    var element = document.createElement('button');
    element.type='button'; element.className='marker'; element.textContent='⌖';
    element.setAttribute('aria-label',${markerLabel});
    element.addEventListener('click',function(){send('place',{id:'galata'});});
    new maplibregl.Marker({element:element,anchor:'bottom'})
      .setLngLat([${GALATA[0]},${GALATA[1]}]).addTo(map);
    var userMarker = null;
    window.packpalFlyTo = function(lng,lat,isUser) {
      if (!map) return;
      map.flyTo({center:[lng,lat],zoom:15.5,essential:true,duration:650});
      if (isUser) {
        if (!userMarker) {
          var dot=document.createElement('div'); dot.className='user-dot';
          userMarker=new maplibregl.Marker({element:dot}).setLngLat([lng,lat]).addTo(map);
        } else {userMarker.setLngLat([lng,lat]);}
      }
    };
    map.on('load',function(){send('loaded');});
    var reported=false;
    map.on('error',function(event){
      if(!reported){reported=true;send('error',{reason:String(event.error && event.error.message || 'Tile loading error')});}
    });
  } catch(e) {send('error',{reason:String(e && e.message || e)});}
})();
</script>
</body>
</html>`;
}

function IconButton({ onPress, name, label, color, backgroundColor, disabled }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label}
      onPress={onPress} disabled={disabled}
      style={{ height:42,width:42,borderRadius:15,backgroundColor,
        alignItems:"center",justifyContent:"center",marginBottom:8,opacity:disabled?0.5:1 }}>
      <Ionicons name={name} size={22} color={color} />
    </Pressable>
  );
}

/** Interactive CARTO map for iPhone Expo Go, with no custom native modules. */
export default function CartoMapWebView({ onSelectPlace, mapHeight = 268 }) {
  const { colors:c, resolvedMode, language } = useTheme();
  const tr = language !== "en";
  const webRef = useRef(null);
  const [locating,setLocating] = useState(false);
  const [mapError,setMapError] = useState("");
  const [reloadKey,setReloadKey] = useState(0);

  const styleUrl = useMemo(() => {
    if (!HAS_KEY) return "";
    const name = resolvedMode === "dark" ? "dark-matter" : "positron";
    return `https://basemaps.cartocdn.com/gl/${name}-gl-style/style.json?key=${encodeURIComponent(CARTO_KEY)}`;
  }, [resolvedMode]);
  const html = useMemo(() => buildMapHtml(styleUrl,tr), [styleUrl,tr]);

  const flyTo = useCallback((lng,lat,isUser=false) => {
    if (!webRef.current) return;
    // lng/lat are numeric coordinates (never raw user-provided strings).
    webRef.current.injectJavaScript(
      `window.packpalFlyTo && window.packpalFlyTo(${Number(lng)},${Number(lat)},${Boolean(isUser)}); true;`
    );
  }, []);

  function focusGalata() {
    flyTo(GALATA[0],GALATA[1]);
    onSelectPlace?.("galata");
  }

  async function locateMe() {
    if (locating) return;
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(tr ? "Konum izni gerekli" : "Location permission needed",
          tr ? "Konumunu göstermek için izin verebilirsin. Haritayı izinsiz de kullanabilirsin."
             : "Allow location access to show your position. The map works without it.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
      flyTo(location.coords.longitude,location.coords.latitude,true);
    } catch(e) {
      Alert.alert(tr ? "Konum alınamadı" : "Could not get location",
        e?.message || (tr ? "Tekrar dene." : "Try again."));
    } finally {setLocating(false);}
  }

  function handleMessage(event) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "place" && msg.id === "galata") onSelectPlace?.("galata");
      if (msg.type === "loaded") setMapError("");
      if (msg.type === "error") setMapError(tr
        ? "Harita yüklenemedi. İnternet ve CARTO anahtarını kontrol et."
        : "Map couldn't load. Check your connection and CARTO key.");
    } catch (_e) { /* Ignore messages that do not follow the map protocol. */ }
  }

  if (!styleUrl) {
    return <View style={{height:mapHeight,backgroundColor:c.surfaceAlt,borderRadius:24,
      justifyContent:"center",alignItems:"center",paddingHorizontal:24,gap:12}}>
      <Ionicons name="map-outline" size={36} color={c.primary}/>
      <Text style={[TYPE.subtitle,{color:c.text,textAlign:"center"}]}>
        {tr ? "CARTO haritası hazır" : "CARTO map is ready"}
      </Text>
      <Text style={[TYPE.caption,{color:c.textSecondary,textAlign:"center"}]}>
        {tr ? "Haritayı açmak için .env.local dosyasına EXPO_PUBLIC_CARTO_BASEMAP_KEY ekle."
           : "Set EXPO_PUBLIC_CARTO_BASEMAP_KEY in .env.local to open the map."}
      </Text>
    </View>;
  }

  return <View style={{height:mapHeight,borderRadius:24,overflow:"hidden",backgroundColor:c.surfaceAlt}}>
    <WebView
      key={`${resolvedMode}-${reloadKey}`}
      ref={webRef}
      originWhitelist={["*"]}
      source={{html}}
      style={{flex:1,backgroundColor:c.surfaceAlt}}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      bounces={false}
      onMessage={handleMessage}
      onError={() => setMapError(tr ? "Harita açılmadı. İnternet bağlantını kontrol et." : "Map failed to load. Check your internet.")}
      mixedContentMode="never"
      allowsInlineMediaPlayback
    />
    <View pointerEvents="box-none" style={{position:"absolute",top:12,right:12}}>
      <IconButton name={locating?"hourglass-outline":"locate-outline"}
        label={tr?"Konumuma git":"Find my location"} disabled={locating}
        onPress={locateMe} color={c.primary} backgroundColor={c.surface}/>
      <IconButton name="compass-outline" label={tr?"Galata Kulesi'ne dön":"Back to Galata Tower"}
        onPress={focusGalata} color={c.primary} backgroundColor={c.surface}/>
    </View>
    <Pressable accessibilityRole="button" onPress={focusGalata}
      style={{position:"absolute",left:12,bottom:38,backgroundColor:c.surface,
        paddingHorizontal:11,paddingVertical:7,borderRadius:13}}>
      <Text style={[TYPE.micro,{color:c.primary}]}>{tr?"Galata Kulesi":"Galata Tower"}</Text>
    </Pressable>
    <Pressable accessibilityRole="link" onPress={() => Linking.openURL("https://carto.com/attribution/")}
      style={{position:"absolute",left:9,right:9,bottom:7,alignItems:"flex-start"}}>
      <Text style={{fontSize:9,color:c.textSecondary,backgroundColor:c.surface,borderRadius:4,
        overflow:"hidden",paddingHorizontal:4,paddingVertical:2}}>{ATTRIBUTION}</Text>
    </Pressable>
    {mapError ? <View style={{position:"absolute",top:64,left:12,right:64,
      backgroundColor:c.surface,borderRadius:12,padding:10,gap:6}}>
      <Text style={[TYPE.caption,{color:c.danger||c.text}]}>{mapError}</Text>
      <Pressable onPress={() => {setMapError("");setReloadKey(n=>n+1);}}>
        <Text style={[TYPE.label,{color:c.primary}]}>{tr?"Tekrar dene →":"Try again →"}</Text>
      </Pressable>
    </View> : null}
  </View>;
}
