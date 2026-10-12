import { useTheme } from "../context/ThemeContext";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useState,
} from "react";

import {
  Ionicons,
} from "@expo/vector-icons";

import useTrips from "../hooks/useTrips";

const TRIP_TYPES = [
  {
    key: "BEACH",
    label: "Beach",
    icon: "sunny-outline",
  },
  {
    key: "CITY",
    label: "City",
    icon: "business-outline",
  },
  {
    key: "BUSINESS",
    label: "Business",
    icon: "briefcase-outline",
  },
  {
    key: "CAMPING",
    label: "Camping",
    icon: "leaf-outline",
  },
  {
    key: "WINTER",
    label: "Winter",
    icon: "snow-outline",
  },
];

export default function NewTripScreen({
  navigation,
}) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const { addTrip } = useTrips();

  const [destination, setDestination] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [tripType, setTripType] =
    useState(null);

  const [errors, setErrors] =
    useState({});

  // ==========================================
  // VALIDATION
  // ==========================================

  function validateForm() {
    const newErrors = {};

    const trimmedDestination =
      destination.trim();

    if (!trimmedDestination) {
      newErrors.destination =
        "Destination is required.";
    } else if (
      trimmedDestination.length < 2
    ) {
      newErrors.destination =
        "Destination must be at least 2 characters.";
    } else if (
      trimmedDestination.length > 60
    ) {
      newErrors.destination =
        "Destination cannot be longer than 60 characters.";
    }

    if (!startDate.trim()) {
      newErrors.startDate =
        "Start date is required.";
    }

    if (!endDate.trim()) {
      newErrors.endDate =
        "End date is required.";
    }

    if (
      startDate.trim() &&
      endDate.trim() &&
      endDate.trim() < startDate.trim()
    ) {
      newErrors.endDate =
        "End date cannot be earlier than start date.";
    }

    if (!tripType) {
      newErrors.tripType =
        "Please select a trip type.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  }

  // ==========================================
  // CREATE TRIP
  // ==========================================

  function handleCreateTrip() {
    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    addTrip({
      destination:
        destination.trim(),

      startDate:
        startDate.trim(),

      endDate:
        endDate.trim(),

      tripType,
    });

    navigation.popToTop();
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View
              style={styles.headerIcon}
            >
              <Ionicons
                name="airplane-outline"
                size={28}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.title}>
              Plan a new trip
            </Text>

            <Text
              style={styles.subtitle}
            >
              Tell PackPal where you're
              going and we'll prepare your
              packing list.
            </Text>
          </View>

          {/* FORM CARD */}

          <View style={styles.formCard}>
            {/* DESTINATION */}

            <Text style={styles.label}>
              Destination
            </Text>

            <View
              style={[
                styles.inputContainer,

                errors.destination &&
                  styles.inputContainerError,
              ]}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={
                  errors.destination
                    ? COLORS.danger
                    : COLORS.textMuted
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Example: Rome"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={destination}
                maxLength={61}
                onChangeText={(value) => {
                  setDestination(value);

                  if (
                    errors.destination
                  ) {
                    setErrors(
                      (current) => ({
                        ...current,
                        destination: null,
                      })
                    );
                  }
                }}
              />
            </View>

            {errors.destination && (
              <View
                style={
                  styles.errorRow
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={COLORS.danger}
                />

                <Text
                  style={
                    styles.errorText
                  }
                >
                  {errors.destination}
                </Text>
              </View>
            )}

            {/* DATE ROW */}

            <View
              style={styles.dateRow}
            >
              <View
                style={
                  styles.dateField
                }
              >
                <Text
                  style={styles.label}
                >
                  Start Date
                </Text>

                <View
                  style={[
                    styles.inputContainer,

                    errors.startDate &&
                      styles.inputContainerError,
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={19}
                    color={
                      errors.startDate
                        ? COLORS.danger
                        : COLORS.textMuted
                    }
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    value={startDate}
                    onChangeText={(
                      value
                    ) => {
                      setStartDate(
                        value
                      );

                      if (
                        errors.startDate
                      ) {
                        setErrors(
                          (current) => ({
                            ...current,
                            startDate:
                              null,
                          })
                        );
                      }

                      if (
                        errors.endDate
                      ) {
                        setErrors(
                          (current) => ({
                            ...current,
                            endDate:
                              null,
                          })
                        );
                      }
                    }}
                  />
                </View>

                {errors.startDate && (
                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    {errors.startDate}
                  </Text>
                )}
              </View>

              <View
                style={
                  styles.dateField
                }
              >
                <Text
                  style={styles.label}
                >
                  End Date
                </Text>

                <View
                  style={[
                    styles.inputContainer,

                    errors.endDate &&
                      styles.inputContainerError,
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={19}
                    color={
                      errors.endDate
                        ? COLORS.danger
                        : COLORS.textMuted
                    }
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    value={endDate}
                    onChangeText={(
                      value
                    ) => {
                      setEndDate(
                        value
                      );

                      if (
                        errors.endDate
                      ) {
                        setErrors(
                          (current) => ({
                            ...current,
                            endDate:
                              null,
                          })
                        );
                      }
                    }}
                  />
                </View>

                {errors.endDate && (
                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    {errors.endDate}
                  </Text>
                )}
              </View>
            </View>

            {/* TRIP TYPE */}

            <View
              style={
                styles.tripTypeHeader
              }
            >
              <View>
                <Text
                  style={styles.label}
                >
                  Trip Type
                </Text>

                <Text
                  style={
                    styles.helperText
                  }
                >
                  This determines your
                  suggested packing list.
                </Text>
              </View>
            </View>

            <View
              style={
                styles.tripTypes
              }
            >
              {TRIP_TYPES.map(
                (type) => {
                  const isSelected =
                    tripType ===
                    type.key;

                  return (
                    <Pressable
                      key={type.key}
                      style={({
                        pressed,
                      }) => [
                        styles.typeButton,

                        isSelected &&
                          styles.selectedTypeButton,

                        pressed &&
                          styles.pressedButton,
                      ]}
                      onPress={() => {
                        setTripType(
                          type.key
                        );

                        if (
                          errors.tripType
                        ) {
                          setErrors(
                            (current) => ({
                              ...current,
                              tripType:
                                null,
                            })
                          );
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.typeIcon,

                          isSelected &&
                            styles.selectedTypeIcon,
                        ]}
                      >
                        <Ionicons
                          name={
                            type.icon
                          }
                          size={21}
                          color={
                            isSelected
                              ? "#FFFFFF"
                              : COLORS.primary
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.typeText,

                          isSelected &&
                            styles.selectedTypeText,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>

            {errors.tripType && (
              <View
                style={
                  styles.errorRow
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={COLORS.danger}
                />

                <Text
                  style={
                    styles.errorText
                  }
                >
                  {errors.tripType}
                </Text>
              </View>
            )}
          </View>

          {/* CREATE BUTTON */}

          <Pressable
            style={({ pressed }) => [
              styles.createButton,

              pressed &&
                styles.pressedButton,
            ]}
            onPress={
              handleCreateTrip
            }
          >
            <Ionicons
              name="sparkles-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.createButtonText
              }
            >
              Create Trip
            </Text>

            <Ionicons
              name="arrow-forward"
              size={19}
              color="#FFFFFF"
            />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(COLORS) {
  return StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor:
      COLORS.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    alignItems: "center",

    marginBottom: 22,
  },

  headerIcon: {
    width: 56,
    height: 56,

    borderRadius: 18,

    backgroundColor:
      COLORS.primaryLight,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 12,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",

    color: COLORS.text,

    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 7,

    maxWidth: 310,

    fontSize: 14,

    lineHeight: 20,

    textAlign: "center",

    color:
      COLORS.textSecondary,
  },

  // ==========================================
  // FORM
  // ==========================================

  formCard: {
    backgroundColor:
      COLORS.surface,

    padding: 18,

    borderRadius: 20,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  label: {
    fontSize: 14,

    fontWeight: "700",

    color: COLORS.text,

    marginBottom: 8,

    marginTop: 14,
  },

  inputContainer: {
    minHeight: 50,

    paddingHorizontal: 13,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    borderRadius: 14,

    backgroundColor:
      COLORS.background,

    flexDirection: "row",
    alignItems: "center",

    gap: 9,
  },

  inputContainerError: {
    borderColor:
      COLORS.danger,

    backgroundColor:
      COLORS.dangerLight,
  },

  input: {
    flex: 1,

    minHeight: 48,

    fontSize: 15,

    color: COLORS.text,
  },

  dateRow: {
    flexDirection: "row",

    gap: 10,
  },

  dateField: {
    flex: 1,
  },

  helperText: {
    marginTop: -3,

    marginBottom: 10,

    fontSize: 12,

    color:
      COLORS.textMuted,
  },

  tripTypeHeader: {
    marginTop: 4,
  },

  // ==========================================
  // TRIP TYPES
  // ==========================================

  tripTypes: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 9,
  },

  typeButton: {
    minHeight: 74,

    width: "31%",

    flexGrow: 1,

    padding: 10,

    borderRadius: 15,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    backgroundColor:
      COLORS.background,

    alignItems: "center",
    justifyContent: "center",
  },

  selectedTypeButton: {
    backgroundColor:
      COLORS.primaryLight,

    borderColor:
      COLORS.primary,
  },

  typeIcon: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor:
      COLORS.primaryLight,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 6,
  },

  selectedTypeIcon: {
    backgroundColor:
      COLORS.primary,
  },

  typeText: {
    fontSize: 12,

    fontWeight: "700",

    color:
      COLORS.textSecondary,
  },

  selectedTypeText: {
    color:
      COLORS.primaryDark,
  },

  // ==========================================
  // ERRORS
  // ==========================================

  errorRow: {
    marginTop: 6,

    flexDirection: "row",

    alignItems: "center",

    gap: 5,
  },

  errorText: {
    marginTop: 5,

    fontSize: 12,

    lineHeight: 17,

    color:
      COLORS.danger,
  },

  // ==========================================
  // BUTTON
  // ==========================================

  createButton: {
    minHeight: 54,

    marginTop: 18,

    paddingHorizontal: 18,

    borderRadius: 16,

    backgroundColor:
      COLORS.primary,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "center",

    gap: 9,
  },

  createButtonText: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "700",
  },

  pressedButton: {
    opacity: 0.78,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },
});
}
