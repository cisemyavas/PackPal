import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import useTrips from "../hooks/useTrips";

import {
  COLORS,
} from "../constants/colors";

export default function SettingsScreen() {
  const {
    trips,
    clearTrips,
    storageError,
  } = useTrips();

  const hasTrips =
    trips.length > 0;

  function handleClearAll() {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all trips? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete All",
          style: "destructive",

          onPress: async () => {
            await clearTrips();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}

        <View
          style={styles.header}
        >
          <View
            style={styles.headerIcon}
          >
            <Ionicons
              name="settings-outline"
              size={28}
              color={COLORS.primary}
            />
          </View>

          <View>
            <Text
              style={styles.title}
            >
              Settings
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Manage your PackPal data.
            </Text>
          </View>
        </View>

        {/* STORAGE ERROR */}

        {storageError && (
          <View
            style={
              styles.errorBox
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={
                COLORS.danger
              }
            />

            <Text
              style={
                styles.errorText
              }
            >
              {storageError}
            </Text>
          </View>
        )}

        {/* DATA */}

        <Text
          style={
            styles.sectionLabel
          }
        >
          YOUR DATA
        </Text>

        <View
          style={styles.card}
        >
          <View
            style={
              styles.dataHeader
            }
          >
            <View
              style={
                styles.cardIcon
              }
            >
              <Ionicons
                name="airplane-outline"
                size={21}
                color={
                  COLORS.primary
                }
              />
            </View>

            <View
              style={
                styles.dataTextArea
              }
            >
              <Text
                style={
                  styles.cardTitle
                }
              >
                Saved trips
              </Text>

              <Text
                style={
                  styles.description
                }
              >
                Your trips are stored
                locally on this device.
              </Text>
            </View>

            <View
              style={
                styles.countBadge
              }
            >
              <Text
                style={
                  styles.countNumber
                }
              >
                {trips.length}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.divider
            }
          />

          <Pressable
            style={({
              pressed,
            }) => [
              styles.clearButton,

              !hasTrips &&
                styles.disabledButton,

              pressed &&
                hasTrips &&
                styles.pressedButton,
            ]}
            disabled={!hasTrips}
            onPress={
              handleClearAll
            }
          >
            <Ionicons
              name="trash-outline"
              size={19}
              color={
                hasTrips
                  ? COLORS.danger
                  : COLORS.textMuted
              }
            />

            <Text
              style={[
                styles.clearButtonText,

                !hasTrips &&
                  styles.disabledButtonText,
              ]}
            >
              Clear All Data
            </Text>
          </Pressable>

          {!hasTrips && (
            <Text
              style={
                styles.emptyText
              }
            >
              There is no saved data to
              clear.
            </Text>
          )}
        </View>

        {/* APP INFORMATION */}

        <Text
          style={
            styles.sectionLabel
          }
        >
          APPLICATION
        </Text>

        <View
          style={styles.card}
        >
          <View
            style={
              styles.infoRow
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={
                  COLORS.primary
                }
              />
            </View>

            <View
              style={
                styles.infoContent
              }
            >
              <Text
                style={
                  styles.infoTitle
                }
              >
                About PackPal
              </Text>

              <Text
                style={
                  styles.description
                }
              >
                A mobile travel packing
                assistant that helps you
                stay organized before
                every trip.
              </Text>
            </View>
          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.infoRow
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color={
                  COLORS.primary
                }
              />
            </View>

            <View
              style={
                styles.infoContent
              }
            >
              <Text
                style={
                  styles.infoTitle
                }
              >
                Local storage
              </Text>

              <Text
                style={
                  styles.description
                }
              >
                Trip information is saved
                on your device using
                AsyncStorage.
              </Text>
            </View>
          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.versionRow
            }
          >
            <Text
              style={
                styles.versionLabel
              }
            >
              Version
            </Text>

            <Text
              style={
                styles.versionValue
              }
            >
              1.0.0
            </Text>
          </View>
        </View>

        <Text
          style={styles.footer}
        >
          Pack smarter. Travel lighter.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
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

    header: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 26,
    },

    headerIcon: {
      width: 52,
      height: 52,

      borderRadius: 17,

      marginRight: 13,

      backgroundColor:
        COLORS.primaryLight,

      alignItems: "center",
      justifyContent:
        "center",
    },

    title: {
      fontSize: 25,

      fontWeight: "800",

      color: COLORS.text,
    },

    subtitle: {
      marginTop: 3,

      fontSize: 13,

      color:
        COLORS.textSecondary,
    },

    sectionLabel: {
      marginLeft: 3,
      marginBottom: 8,

      fontSize: 11,

      fontWeight: "800",

      letterSpacing: 1,

      color:
        COLORS.textMuted,
    },

    card: {
      padding: 17,

      marginBottom: 24,

      borderRadius: 19,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.surface,
    },

    dataHeader: {
      flexDirection: "row",

      alignItems: "center",
    },

    cardIcon: {
      width: 43,
      height: 43,

      borderRadius: 13,

      backgroundColor:
        COLORS.primaryLight,

      alignItems: "center",
      justifyContent:
        "center",

      marginRight: 12,
    },

    dataTextArea: {
      flex: 1,
    },

    cardTitle: {
      fontSize: 16,

      fontWeight: "700",

      color: COLORS.text,
    },

    description: {
      marginTop: 4,

      fontSize: 12,

      lineHeight: 18,

      color:
        COLORS.textSecondary,
    },

    countBadge: {
      minWidth: 40,
      height: 40,

      borderRadius: 13,

      paddingHorizontal: 10,

      backgroundColor:
        COLORS.primaryLight,

      alignItems: "center",
      justifyContent:
        "center",
    },

    countNumber: {
      fontSize: 17,

      fontWeight: "800",

      color:
        COLORS.primary,
    },

    divider: {
      height: 1,

      marginVertical: 16,

      backgroundColor:
        COLORS.border,
    },

    clearButton: {
      minHeight: 48,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        COLORS.danger,

      backgroundColor:
        COLORS.dangerLight,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap: 8,
    },

    clearButtonText: {
      fontSize: 14,

      fontWeight: "700",

      color:
        COLORS.danger,
    },

    disabledButton: {
      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.background,
    },

    disabledButtonText: {
      color:
        COLORS.textMuted,
    },

    pressedButton: {
      opacity: 0.7,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    emptyText: {
      marginTop: 9,

      textAlign: "center",

      fontSize: 12,

      color:
        COLORS.textMuted,
    },

    infoRow: {
      flexDirection: "row",

      alignItems: "flex-start",
    },

    infoIcon: {
      width: 38,
      height: 38,

      borderRadius: 12,

      marginRight: 11,

      backgroundColor:
        COLORS.primaryLight,

      alignItems: "center",
      justifyContent:
        "center",
    },

    infoContent: {
      flex: 1,
    },

    infoTitle: {
      fontSize: 14,

      fontWeight: "700",

      color: COLORS.text,
    },

    versionRow: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    versionLabel: {
      fontSize: 14,

      fontWeight: "600",

      color:
        COLORS.textSecondary,
    },

    versionValue: {
      fontSize: 14,

      fontWeight: "700",

      color:
        COLORS.primary,
    },

    errorBox: {
      padding: 12,

      marginBottom: 18,

      borderRadius: 13,

      backgroundColor:
        COLORS.dangerLight,

      flexDirection: "row",

      alignItems: "center",

      gap: 8,
    },

    errorText: {
      flex: 1,

      fontSize: 13,

      color:
        COLORS.danger,
    },

    footer: {
      marginTop: 2,

      textAlign: "center",

      fontSize: 12,

      color:
        COLORS.textMuted,
    },
  });