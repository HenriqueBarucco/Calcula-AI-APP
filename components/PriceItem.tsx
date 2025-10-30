import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import type { Price } from "../lib/api";
import { colors, radii, spacing, typography } from "../styles/theme";
import { formatBRL } from "../utils/currency";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";

type Props = {
  item: Price;
  onDelete?: (item: Price) => void;
  disabled?: boolean;
};

export function PriceItem({ item, onDelete, disabled }: Props) {
  const swipeRef = useRef<any>(null);

  if (item.status === "PENDING") {
    return (
      <Card>
        <View style={styles.pendingRow}>
          <Skeleton width={"70%" as `${number}%`} />
          <Skeleton width={80} style={styles.pendingSkeleton} />
        </View>
      </Card>
    );
  }

  const renderRightActions = () => (
    <Pressable
      onPress={() => {
        swipeRef.current?.close();
        onDelete?.(item);
      }}
      disabled={disabled}
      style={[
        styles.deleteButton,
        { backgroundColor: disabled ? colors.dangerMuted : colors.danger },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Excluir preço"
    >
      <Ionicons name="trash-outline" size={24} color={colors.textInverse} />
    </Pressable>
  );

  return (
    <Swipeable ref={swipeRef} overshootRight={false} renderRightActions={renderRightActions} enabled={!disabled}>
      <Card style={styles.cardContent}>
        <View style={styles.infoColumn}>
          <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
            {`x${item.quantity} ${item.name ?? "Sem nome"}`}
          </Text>
          {item.status === "FAILED" ? (
            <View style={styles.errorBadge}>
              <Text style={styles.errorBadgeText}>Erro ao processar</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.itemValue}>{formatBRL(item.value ?? 0)}</Text>
      </Card>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingSkeleton: {
    marginLeft: spacing.sm,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    marginLeft: spacing.md,
    borderRadius: radii.lg,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoColumn: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: "600",
    color: colors.text,
  },
  itemValue: {
    marginLeft: spacing.sm,
    fontWeight: "600",
    color: colors.text,
    fontSize: typography.body,
  },
  errorBadge: {
    marginTop: spacing.xs,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.danger,
  },
  errorBadgeText: {
    color: colors.textInverse,
    fontSize: typography.label,
    fontWeight: "600",
  },
});
