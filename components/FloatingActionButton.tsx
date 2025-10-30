import { Ionicons } from "@expo/vector-icons";
import React from "react";
import type { GestureResponderHandlers } from "react-native";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { colors, radii, shadows, spacing } from "../styles/theme";

type Props = {
  onPress?: () => void | Promise<void>;
  onLongPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  panHandlers?: GestureResponderHandlers;
};

export function FloatingActionButton({ onPress, onLongPress, disabled, loading, panHandlers }: Props) {
  return (
    <TouchableOpacity
      accessibilityLabel="Ação principal"
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled || loading}
      {...(panHandlers ?? {})}
      style={[
        styles.container,
        { backgroundColor: disabled || loading ? colors.primaryMuted : colors.primary },
      ]}
    >
      {loading ? <ActivityIndicator color={colors.textInverse} /> : <Ionicons name="camera" size={24} color={colors.textInverse} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
});
