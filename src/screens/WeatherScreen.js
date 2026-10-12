import { useTheme } from "../context/ThemeContext";

import {
  AppState,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  Ionicons,
} from "@expo/vector-icons";

import useTrips from "../hooks/useTrips";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

import {
  getWeatherForDestination,
  getWeatherInfo,
} from "../services/weatherApi";

// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(date) {
  const value = new Date(
    `${date}T00:00:00`
  );

  return value.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  );
}

// ==========================================
// WEATHER SCREEN
// ==========================================

export default function WeatherScreen({ route }) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const { trips } = useTrips();

  const { tripId } = route.params || {};

  const trip = trips.find(
    (item) => item.id === tripId
  );

  const destination = trip?.destination;
  const startDate = trip?.startDate;
  const endDate = trip?.endDate;

  // ==========================================
  // STATES
  // ==========================================

  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [destinationFound, setDestinationFound] =
    useState(true);

  const [missingDays, setMissingDays] = useState(0);

  // ==========================================
  // REFS
  // ==========================================

  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);

  // ==========================================
  // LOAD WEATHER
  // ==========================================

  const loadWeather = useCallback(async () => {
    // Önceki isteğin daha sonra gelip
    // yeni veriyi ezmesini önle.

    const requestId = ++requestIdRef.current;

    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);
    setDestinationFound(true);
    setForecast([]);
    setLocation(null);
    setMissingDays(0);

    try {
      const result = await getWeatherForDestination(
        destination,
        startDate,
        endDate,
        { signal: controller.signal }
      );

      if (
        controller.signal.aborted ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      setDestinationFound(result.found);
      setLocation(result.location);
      setForecast(result.forecast);
      setMissingDays(result.missingDays);

    } catch (err) {
      if (
        controller.signal.aborted ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Hava durumu alınamadı. Lütfen tekrar deneyin."
      );

    } finally {
      if (
        !controller.signal.aborted &&
        requestId === requestIdRef.current
      ) {
        setLoading(false);
      }
    }

  }, [tripId, destination, startDate, endDate]);

  // ==========================================
  // SCREEN FOCUS AND AUTO REFRESH
  // ==========================================

  useFocusEffect(
    useCallback(() => {
      if (!destination) {
        setLoading(false);
        return;
      }

      void loadWeather();

      let previousState = AppState.currentState;

      const subscription = AppState.addEventListener(
        "change",
        (nextState) => {
          const returnedToApp =
            nextState === "active" &&
            previousState !== "active";

          previousState = nextState;

          if (returnedToApp) {
            void loadWeather();
          }
        }
      );

      const intervalId = setInterval(() => {
        if (AppState.currentState === "active") {
          void loadWeather();
        }
      }, 30 * 60 * 1000);

      return () => {
        subscription.remove();
        clearInterval(intervalId);

        ++requestIdRef.current;
        controllerRef.current?.abort();
      };

    }, [destination, loadWeather])
  );

  // ==========================================
  // ERROR AND LOADING STATES
  // ==========================================

  if (!trip) {
    return (
      <ErrorMessage
        message="Trip not found."
      />
    );
  }

  if (loading) {
    return (
      <Loading message="Checking the weather..." />
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadWeather}
      />
    );
  }

  if (!destinationFound) {
    return (
      <ErrorMessage
        message="Destination could not be found."
      />
    );
  }

  // ==========================================
  // MAIN SCREEN
  // ==========================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={["bottom"]}
    >
      <FlatList
        data={forecast}
        keyExtractor={(item) =>
          item.date
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.list
        }

        ListHeaderComponent={
          <View>
            <View
              style={
                styles.heroCard
              }
            >
              <View
                style={
                  styles.heroIcon
                }
              >
                <Ionicons
                  name="partly-sunny-outline"
                  size={32}
                  color={
                    COLORS.primary
                  }
                />
              </View>

              <Text
                style={
                  styles.destination
                }
              >
                {trip.destination}
              </Text>

              {location && (
                <View
                  style={
                    styles.locationRow
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color={
                      COLORS.textSecondary
                    }
                  />

                  <Text
                    style={
                      styles.location
                    }
                  >
                    {location.name}
                    {location.country
                      ? `, ${location.country}`
                      : ""}
                  </Text>
                </View>
              )}

              <View
                style={
                  styles.forecastLabel
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={
                    COLORS.primary
                  }
                />

                <Text
                  style={
                    styles.forecastLabelText
                  }
                >
                  {formatDate(startDate)} – {formatDate(endDate)}
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Weather forecast
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Check the weather before
              finishing your packing list.
            </Text>

            {forecast.length > 0 && missingDays > 0 && (
              <Text style={styles.sectionSubtitle}>
                Seyahatinizin {missingDays} günü için tahmin
                bulunmuyor. Mevcut günlerin tahminleri aşağıda
                gösteriliyor.
              </Text>
            )}
          </View>
        }

        // ==========================================
        // WEATHER CARDS
        // ==========================================

        renderItem={({ item }) => {
          const weather =
            getWeatherInfo(
              item.weatherCode
            );

          return (
            <View
              style={styles.card}
            >
              <View
                style={
                  styles.weatherIconBox
                }
              >
                <Ionicons
                  name={
                    weather.icon
                  }
                  size={27}
                  color={
                    COLORS.primary
                  }
                />
              </View>

              <View
                style={
                  styles.dayInfo
                }
              >
                <Text
                  style={
                    styles.date
                  }
                >
                  {formatDate(
                    item.date
                  )}
                </Text>

                <Text
                  style={
                    styles.weatherText
                  }
                >
                  {weather.text}
                </Text>
              </View>

              <View
                style={
                  styles.temperature
                }
              >
                <Text
                  style={
                    styles.maxTemp
                  }
                >
                  {item.maxTemperature !== null
                    ? `${item.maxTemperature}°`
                    : "-"}
                </Text>

                <Text
                  style={
                    styles.minTemp
                  }
                >
                  {item.minTemperature !== null
                    ? `${item.minTemperature}°`
                    : "-"}
                </Text>
              </View>
            </View>
          );
        }}

        // ==========================================
        // EMPTY STATE
        // ==========================================

        ListEmptyComponent={
          <EmptyState
            icon="cloud-offline-outline"
            title="Hava durumu tahmini bulunmuyor"
            message="Bu tarih aralığı için güncel tahmin mevcut değil. Gelecek tarihler için seyahatiniz yaklaştığında tekrar kontrol edin; bu ekran açıldığında tahminler otomatik yenilenir."
          />
        }
      />
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================

function createStyles(COLORS) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  list: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 36,
  },

  heroCard: {
    padding: 22,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  destination: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.4,
  },

  locationRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  location: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  forecastLabel: {
    marginTop: 17,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  forecastLabelText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },

  sectionTitle: {
    marginTop: 26,
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },

  card: {
    minHeight: 92,
    padding: 15,
    marginBottom: 10,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  weatherIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  dayInfo: {
    flex: 1,
  },

  date: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  weatherText: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  temperature: {
    minWidth: 55,
    alignItems: "flex-end",
  },

  maxTemp: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.text,
  },

  minTemp: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
}
