import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";

type Props = {
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
};

export function FloatingActionButton({ onPress, disabled, loading }: Props) {
  return (
    <TouchableOpacity
      accessibilityLabel="Ação principal"
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        position: "absolute",
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: disabled || loading ? "#9bbcff" : "#007AFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="camera" size={24} color="#fff" />}
    </TouchableOpacity>
  );
}
