import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, shadows, spacing } from "../../styles/theme";
import { FloatingActionButton } from "../FloatingActionButton";

const BUTTON_SIZE = 56;

type CameraActionsProps = {
  disabled: boolean;
  loading: boolean;
  manualVisible: boolean;
  onCapture: () => void | Promise<void>;
  onOpenManual: () => void;
  positioning?: {
    cameraBottom: number;
    manualBottom: number;
    right: number;
  };
};

export function CameraActions({ disabled, loading, manualVisible, onCapture, onOpenManual, positioning }: CameraActionsProps) {
  const insets = useSafeAreaInsets();

  const { rightOffset, cameraBottom, manualBottom } = useMemo(() => {
    if (positioning) return {
      rightOffset: positioning.right,
      cameraBottom: positioning.cameraBottom,
      manualBottom: positioning.manualBottom,
    };

    const right = Math.max(insets.right, spacing.lg);
    const baseBottom = spacing.lg + insets.bottom;
    const needsExtraSpace = Platform.OS === "android" && insets.bottom < spacing.sm;
    const camera = baseBottom + (needsExtraSpace ? spacing.lg : 0);
    const manual = camera + BUTTON_SIZE + spacing.sm;
    return { rightOffset: right, cameraBottom: camera, manualBottom: manual };
  }, [insets, positioning]);

  const manualDisabled = disabled || manualVisible || loading;

  const handleOpenManual = useCallback(() => {
    if (manualDisabled) return;
    onOpenManual();
  }, [manualDisabled, onOpenManual]);

  return (
    <>
      <Pressable
        style={[
          styles.manualButton,
          {
            right: rightOffset,
            bottom: manualBottom,
            opacity: manualDisabled ? 0.6 : 1,
          },
        ]}
        onPress={handleOpenManual}
        disabled={manualDisabled}
        accessibilityRole="button"
        accessibilityLabel="Adicionar preço manual"
      >
        <Ionicons name="add" size={24} color={colors.textInverse} />
      </Pressable>
      <FloatingActionButton
        onPress={onCapture}
        disabled={disabled}
        loading={loading}
        bottom={cameraBottom}
        right={rightOffset}
      />
    </>
  );
}

const styles = StyleSheet.create({
  manualButton: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
});
