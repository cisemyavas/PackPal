import { useTheme } from "../context/ThemeContext";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useLayoutEffect,
  useState,
} from "react";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import useTrips from "../hooks/useTrips";

import CategorySection from "../components/CategorySection";
import PackingItemRow from "../components/PackingItemRow";
import FilterTabs from "../components/FilterTabs";
import ProgressBar from "../components/ProgressBar";
import EmptyState from "../components/EmptyState";

import {
  CATEGORIES,
} from "../constants/categories";

import {
  getPackingProgress,
} from "../utils/progress";

function getTripIcon(tripType) {
  switch (tripType) {
    case "BEACH":
      return "sunny-outline";

    case "CITY":
      return "business-outline";

    case "BUSINESS":
      return "briefcase-outline";

    case "CAMPING":
      return "leaf-outline";

    case "WINTER":
      return "snow-outline";

    default:
      return "airplane-outline";
  }
}

export default function TripDetailScreen({
  navigation,
  route,
}) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  const {
    trips,
    toggleItem,
    deleteItem,
    deleteTrip,
  } = useTrips();

  const [filter, setFilter] =
    useState("ALL");

  const { tripId } =
    route.params || {};

  const trip = trips.find(
    (item) =>
      item.id === tripId
  );

  // ==========================================
  // HEADER
  // ==========================================

  useLayoutEffect(() => {
    if (trip) {
      navigation.setOptions({
        title: trip.destination,
      });
    }
  }, [navigation, trip]);

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!trip) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <EmptyState
          icon="alert-circle-outline"
          title="Trip not found"
          message="This trip could not be found."
        />
      </SafeAreaView>
    );
  }

  // ==========================================
  // DELETE TRIP
  // ==========================================

  function handleDeleteTrip() {
    Alert.alert(
      "Delete Trip",
      `Are you sure you want to delete ${trip.destination}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",

          onPress: () => {
            deleteTrip(
              trip.id
            );

            navigation.popToTop();
          },
        },
      ]
    );
  }

  // ==========================================
  // PROGRESS
  // ==========================================

  const {
    packedCount,
    totalCount,
    percentage,
  } = getPackingProgress(
    trip.items
  );

  // ==========================================
  // FILTER
  // ==========================================

  const filteredItems =
    trip.items.filter(
      (item) => {
        if (
          filter === "PACKED"
        ) {
          return item.isPacked;
        }

        if (
          filter === "MISSING"
        ) {
          return !item.isPacked;
        }

        return true;
      }
    );

  // ==========================================
  // CATEGORY GROUPING
  // ==========================================

  const groupedItems =
    CATEGORIES
      .map((category) => {
        const items =
          filteredItems.filter(
            (item) =>
              item.category ===
              category
          );

        return {
          category,
          items,
        };
      })
      .filter(
        (group) =>
          group.items.length > 0
      );

  const listData =
    groupedItems.flatMap(
      (group) => [
        {
          type: "header",
          id:
            `header-${group.category}`,
          category:
            group.category,
          count:
            group.items.length,
        },

        ...group.items.map(
          (item) => ({
            type: "item",
            id: item.id,
            item,
          })
        ),
      ]
    );

  // ==========================================
  // EMPTY STATE
  // ==========================================

  function getEmptyTitle() {
    if (
      filter === "PACKED"
    ) {
      return "No packed items yet";
    }

    if (
      filter === "MISSING"
    ) {
      return "No missing items";
    }

    return "No items yet";
  }

  function getEmptyMessage() {
    if (
      filter === "PACKED"
    ) {
      return "Mark an item as packed and it will appear here.";
    }

    if (
      filter === "MISSING"
    ) {
      return "Great job! Everything is packed.";
    }

    return "Add an item to start your packing list.";
  }

  const tripIcon =
    getTripIcon(
      trip.tripType
    );

  return (
    <SafeAreaView
      style={styles.container}
      edges={["bottom"]}
    >
      <FlatList
        data={listData}
        keyExtractor={(entry) =>
          entry.id
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.list,

          listData.length === 0 &&
            styles.emptyList,
        ]}

        // ======================================
        // HEADER CONTENT
        // ======================================

        ListHeaderComponent={
          <View>
            {/* TRIP HERO CARD */}

            <View
              style={
                styles.tripCard
              }
            >
              <View
                style={
                  styles.tripTopRow
                }
              >
                <View
                  style={
                    styles.tripIconBox
                  }
                >
                  <Ionicons
                    name={tripIcon}
                    size={28}
                    color={
                      COLORS.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.tripTitleArea
                  }
                >
                  <Text
                    style={
                      styles.destination
                    }
                    numberOfLines={1}
                  >
                    {
                      trip.destination
                    }
                  </Text>

                  <View
                    style={
                      styles.typeBadge
                    }
                  >
                    <Text
                      style={
                        styles.typeBadgeText
                      }
                    >
                      {
                        trip.tripType
                      }
                    </Text>
                  </View>
                </View>
              </View>

              {/* DATE */}

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
                    name="calendar-outline"
                    size={18}
                    color={
                      COLORS.primary
                    }
                  />
                </View>

                <View>
                  <Text
                    style={
                      styles.infoLabel
                    }
                  >
                    Travel dates
                  </Text>

                  <Text
                    style={
                      styles.infoValue
                    }
                  >
                    {
                      trip.startDate
                    }
                    {"  →  "}
                    {
                      trip.endDate
                    }
                  </Text>
                </View>
              </View>

              {/* PROGRESS */}

              <View
                style={
                  styles.progressBox
                }
              >
                <View
                  style={
                    styles.progressTitleRow
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.progressTitle
                      }
                    >
                      Packing progress
                    </Text>

                    <Text
                      style={
                        styles.progressSubtitle
                      }
                    >
                      {
                        packedCount
                      }{" "}
                      of{" "}
                      {
                        totalCount
                      }{" "}
                      items ready
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.bigPercentage
                    }
                  >
                    {
                      percentage
                    }
                    %
                  </Text>
                </View>

                <ProgressBar
                  packedCount={
                    packedCount
                  }
                  totalCount={
                    totalCount
                  }
                  percentage={
                    percentage
                  }
                  showInfo={
                    false
                  }
                />
              </View>

              {/* ACTION BUTTONS */}

              <View
                style={
                  styles.actionRow
                }
              >
                <Pressable
                  style={({
                    pressed,
                  }) => [
                    styles.primaryAction,
                    pressed &&
                      styles.buttonPressed,
                  ]}
                  onPress={() =>
                    navigation.navigate(
                      "AddItem",
                      {
                        tripId:
                          trip.id,
                      }
                    )
                  }
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryActionText
                    }
                  >
                    Add Item
                  </Text>
                </Pressable>

                <Pressable
                  style={({
                    pressed,
                  }) => [
                    styles.secondaryAction,
                    pressed &&
                      styles.buttonPressed,
                  ]}
                  onPress={() =>
                    navigation.navigate(
                      "Weather",
                      {
                        tripId:
                          trip.id,
                      }
                    )
                  }
                >
                  <Ionicons
                    name="partly-sunny-outline"
                    size={20}
                    color={
                      COLORS.primary
                    }
                  />

                  <Text
                    style={
                      styles.secondaryActionText
                    }
                  >
                    Weather
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* PACKING LIST TITLE */}

            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Packing List
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Keep track of everything you need.
                </Text>
              </View>

              <View
                style={
                  styles.itemCountBadge
                }
              >
                <Text
                  style={
                    styles.itemCountText
                  }
                >
                  {
                    trip.items.length
                  }
                </Text>
              </View>
            </View>

            {/* FILTER */}

            <FilterTabs
              activeFilter={
                filter
              }
              onChange={
                setFilter
              }
            />
          </View>
        }

        // ======================================
        // ITEMS
        // ======================================

        renderItem={({
          item,
        }) => {
          if (
            item.type ===
            "header"
          ) {
            return (
              <CategorySection
                category={
                  item.category
                }
                count={
                  item.count
                }
              />
            );
          }

          return (
            <PackingItemRow
              item={
                item.item
              }
              onToggle={() =>
                toggleItem(
                  trip.id,
                  item.item.id
                )
              }
              onDelete={() =>
                deleteItem(
                  trip.id,
                  item.item.id
                )
              }
            />
          );
        }}

        // ======================================
        // EMPTY
        // ======================================

        ListEmptyComponent={
          <EmptyState
            icon={
              filter ===
              "PACKED"
                ? "checkmark-circle-outline"
                : "file-tray-outline"
            }
            title={
              getEmptyTitle()
            }
            message={
              getEmptyMessage()
            }
          />
        }

        // ======================================
        // DELETE TRIP
        // ======================================

        ListFooterComponent={
          <Pressable
            style={({
              pressed,
            }) => [
              styles.deleteButton,

              pressed &&
                styles.buttonPressed,
            ]}
            onPress={
              handleDeleteTrip
            }
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={
                COLORS.danger
              }
            />

            <Text
              style={
                styles.deleteButtonText
              }
            >
              Delete Trip
            </Text>
          </Pressable>
        }
      />
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

    list: {
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 36,
    },

    emptyList: {
      flexGrow: 1,
    },

    // ==========================================
    // TRIP CARD
    // ==========================================

    tripCard: {
      backgroundColor:
        COLORS.surface,

      padding: 20,

      borderRadius: 22,

      borderWidth: 1,
      borderColor:
        COLORS.border,

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.06,
      shadowRadius: 10,

      elevation: 2,
    },

    tripTopRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    tripIconBox: {
      width: 56,
      height: 56,

      borderRadius: 18,

      backgroundColor:
        COLORS.primaryLight,

      alignItems: "center",
      justifyContent:
        "center",

      marginRight: 14,
    },

    tripTitleArea: {
      flex: 1,
      alignItems: "flex-start",
    },

    destination: {
      fontSize: 25,

      fontWeight: "800",

      letterSpacing: -0.5,

      color:
        COLORS.text,
    },

    typeBadge: {
      marginTop: 7,

      paddingHorizontal: 10,
      paddingVertical: 5,

      borderRadius: 20,

      backgroundColor:
        COLORS.primaryLight,
    },

    typeBadgeText: {
      fontSize: 11,

      fontWeight: "700",

      letterSpacing: 0.5,

      color:
        COLORS.primaryDark,
    },

    // ==========================================
    // DATE
    // ==========================================

    infoRow: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 20,

      paddingTop: 16,

      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
    },

    infoIcon: {
      width: 38,
      height: 38,

      borderRadius: 12,

      marginRight: 12,

      backgroundColor:
        COLORS.primaryLight,

      alignItems: "center",
      justifyContent:
        "center",
    },

    infoLabel: {
      fontSize: 12,

      color:
        COLORS.textMuted,
    },

    infoValue: {
      marginTop: 3,

      fontSize: 14,
      fontWeight: "600",

      color:
        COLORS.text,
    },

    // ==========================================
    // PROGRESS
    // ==========================================

    progressBox: {
      marginTop: 18,

      padding: 16,

      borderRadius: 16,

      backgroundColor:
        COLORS.primaryLight,
    },

    progressTitleRow: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    progressTitle: {
      fontSize: 14,

      fontWeight: "700",

      color:
        COLORS.text,
    },

    progressSubtitle: {
      marginTop: 3,

      fontSize: 12,

      color:
        COLORS.textSecondary,
    },

    bigPercentage: {
      fontSize: 22,

      fontWeight: "800",

      color:
        COLORS.primary,
    },

    // ==========================================
    // ACTION BUTTONS
    // ==========================================

    actionRow: {
      flexDirection: "row",

      gap: 10,

      marginTop: 18,
    },

    primaryAction: {
      flex: 1,

      minHeight: 50,

      borderRadius: 14,

      backgroundColor:
        COLORS.primary,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap: 7,
    },

    primaryActionText: {
      color: "#FFFFFF",

      fontSize: 15,

      fontWeight: "700",
    },

    secondaryAction: {
      flex: 1,

      minHeight: 50,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        COLORS.primary,

      backgroundColor:
        COLORS.surface,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap: 7,
    },

    secondaryActionText: {
      color:
        COLORS.primary,

      fontSize: 15,

      fontWeight: "700",
    },

    buttonPressed: {
      opacity: 0.75,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    // ==========================================
    // PACKING LIST HEADER
    // ==========================================

    sectionHeader: {
      marginTop: 28,
      marginBottom: 12,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    sectionTitle: {
      fontSize: 21,

      fontWeight: "800",

      color:
        COLORS.text,
    },

    sectionSubtitle: {
      marginTop: 3,

      fontSize: 13,

      color:
        COLORS.textSecondary,
    },

    itemCountBadge: {
      minWidth: 38,
      height: 38,

      paddingHorizontal: 10,

      borderRadius: 12,

      backgroundColor:
        COLORS.primaryLight,

      alignItems: "center",

      justifyContent:
        "center",
    },

    itemCountText: {
      fontSize: 15,

      fontWeight: "800",

      color:
        COLORS.primary,
    },

    // ==========================================
    // DELETE
    // ==========================================

    deleteButton: {
      minHeight: 48,

      marginTop: 24,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        COLORS.danger,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap: 7,

      backgroundColor:
        COLORS.surface,
    },

    deleteButtonText: {
      color:
        COLORS.danger,

      fontSize: 15,

      fontWeight: "700",
    },
  });
}
