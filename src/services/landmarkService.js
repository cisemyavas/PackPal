// PackPal foreground discovery: Wikipedia GeoSearch (no native dependencies).
// GeoSearch identifies nearby *articles*, not necessarily notable physical sites.
// A category/type filter is therefore required; no business recommendations.
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const SEARCH_RADIUS_METERS = 1200;
export const ALERT_RADIUS_METERS = 1000;

// In-memory only: neither precise GPS coordinates nor search results are persisted.
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_REUSE_RADIUS_METERS = 250;
const ERROR_RETRY_DELAY_MS = 30 * 1000;
let nearbyCache = null;
let retryAfter = 0;

export function distanceMeters(a, b) {
  if (!a || !b) return Infinity;
  const lat1 = Number(a.latitude);
  const lng1 = Number(a.longitude);
  const lat2 = Number(b.latitude);
  const lng2 = Number(b.longitude);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return Infinity;
  const toRad = (degrees) => degrees * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(Math.min(1, h)), Math.sqrt(Math.max(0, 1 - h)));
}

// Prefer conservative exclusions to avoid notifying about businesses and events.
const EXCLUDED_TITLE = /\b(?:hotels?|hostels?|restaurants?|cafes?|cafés?|pubs?|nightclubs?|shopping malls?|department stores?|massacres?|battles?|world.s fairs?|expositions?|exhibitions?|disasters?|airports?|railway stations?|metro stations?|universities|schools?)\b/i;
const EXCLUDED_CATEGORY = /\b(?:hotels?|hostels?|restaurants?|cafes?|cafés?|pubs?|shopping malls?|massacres?|battles?|disasters?|demolished structures|destroyed buildings|defunct buildings|railway stations|airports)\b/i;
const LANDMARK_CATEGORY = /\b(?:landmarks?|tourist attractions?|visitor attractions?|museums?|art galleries?|historic (?:sites?|buildings?|monuments?|houses?)|cultural heritage|world heritage sites?|monuments?|memorials?|towers?|bridges?|cathedrals?|churches?|chapels?|mosques?|temples?|basilicas?|castles?|palaces?|fortresses?|forts?|archaeological sites?|archaeology|ruins?|sculptures?|statues?|fountains?|triumphal arches?|abbeys|sanctuaries|gardens?|parks?|public squares?|city walls|opera houses|theatre buildings)\b/i;
const LANDMARK_TITLE = /\b(?:tower|museum|musée|museo|museu|monument|memorial|palace|palazzo|castle|cathedral|church|basilica|mosque|temple|bridge|pont|arch|arc de triomphe)\b/i;

function classifyArticle(page) {
  if (!page || page.ns !== 0 || page.missing !== undefined) return null;
  const title = String(page.title || "").trim();
  if (!title || EXCLUDED_TITLE.test(title)) return null;
  const categories = (page.categories || []).map((entry) => String(entry.title || "").replace(/^Category:/i, ""));
  if (categories.some((category) => EXCLUDED_CATEGORY.test(category))) return null;
  const matched = categories.filter((category) => LANDMARK_CATEGORY.test(category));
  // GeoSearch alone is not a landmark classifier. A strongly descriptive title
  // can serve as a fallback if category metadata is absent/incomplete.
  if (matched.length === 0 && !LANDMARK_TITLE.test(title)) return null;
  const all = `${title} ${matched.join(" ")}`;
  let category = "landmark";
  if (/\b(?:museums?|musée|museo|museu)\b/i.test(all)) category = "museum";
  else if (/\b(?:galler(?:y|ies))\b/i.test(all)) category = "gallery";
  else if (/\b(?:archaeolog|ruins?)\b/i.test(all)) category = "archaeology";
  else if (/\b(?:castle|palace|palazzo|fortress)\b/i.test(all)) category = "castle";
  else if (/\b(?:historic|heritage|monument|memorial)\b/i.test(all)) category = "historic";
  return { category, score: Math.min(matched.length, 5) + (page.pageprops?.wikibase_item ? 1 : 0) };
}

