import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, disabled, loading, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      activeOpacity={0.85}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        {
          height: 48,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDisabled ? "#9bbcff" : "#007AFF",
          paddingHorizontal: 16,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: "#fff", fontWeight: "600" }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
