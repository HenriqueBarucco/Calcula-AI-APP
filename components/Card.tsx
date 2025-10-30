import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { colors, radii, spacing } from "../styles/theme";

export function Card({ style, ...rest }: ViewProps) {
  return (
    <View
      style={[styles.container, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
