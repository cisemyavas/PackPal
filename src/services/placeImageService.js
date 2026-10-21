
const cache = new Map();

const CITY_NAMES = {
  istanbul: "İstanbul",
  budapeste: "Budapest",
  budapeste: "Budapest",
  budapeşte: "Budapest",
  paris: "Paris",
  londra: "London",
  london: "London",
  ankara: "Ankara",
  izmir: "İzmir",
  antalya: "Antalya",
  berlin: "Berlin",
  amsterdam: "Amsterdam",
  prag: "Prague",
  prague: "Prague",
  barselona: "Barcelona",
  barcelona: "Barcelona",
  newyork: "New York City",
  "new york": "New York City",
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR");
}

export async function getPlaceImage(destination) {
  const name = String(destination || "").trim();
  if (!name) return null;

  const key = normalize(name);

  if (cache.has(key)) {
    return cache.get(key);
  }

  const title = CITY_NAMES[key] || name;

  try {
    const url =
      "https://en.wikipedia.org/w/api.php?" +
      new URLSearchParams({
        action: "query",
        titles: title,
        redirects: "1",
        prop: "pageimages",
        pithumbsize: "1000",
        format: "json",
        origin: "*",
      }).toString();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Wikipedia request failed");
    }

    const data = await response.json();
    const pages = Object.values(data?.query?.pages || {});
    const image = pages[0]?.thumbnail?.source || null;

    if (image) cache.set(key, image);

    return image;
  } catch (error) {
    console.warn("Place image unavailable:", error.message);
    return null;
  }
}
