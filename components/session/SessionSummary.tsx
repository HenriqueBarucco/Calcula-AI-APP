import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../styles/theme";
import { formatBRL } from "../../utils/currency";

type SessionSummaryProps = {
  total: number;
};

export function SessionSummary({ total }: SessionSummaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total:</Text>
      <Text style={styles.value}>{formatBRL(total)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.body,
    color: colors.text,
  },
  value: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.text,
  },
});
