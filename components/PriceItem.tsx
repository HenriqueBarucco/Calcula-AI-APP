import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import type { Price } from "../lib/api";
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Skeleton width={"70%" as `${number}%`} />
          <Skeleton width={80} style={{ marginLeft: 12 }} />
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
      style={{
        backgroundColor: disabled ? "#aaa" : "#e53935",
        justifyContent: "center",
        alignItems: "center",
        width: 72,
        marginLeft: 8,
        borderRadius: 12,
      }}
      accessibilityRole="button"
      accessibilityLabel="Excluir preço"
    >
      <Text style={{ color: "white", fontWeight: "700" }}><Ionicons name="trash-outline" size={24} color="#fff" /></Text>
    </Pressable>
  );

  return (
    <Swipeable ref={swipeRef} overshootRight={false} renderRightActions={renderRightActions} enabled={!disabled}>
      <Card style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontWeight: "600", flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
          {`x${item.quantity} ${item.name ?? "Sem nome"}`}
        </Text>
        <Text style={{ marginLeft: 12, fontWeight: "600" }}>{formatBRL(item.value ?? 0)}</Text>
      </Card>
    </Swipeable>
  );
}
