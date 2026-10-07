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

import {
  CATEGORIES,
  CATEGORY_LABELS,
} from "../constants/categories";

import {
  COLORS,
} from "../constants/colors";

function getCategoryIcon(category) {
  switch (category) {
    case "CLOTHING":
      return "shirt-outline";

    case "DOCUMENTS":
      return "document-text-outline";

    case "ELECTRONICS":
      return "phone-portrait-outline";

    case "TOILETRIES":
      return "water-outline";

    case "HEALTH":
      return "medkit-outline";

    case "OTHER":
      return "cube-outline";

    default:
      return "folder-outline";
  }
}

export default function AddItemScreen({
  navigation,
  route,
}) {
  const {
    trips,
    addItem,
  } = useTrips();

  const { tripId } =
    route.params || {};

  const trip = trips.find(
    (item) =>
      item.id === tripId
  );

  const [name, setName] =
    useState("");

  const [quantity, setQuantity] =
    useState("1");

  const [category, setCategory] =
    useState("OTHER");

  const [errors, setErrors] =
    useState({});

  // ==========================================
  // VALIDATION
  // ==========================================

  function validateForm() {
    const newErrors = {};

    const trimmedName =
      name.trim();

    const numericQuantity =
      Number(quantity);

    if (!trimmedName) {
      newErrors.name =
        "Item name is required.";
    } else if (
      trimmedName.length > 50
    ) {
      newErrors.name =
        "Item name cannot be longer than 50 characters.";
    }

    if (
      trimmedName &&
      trimmedName.length <= 50 &&
      trip
    ) {
      const duplicateExists =
        trip.items.some(
          (item) =>
            item.name
              .trim()
              .toLowerCase() ===
            trimmedName.toLowerCase()
        );

      if (duplicateExists) {
        newErrors.name =
          "This item already exists in this trip.";
      }
    }

    if (
      quantity.trim() === ""
    ) {
      newErrors.quantity =
        "Quantity is required.";
    } else if (
      Number.isNaN(
        numericQuantity
      )
    ) {
      newErrors.quantity =
        "Quantity must be a number.";
    } else if (
      numericQuantity < 1 ||
      numericQuantity > 99
    ) {
      newErrors.quantity =
        "Quantity must be between 1 and 99.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  }

  // ==========================================
  // ADD ITEM
  // ==========================================

  function handleAddItem() {
    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    addItem(tripId, {
      name:
        name.trim(),

      quantity:
        Number(quantity),

      category,
    });

    navigation.goBack();
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!trip) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.notFoundContainer
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color={
              COLORS.textMuted
            }
          />

          <Text
            style={
              styles.notFoundText
            }
          >
            Trip not found.
          </Text>
        </View>
      </SafeAreaView>
    );
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* HEADER */}

          <View
            style={styles.header}
          >
            <View
              style={
                styles.headerIcon
              }
            >
              <Ionicons
                name="add-circle-outline"
                size={29}
                color={
                  COLORS.primary
                }
              />
            </View>

            <Text
              style={styles.title}
            >
              Add packing item
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Add something you don't
              want to forget for{" "}
              {trip.destination}.
            </Text>
          </View>

          {/* FORM */}

          <View
            style={styles.formCard}
          >
            {/* NAME */}

            <Text
              style={styles.label}
            >
              Item Name
            </Text>

            <View
              style={[
                styles.inputContainer,

                errors.name &&
                  styles.inputContainerError,
              ]}
            >
              <Ionicons
                name="bag-handle-outline"
                size={20}
                color={
                  errors.name
                    ? COLORS.danger
                    : COLORS.textMuted
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Example: Camera"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={name}
                maxLength={51}
                onChangeText={(
                  value
                ) => {
                  setName(value);

                  if (
                    errors.name
                  ) {
                    setErrors(
                      (current) => ({
                        ...current,
                        name: null,
                      })
                    );
                  }
                }}
              />
            </View>

            {errors.name && (
              <View
                style={
                  styles.errorRow
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={
                    COLORS.danger
                  }
                />

                <Text
                  style={
                    styles.errorText
                  }
                >
                  {errors.name}
                </Text>
              </View>
            )}

            {/* QUANTITY */}

            <Text
              style={styles.label}
            >
              Quantity
            </Text>

            <View
              style={[
                styles.inputContainer,

                errors.quantity &&
                  styles.inputContainerError,
              ]}
            >
              <Ionicons
                name="layers-outline"
                size={20}
                color={
                  errors.quantity
                    ? COLORS.danger
                    : COLORS.textMuted
                }
              />

              <TextInput
                style={styles.input}
                value={quantity}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={
                  COLORS.textMuted
                }
                onChangeText={(
                  value
                ) => {
                  setQuantity(
                    value
                  );

                  if (
                    errors.quantity
                  ) {
                    setErrors(
                      (current) => ({
                        ...current,
                        quantity:
                          null,
                      })
                    );
                  }
                }}
              />
            </View>

            {errors.quantity && (
              <View
                style={
                  styles.errorRow
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={
                    COLORS.danger
                  }
                />

                <Text
                  style={
                    styles.errorText
                  }
                >
                  {errors.quantity}
                </Text>
              </View>
            )}

            {/* CATEGORY */}

            <Text
              style={
                styles.categoryTitle
              }
            >
              Category
            </Text>

            <Text
              style={
                styles.helperText
              }
            >
              Choose where this item
              belongs in your packing
              list.
            </Text>

            <View
              style={
                styles.categories
              }
            >
              {CATEGORIES.map(
                (item) => {
                  const isSelected =
                    category === item;

                  return (
                    <Pressable
                      key={item}
                      style={({
                        pressed,
                      }) => [
                        styles.categoryButton,

                        isSelected &&
                          styles.selectedCategory,

                        pressed &&
                          styles.pressedButton,
                      ]}
                      onPress={() =>
                        setCategory(
                          item
                        )
                      }
                    >
                      <View
                        style={[
                          styles.categoryIcon,

                          isSelected &&
                            styles.selectedCategoryIcon,
                        ]}
                      >
                        <Ionicons
                          name={getCategoryIcon(
                            item
                          )}
                          size={20}
                          color={
                            isSelected
                              ? "#FFFFFF"
                              : COLORS.primary
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.categoryText,

                          isSelected &&
                            styles.selectedCategoryText,
                        ]}
                      >
                        {CATEGORY_LABELS[
                          item
                        ] || item}
                      </Text>

                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={17}
                          color={
                            COLORS.primary
                          }
                        />
                      )}
                    </Pressable>
                  );
                }
              )}
            </View>
          </View>

          {/* SUBMIT */}

          <Pressable
            style={({ pressed }) => [
              styles.addButton,

              pressed &&
                styles.pressedButton,
            ]}
            onPress={
              handleAddItem
            }
          >
            <Ionicons
              name="add"
              size={21}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.addButtonText
              }
            >
              Add Item
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

    color:
      COLORS.textSecondary,

    textAlign: "center",
  },

  // ==========================================
  // FORM
  // ==========================================

  formCard: {
    padding: 18,

    borderRadius: 20,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,

    borderColor:
      COLORS.border,
  },

  label: {
    marginTop: 14,
    marginBottom: 8,

    fontSize: 14,

    fontWeight: "700",

    color:
      COLORS.text,
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

    color:
      COLORS.text,
  },

  // ==========================================
  // CATEGORY
  // ==========================================

  categoryTitle: {
    marginTop: 22,

    fontSize: 14,

    fontWeight: "700",

    color:
      COLORS.text,
  },

  helperText: {
    marginTop: 4,
    marginBottom: 12,

    fontSize: 12,

    color:
      COLORS.textMuted,
  },

  categories: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: 9,
  },

  categoryButton: {
    width: "48%",

    minHeight: 65,

    padding: 10,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius: 15,

    backgroundColor:
      COLORS.background,

    flexDirection: "row",

    alignItems: "center",

    gap: 8,
  },

  selectedCategory: {
    borderColor:
      COLORS.primary,

    backgroundColor:
      COLORS.primaryLight,
  },

  categoryIcon: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor:
      COLORS.primaryLight,

    alignItems: "center",
    justifyContent: "center",
  },

  selectedCategoryIcon: {
    backgroundColor:
      COLORS.primary,
  },

  categoryText: {
    flex: 1,

    fontSize: 12,

    fontWeight: "700",

    color:
      COLORS.textSecondary,
  },

  selectedCategoryText: {
    color:
      COLORS.primaryDark,
  },

  // ==========================================
  // ERROR
  // ==========================================

  errorRow: {
    marginTop: 6,

    flexDirection: "row",

    alignItems: "center",

    gap: 5,
  },

  errorText: {
    flex: 1,

    fontSize: 12,

    lineHeight: 17,

    color:
      COLORS.danger,
  },

  // ==========================================
  // SUBMIT
  // ==========================================

  addButton: {
    minHeight: 54,

    marginTop: 18,

    borderRadius: 16,

    backgroundColor:
      COLORS.primary,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "center",

    gap: 8,
  },

  addButtonText: {
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

  // ==========================================
  // NOT FOUND
  // ==========================================

  notFoundContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  notFoundText: {
    marginTop: 10,

    fontSize: 16,

    color:
      COLORS.textSecondary,
  },
});