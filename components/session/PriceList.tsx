import { memo, useCallback } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, Text, View } from "react-native";
import type { Price } from "../../lib/api";
import { spacing } from "../../styles/theme";
import { PriceItem } from "../PriceItem";

type PriceListProps = {
  prices: Price[];
  disabled: boolean;
  onDelete: (price: Price) => Promise<void> | void;
};

function PriceListComponent({ prices, disabled, onDelete }: PriceListProps) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Price>) => (
      <PriceItem item={item} disabled={disabled} onDelete={() => onDelete(item)} />
    ),
    [disabled, onDelete]
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
