const GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search";

const FORECAST_URL =
  "https://api.open-meteo.com/v1/forecast";

// ==========================================
// WEATHER FOR DESTINATION
// ==========================================

export async function getWeatherForDestination(
  destination
) {
  // ==========================================
  // 1. DESTINATION -> COORDINATES
  // ==========================================

  const geocodingUrl =
    `${GEOCODING_URL}` +
    `?name=${encodeURIComponent(destination)}` +
    `&count=1`;

  const geocodingResponse =
    await fetch(geocodingUrl);

  if (!geocodingResponse.ok) {
    throw new Error(
      "Geocoding request failed."
    );
  }

  const geocodingData =
    await geocodingResponse.json();

  // Destination bulunamadı
  if (
    !geocodingData.results ||
    geocodingData.results.length === 0
  ) {
    return {
      found: false,
      location: null,
      forecast: [],
    };
  }

  const location =
    geocodingData.results[0];

  const {
    latitude,
    longitude,
    name,
    country,
  } = location;

  // ==========================================
  // 2. COORDINATES -> FORECAST
  // ==========================================

  const forecastUrl =
    `${FORECAST_URL}` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=auto`;

  const forecastResponse =
    await fetch(forecastUrl);

  if (!forecastResponse.ok) {
    throw new Error(
      "Weather request failed."
    );
  }

  const forecastData =
    await forecastResponse.json();

  const daily =
    forecastData.daily;

  // ==========================================
  // EMPTY RESPONSE
  // ==========================================

  if (
    !daily ||
    !Array.isArray(daily.time) ||
    daily.time.length === 0
  ) {
    return {
      found: true,

      location: {
        name,
        country,
        latitude,
        longitude,
      },

      forecast: [],
    };
  }

  // ==========================================
  // FIRST 3 DAYS
  // ==========================================

  const forecast =
    daily.time
      .slice(0, 3)
      .map((date, index) => ({
        date,

        maxTemperature:
          daily.temperature_2m_max?.[
            index
          ] ?? null,

        minTemperature:
          daily.temperature_2m_min?.[
            index
          ] ?? null,

        weatherCode:
          daily.weather_code?.[
            index
          ] ?? null,
      }));

  return {
    found: true,

    location: {
      name,
      country,
      latitude,
      longitude,
    },

    forecast,
  };
}

// ==========================================
// WEATHER CODE -> TEXT + ICON
// ==========================================

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