import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, PanResponder, Pressable, StyleSheet, View } from "react-native";
import { colors, radii, shadows, spacing } from "../../styles/theme";
import { FloatingActionButton } from "../FloatingActionButton";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const ACTION_OFFSET = 88;
const DRAG_THRESHOLD = 30;

type CameraActionsProps = {
  disabled: boolean;
  loading: boolean;
  manualVisible: boolean;
  onCapture: () => void | Promise<void>;
  onOpenManual: () => void;
};

export function CameraActions({ disabled, loading, manualVisible, onCapture, onOpenManual }: CameraActionsProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const closeSheet = useCallback(() => {
    setVisible(false);
  }, []);

  const playImpact = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleToggle = useCallback(() => {
    if (disabled || manualVisible) return;
    playImpact();
    setVisible((prev) => !prev);
  }, [disabled, manualVisible, playImpact]);

  const handleDragOpen = useCallback(() => {
    if (disabled || manualVisible || visible) return;
    playImpact();
    setVisible(true);
  }, [disabled, manualVisible, visible, playImpact]);

  const handleCapture = useCallback(async () => {
    closeSheet();
    await onCapture();
  }, [closeSheet, onCapture]);

  const handleOpenManual = useCallback(() => {
    closeSheet();
    onOpenManual();
  }, [closeSheet, onOpenManual]);

  useEffect(() => {
    if (!manualVisible) return;
    closeSheet();
  }, [manualVisible, closeSheet]);

  useEffect(() => {
    if (!disabled) return;
    setMounted(false);
    setVisible(false);
    animation.stopAnimation();
    animation.setValue(0);
  }, [disabled, animation]);

  useEffect(() => {
    if (visible) {
      if (!mounted) {
        animation.stopAnimation();
        animation.setValue(0);
        setMounted(true);
        return;
      }
      animation.stopAnimation();
      Animated.spring(animation, {
        toValue: 1,
        damping: 12,
        stiffness: 140,
        mass: 0.6,
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      animation.stopAnimation();
      Animated.timing(animation, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          animation.setValue(0);
          setMounted(false);
        }
      });
    } else {
      animation.stopAnimation();
      animation.setValue(0);
    }

    return () => {
      animation.stopAnimation();
    };
  }, [visible, mounted, animation]);

  const { overlayOpacity, buttonTranslateY, buttonScale } = useMemo(() => {
    const overlay = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const translate = animation.interpolate({ inputRange: [0, 1], outputRange: [0, -ACTION_OFFSET] });
    const scale = animation.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
    return {
      overlayOpacity: overlay,
      buttonTranslateY: translate,
      buttonScale: scale,
    };
  }, [animation]);

  const dragActivatedRef = useRef(false);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        if (disabled || loading || manualVisible) return false;
        const verticalMove = Math.abs(gesture.dy);
        const horizontalMove = Math.abs(gesture.dx);
        return gesture.dy < 0 && verticalMove > 10 && verticalMove > horizontalMove;
      },
      onPanResponderGrant: () => {
        dragActivatedRef.current = false;
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy < -DRAG_THRESHOLD && !dragActivatedRef.current) {
          dragActivatedRef.current = true;
          handleDragOpen();
        }
      },
      onPanResponderRelease: () => {
        dragActivatedRef.current = false;
      },
      onPanResponderTerminate: () => {
        dragActivatedRef.current = false;
      },
    });
  }, [disabled, loading, manualVisible, handleDragOpen]);

  return (
    <>
      {mounted ? (
        <View style={styles.overlay} pointerEvents="box-none">
          <AnimatedPressable
            style={styles.scrim}
            onPress={closeSheet}
            accessible={false}
            disabled={!visible}
          />
          <View style={styles.container} pointerEvents="box-none">
            <AnimatedPressable
              style={[
                styles.secondaryButton,
                {
                  transform: [
                    { translateY: buttonTranslateY },
                    { scale: buttonScale },
                  ],
                  opacity: overlayOpacity,
                },
              ]}
              onPress={handleOpenManual}
              accessibilityRole="button"
              accessibilityLabel="Adicionar preço manual"
              disabled={!visible}
            >
              <Ionicons name="add" size={24} color={colors.textInverse} />
            </AnimatedPressable>
          </View>
        </View>
      ) : null}
      <FloatingActionButton
        onPress={handleCapture}
        onLongPress={handleToggle}
        disabled={disabled}
        loading={loading}
        panHandlers={panResponder.panHandlers}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  container: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    alignItems: "center",
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.light,
  },
});
