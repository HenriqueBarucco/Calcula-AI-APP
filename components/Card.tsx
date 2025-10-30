import React from "react";
import { View, ViewProps } from "react-native";

export function Card({ style, ...rest }: ViewProps) {
  return (
    <View
      style={[
        {
          padding: 12,
          borderRadius: 8,
          backgroundColor: "#f2f2f2",
        },
        style,
      ]}
      {...rest}
    />
  );
}
