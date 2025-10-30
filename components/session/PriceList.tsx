import { memo, useCallback } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, Text, View } from "react-native";
import type { Price } from "../../lib/api";
import { spacing } from "../../styles/theme";
import { PriceItem } from "../PriceItem";

type PriceListProps = {
  prices: Price[];
  disabled: boolean;
  onDelete: (price: Price) => Promise<void> | void;
  onSelect?: (price: Price) => void;
  loadingPriceId?: string | null;
};

function PriceListComponent({ prices, disabled, onDelete, onSelect, loadingPriceId }: PriceListProps) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Price>) => (
      <PriceItem
        item={item}
        disabled={disabled}
        onDelete={() => onDelete(item)}
        onPress={onSelect}
        loading={loadingPriceId === item.id}
      />
    ),
    [disabled, onDelete, onSelect, loadingPriceId]
  );

  const keyExtractor = useCallback((item: Price) => item.id, []);

  return (
    <FlatList
      data={prices}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text>Sem preços no momento.</Text>
        </View>
      }
    />
  );
}

export const PriceList = memo(PriceListComponent);

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    gap: spacing.xs,
    paddingBottom: 120,
  },
  emptyState: {
    padding: spacing.md,
  },
});