function articleLink(language, page) {
  const link = (page.langlinks || []).find((entry) => entry.lang === "tr");
  const localizedTitle = link?.["*"] || link?.title;
  if (language === "tr" && localizedTitle) {
    return {
      name: localizedTitle,
      url: `https://tr.wikipedia.org/wiki/${encodeURIComponent(localizedTitle.replace(/ /g, "_"))}`,
    };
  }
  const title = String(page.title);
  return {
    name: title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
  };
}

function selectLandmarks(pages, latitude, longitude, language) {
  const nearby = [];
  for (const page of pages) {
    const type = classifyArticle(page);
    if (!type) continue;
    const point = (page.coordinates || []).find((coord) => Number.isFinite(Number(coord.lat)) && Number.isFinite(Number(coord.lon)));
    if (!point) continue;
    const lat = Number(point.lat);
    const lon = Number(point.lon);
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    const distance = distanceMeters({ latitude, longitude }, { latitude: lat, longitude: lon });
    if (distance > SEARCH_RADIUS_METERS + 100) continue;
    const article = articleLink(language, page);
    nearby.push({
      id: `wikipedia:en:${page.pageid}`,
      name: article.name,
      latitude: lat,
      longitude: lon,
      category: type.category,
      score: type.score,
      distance,
      url: article.url,
      source: "Wikipedia",
    });
  }
  // Keep higher-confidence articles, then closer results; don't invent landmarks.
  nearby.sort((a, b) => b.score - a.score || a.distance - b.distance);
  return nearby.slice(0, 35);
}

export async function fetchSignificantLandmarks(latitude, longitude, language = "tr", signal) {
  if (![latitude, longitude].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error("Invalid GPS coordinates");
  }
  if (signal?.aborted) {
    const error = new Error("Request aborted");
    error.name = "AbortError";
    throw error;
  }
  const position = { latitude, longitude };
  const now = Date.now();
  const reusable = nearbyCache &&
    distanceMeters(position, nearbyCache.position) <= CACHE_REUSE_RADIUS_METERS;
  if (reusable && now - nearbyCache.fetchedAt < CACHE_TTL_MS) {
    return selectLandmarks(nearbyCache.pages, latitude, longitude, language);
  }
  if (now < retryAfter) throw new Error("Wikipedia temporarily unavailable (retry later)");

  // Request page coordinates and categories together with nearby article hits.
  // English Wikipedia is used for broad coverage; Turkish article names are
  // included via langlinks where available.
  const params = [
    ["action", "query"], ["generator", "geosearch"],
    ["ggscoord", `${latitude.toFixed(5)}|${longitude.toFixed(5)}`],
    ["ggsradius", String(SEARCH_RADIUS_METERS)], ["ggslimit", "50"],
    ["prop", "coordinates|categories|langlinks|pageprops"],
    ["cllimit", "500"], ["lllang", "tr"], ["lllimit", "max"],
    ["format", "json"], ["formatversion", "2"],
  ];
  const url = WIKIPEDIA_API + "?" + params.map(([key, value]) =>
    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
  Accept: "application/json",
  "User-Agent": "PackPal/0.1 (https://github.com/KENDI_KULLANICI_ADIN)",
  "Api-User-Agent": "PackPal/0.1 (https://github.com/KENDI_KULLANICI_ADIN)"
},
      signal,
    });
    if (!response.ok) throw new Error(`Wikipedia HTTP ${response.status}`);
    const data = await response.json();
    if (data?.error) throw new Error(`Wikipedia API ${data.error.code || "error"}`);
    if (!data?.query) throw new Error("Unexpected Wikipedia response");
    const pages = Array.isArray(data.query.pages) ? data.query.pages : Object.values(data.query.pages || {});
    if (signal?.aborted) {
      const error = new Error("Request aborted");
      error.name = "AbortError";
      throw error;
    }
    nearbyCache = { position, fetchedAt: Date.now(), pages };
    retryAfter = 0;
    return selectLandmarks(pages, latitude, longitude, language === "en" ? "en" : "tr");
  } catch (error) {
    if (error?.name !== "AbortError") {
      retryAfter = Date.now() + ERROR_RETRY_DELAY_MS;
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.warn("[PackPal landmarks]", error?.message || String(error));
      }
    }
    throw error;
  }
}
