import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { colors, radii, shadows, spacing } from "../styles/theme";

const BUTTON_SIZE = 56;

type Props = {
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  bottom?: number;
  right?: number;
};

export function FloatingActionButton({ onPress, disabled, loading, bottom, right }: Props) {
  return (
    <TouchableOpacity
      accessibilityLabel="Ação principal"
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          backgroundColor: disabled || loading ? colors.primaryMuted : colors.primary,
          bottom: bottom ?? spacing.lg,
          right: right ?? spacing.lg,
        },
      ]}
    >
      {loading ? <ActivityIndicator color={colors.textInverse} /> : <Ionicons name="camera" size={24} color={colors.textInverse} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
});
