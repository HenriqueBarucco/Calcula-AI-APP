import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";
import { colors, radii } from "../styles/theme";

type Props = { height?: number; width?: number | `${number}%` | "auto"; style?: ViewStyle };

export function Skeleton({ height = 14, width = "100%", style }: Props) {
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          opacity,
          height,
          width,
          borderRadius: radii.sm,
          backgroundColor: colors.skeleton,
        },
        style,
      ]}
    />
  );
}
