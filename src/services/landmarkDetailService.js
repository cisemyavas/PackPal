// PackPal discovery details: Wikipedia article extracts and Wikimedia thumbnails.
// Only article IDs/links already returned by PackPal's landmark search are used.
// No GPS coordinates or personal information are sent by this service.
const DETAILS_TTL_MS = 30 * 60 * 1000;
const detailsCache = new Map();

function wikipediaArticle(landmark, requestedLanguage) {
  const url = String(landmark?.url || "");
  // Wikipedia GeoSearch supplies a Turkish interlanguage article link when one exists.
  // Otherwise show the English original rather than inventing a translation.
  const hasTurkishArticle = url.startsWith("https://tr.wikipedia.org/wiki/");
  const useTurkish = requestedLanguage === "tr" && hasTurkishArticle;
  const lang = useTurkish ? "tr" : "en";
  const pageId = String(landmark?.id || "").match(/^wikipedia:en:(\d+)$/)?.[1];

  let title = "";
  if (useTurkish) {
    try {
      title = decodeURIComponent(url.split("/wiki/")[1] || "").replace(/_/g, " ");
    } catch (_) {
      title = "";
    }
  } else if (!pageId) {
    // Used for the pre-existing featured Galata card, which has no GeoSearch page ID.
    const englishUrl = url.startsWith("https://en.wikipedia.org/wiki/") ? url : "";
    try {
      title = decodeURIComponent(englishUrl.split("/wiki/")[1] || "").replace(/_/g, " ");
    } catch (_) {
      title = "";
    }
  }
  if (!pageId && !title) throw new Error("Wikipedia article identifier missing");
  return { lang, pageId: useTurkish ? null : pageId, title };
}

function articleUrl(lang, title) {
  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

export async function fetchLandmarkDetails(landmark, requestedLanguage = "tr", signal) {
  const article = wikipediaArticle(landmark, requestedLanguage);
  const cacheKey = `${article.lang}:${article.pageId || article.title}`;
  const saved = detailsCache.get(cacheKey);
  if (saved && Date.now() - saved.at < DETAILS_TTL_MS) return saved.value;

  const params = [
    ["action", "query"],
    ["prop", "extracts|pageimages"],
    ["explaintext", "1"],
    ["exintro", "1"],
    ["piprop", "thumbnail"],
    ["pithumbsize", "900"],
    ["redirects", "1"],
    ["format", "json"],
    ["formatversion", "2"],
    article.pageId ? ["pageids", article.pageId] : ["titles", article.title],
  ];
  const endpoint = `https://${article.lang}.wikipedia.org/w/api.php?` +
    params.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");

  const response = await fetch(endpoint, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`Wikipedia HTTP ${response.status}`);
  const payload = await response.json();
  if (payload?.error) throw new Error(`Wikipedia ${payload.error.code || "API error"}`);
  const pages = payload?.query?.pages;
  const page = (Array.isArray(pages) ? pages : Object.values(pages || {}))
    .find((item) => item && item.missing === undefined && item.invalid === undefined);
  if (!page || !page.title) throw new Error("Wikipedia article not found");

  const result = {
    title: String(page.title),
    // Extracts are plain text; never render Wikipedia markup or HTML directly.
    description: String(page.extract || "").trim(),
    imageUrl: typeof page.thumbnail?.source === "string" &&
      page.thumbnail.source.startsWith("https://") ? page.thumbnail.source : null,
    sourceUrl: articleUrl(article.lang, String(page.title)),
    sourceLanguage: article.lang,
  };
  // Keep the cache small and memory-only. Do not store user GPS or photos locally.
  if (detailsCache.size >= 40) detailsCache.delete(detailsCache.keys().next().value);
  detailsCache.set(cacheKey, { at: Date.now(), value: result });
  return result;
}
