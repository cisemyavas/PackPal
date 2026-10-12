import { useTheme } from "../context/ThemeContext";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

export default function PackingItemRow({
  item,
  onToggle,
  onDelete,
}) {
  const { colors: COLORS } = useTheme();
  const styles = createStyles(COLORS);
  return (
    <View
      style={[
        styles.container,

        item.isPacked &&
          styles.packedContainer,
      ]}
    >
      {/* ITEM TOGGLE AREA */}

      <Pressable
        style={({ pressed }) => [
          styles.itemArea,

          pressed &&
            styles.pressedArea,
        ]}
        onPress={onToggle}
      >
        {/* CHECK ICON */}

        <View
          style={[
            styles.checkBox,

            item.isPacked &&
              styles.checkBoxPacked,
          ]}
        >
          <Ionicons
            name={
              item.isPacked
                ? "checkmark"
                : "ellipse-outline"
            }
            size={
              item.isPacked
                ? 18
                : 22
            }
            color={
              item.isPacked
                ? "#FFFFFF"
                : COLORS.textMuted
            }
          />
        </View>

        {/* ITEM TEXT */}

        <View
          style={
            styles.textContainer
          }
        >
          <Text
            style={[
              styles.name,

              item.isPacked &&
                styles.packedName,
            ]}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <View
            style={
              styles.quantityRow
            }
          >
            <Ionicons
              name="layers-outline"
              size={13}
              color={
                COLORS.textMuted
              }
            />

            <Text
              style={
                styles.quantity
              }
            >
              Quantity:{" "}
              {item.quantity}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* DELETE */}

      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,

          pressed &&
            styles.deletePressed,
        ]}
        onPress={onDelete}
        hitSlop={4}
      >
        <Ionicons
          name="trash-outline"
          size={19}
          color={
            COLORS.danger
          }
        />
      </Pressable>
    </View>
  );
}

function createStyles(COLORS) {
  return StyleSheet.create({
    container: {
      minHeight: 72,

      backgroundColor:
        COLORS.surface,

      borderRadius: 16,

      marginBottom: 9,

      borderWidth: 1,
      borderColor:
        COLORS.border,

      flexDirection: "row",
      alignItems: "center",

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.035,
      shadowRadius: 5,

      elevation: 1,
    },

    packedContainer: {
      backgroundColor:
        COLORS.successLight,

      borderColor:
        "#BBF7D0",
    },

    itemArea: {
      flex: 1,

      minHeight: 72,

      paddingHorizontal: 14,
      paddingVertical: 12,

      flexDirection: "row",
      alignItems: "center",

      gap: 12,
    },

    pressedArea: {
      opacity: 0.72,
    },

    // ==========================================
    // CHECK ICON
    // ==========================================

    checkBox: {
      width: 34,
      height: 34,

      borderRadius: 11,

      backgroundColor:
        COLORS.background,

      alignItems: "center",
      justifyContent:
        "center",
    },

    checkBoxPacked: {
      backgroundColor:
        COLORS.success,
    },

    // ==========================================
    // TEXT
    // ==========================================

    textContainer: {
      flex: 1,
    },

    name: {
      fontSize: 15,

      fontWeight: "600",

      color: COLORS.text,
    },

    packedName: {
      color:
        COLORS.textSecondary,

      textDecorationLine:
        "line-through",
    },

    quantityRow: {
      flexDirection: "row",
      alignItems: "center",

      gap: 4,

      marginTop: 5,
    },

    quantity: {
      fontSize: 12,

      color:
        COLORS.textMuted,
    },

    // ==========================================
    // DELETE
    // ==========================================

    deleteButton: {
      width: 44,
      height: 44,

      marginRight: 8,

      borderRadius: 12,

      backgroundColor:
        COLORS.dangerLight,

      alignItems: "center",
      justifyContent:
        "center",
    },

    deletePressed: {
      opacity: 0.65,
    },
  });
}
