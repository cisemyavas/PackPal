const GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search";

const FORECAST_URL =
  "https://api.open-meteo.com/v1/forecast";

const DAY_MS = 24 * 60 * 60 * 1000;

// Tarihler YYYY-MM-DD biçiminde olmalı.
function parseDateOnly(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new Error(
      "Seyahat tarihleri YYYY-MM-DD biçiminde olmalıdır."
    );
  }

  const timestamp = Date.parse(
    `${value}T00:00:00Z`
  );

  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value
  ) {
    throw new Error("Geçersiz seyahat tarihi.");
  }

  return timestamp;
}

export async function getWeatherForDestination(
  destination,
  startDate,
  endDate,
  { signal } = {}
) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (end < start) {
    throw new Error(
      "Bitiş tarihi başlangıç tarihinden önce olamaz."
    );
  }

  if (
    typeof destination !== "string" ||
    !destination.trim()
  ) {
    throw new Error("Seyahat konumu eksik.");
  }

  const totalDays =
    Math.round((end - start) / DAY_MS) + 1;

  // 1. Şehir adını koordinatlara dönüştür.
  const geocodingUrl =
    `${GEOCODING_URL}` +
    `?name=${encodeURIComponent(destination.trim())}` +
    `&count=1`;

  const geocodingResponse = await fetch(
    geocodingUrl,
    { signal }
  );

  if (!geocodingResponse.ok) {
    throw new Error(
      "Konum bilgisi alınamadı. Lütfen tekrar deneyin."
    );
  }

  const geocodingData =
    await geocodingResponse.json();

  const place = geocodingData.results?.[0];

  if (!place) {
    return {
      found: false,
      location: null,
      forecast: [],
      totalDays,
      missingDays: totalDays,
    };
  }

  const location = {
    name: place.name,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
  };

  // 2. Mevcut tahmin penceresini al.
  // timezone=auto: günler gidilecek konumun saat dilimine göre gelir.
  const forecastUrl =
    `${FORECAST_URL}` +
    `?latitude=${place.latitude}` +
    `&longitude=${place.longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&forecast_days=16` +
    `&timezone=auto`;

  const forecastResponse = await fetch(
    forecastUrl,
    { signal }
  );

  if (!forecastResponse.ok) {
    throw new Error(
      "Hava durumu alınamadı. Lütfen tekrar deneyin."
    );
  }

  const forecastData =
    await forecastResponse.json();

  const daily = forecastData.daily;

  // Bozuk yanıtı "tahmin henüz yok" durumuyla karıştırma.
  if (!Array.isArray(daily?.time)) {
    throw new Error(
      "Hava durumu servisi geçerli bir yanıt vermedi."
    );
  }

  // 3. Önce değerleri kendi tarihleriyle eşleştir.
  // Sonra yalnızca seyahat tarihlerini seç.
  const forecast = daily.time
    .map((date, index) => ({
      date,
      maxTemperature:
        daily.temperature_2m_max?.[index] ?? null,
      minTemperature:
        daily.temperature_2m_min?.[index] ?? null,
      weatherCode:
        daily.weather_code?.[index] ?? null,
    }))
    .filter(
      (day) =>
        day.date >= startDate &&
        day.date <= endDate
    )
    .filter(
      (day) =>
        Number.isFinite(day.maxTemperature) &&
        Number.isFinite(day.minTemperature) &&
        Number.isFinite(day.weatherCode)
    );

  return {
    found: true,
    location,
    forecast,
    totalDays,
    missingDays: totalDays - forecast.length,
  };
}

// Mevcut getWeatherInfo fonksiyonun burada kalacak.

export function getWeatherInfo(code) {
  if (code === 0) {
    return {
      text: "Clear",
      icon: "sunny-outline",
    };
  }

  if ([1, 2, 3].includes(code)) {
    return {
      text: "Cloudy",
      icon: "cloud-outline",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      text: "Fog",
      icon: "cloud-outline",
    };
  }

  if (
    [51, 53, 55, 56, 57].includes(code)
  ) {
    return {
      text: "Drizzle",
      icon: "rainy-outline",
    };
  }

  if (
    [61, 63, 65, 66, 67].includes(code)
  ) {
    return {
      text: "Rain",
      icon: "rainy-outline",
    };
  }

  if (
    [71, 73, 75, 77].includes(code)
  ) {
    return {
      text: "Snow",
      icon: "snow-outline",
    };
  }

  if ([80, 81, 82].includes(code)) {
    return {
      text: "Rain showers",
      icon: "rainy-outline",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      text: "Thunderstorm",
      icon: "thunderstorm-outline",
    };
  }

  return {
    text: "Unknown",
    icon: "help-circle-outline",
  };
}