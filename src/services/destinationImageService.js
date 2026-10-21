// Optional city photographs: public Wikipedia thumbnail; keep the Figma's
// bundled Cappadocia/Rome photographs and user's own image as higher priority.
// Gracefully falls back to the previous colored icon if offline / not found.
const pendingByKey = new Map();
const ACCEPTABLE_IMAGE = /^https:\/\/upload\.wikimedia\.org\//i;

export function getDestinationImage(destination, language = 'tr') {
  const city = String(destination || '').split(/[,;\/]/)[0].trim().slice(0, 90);
  if (!city) return Promise.resolve(null);
  const key = `${language}:${city.toLocaleLowerCase('tr-TR')}`;
  if (pendingByKey.has(key)) return pendingByKey.get(key);
  const task = (async () => {
    for (const lang of [language === 'en' ? 'en' : 'tr', language === 'en' ? 'tr' : 'en']) {
      try {
        const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city.replace(/\s+/g, '_'))}`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) continue;
        const result = await response.json();
        const photo = result?.thumbnail?.source;
        if (typeof photo === 'string' && ACCEPTABLE_IMAGE.test(photo)) return photo;
      } catch (_) { /* network is optional; retain safe Figma fallback */ }
    }
    return null;
  })();
  pendingByKey.set(key, task);
  return task;
}
