import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import type { ComponentRef } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../context/SessionContext";
import { uploadPriceImage } from "../lib/api";
import { colors, radii, spacing, typography } from "../styles/theme";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

export default function CapturePrice() {
  const { sessionId, setUploading, uploading } = useSession();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<ComponentRef<typeof CameraView> | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [capturing, setCapturing] = useState(false);
  const insets = useSafeAreaInsets();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!permission || permission.status === "undetermined") {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const canCapture = useMemo(
    () => Boolean(sessionId && permission?.granted && !capturing && !uploading),
    [sessionId, permission?.granted, capturing, uploading]
  );

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => {
      const next = Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, prev + delta));
      return next;
    });
  };

  const handleClose = () => {
    router.back();
  };

  const handleCapture = async () => {
    if (!sessionId || !cameraRef.current || capturing || uploading) return;
    const camera: any = cameraRef.current;
    if (!camera?.takePictureAsync) {
      Alert.alert("Erro", "Câmera indisponível no momento.");
      return;
    }
    try {
      setCapturing(true);
      const photo = await camera.takePictureAsync({ quality: 0.8, skipProcessing: true });
      if (!photo?.uri) {
        Alert.alert("Erro", "Não foi possível capturar a imagem.");
        if (isMountedRef.current) setCapturing(false);
        return;
      }
      const filename = photo.uri.split("/").pop() ?? `captura-${Date.now()}.jpg`;
      const mimeType = filename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
      setUploading(true);
      router.back();
      try {
        await uploadPriceImage({
          sessionId,
          fileUri: photo.uri,
          filename,
          mimeType,
          quantity,
        });
      } catch (error: any) {
        Alert.alert("Erro ao enviar imagem", error?.message ?? "Tente novamente.");
      } finally {
        setUploading(false);
      }
    } catch (error: any) {
      Alert.alert("Erro ao enviar imagem", error?.message ?? "Tente novamente.");
    } finally {
      if (isMountedRef.current) setCapturing(false);
    }
  };

  const renderCameraOverlay = () => (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.frame} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          presentation: "modal",
          headerTransparent: true,
          headerTintColor: "#fff",
          headerTitle: "Capturar preço",
          headerTitleStyle: { color: "#fff" },
          headerRight: () => (
            <Pressable onPress={handleClose} style={styles.closeButton} accessibilityLabel="Fechar câmera">
              <Ionicons name="close" size={26} color="#fff" />
            </Pressable>
          ),
        }}
      />

      {!permission?.granted ? (
        <SafeAreaView style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Precisamos da permissão da câmera para capturar os preços.</Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Permitir câmera</Text>
          </Pressable>
        </SafeAreaView>
      ) : (
        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            mode="picture"
            animateShutter
          />
          {renderCameraOverlay()}
          <SafeAreaView style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
            edges={["bottom"]}
          >
            <View style={styles.quantitySelector}>
              <Pressable
                style={[styles.adjustButton, quantity <= MIN_QUANTITY && styles.adjustDisabled]}
                onPress={() => adjustQuantity(-1)}
                disabled={quantity <= MIN_QUANTITY || capturing || uploading}
                accessibilityLabel="Diminuir quantidade"
              >
                <Ionicons name="remove" size={20} color="#fff" />
              </Pressable>
              <View style={styles.quantityLabelWrapper}>
                <Text style={styles.quantityLabel}>Quantidade</Text>
                <Text style={styles.quantityValue}>{quantity}</Text>
              </View>
              <Pressable
                style={[styles.adjustButton, quantity >= MAX_QUANTITY && styles.adjustDisabled]}
                onPress={() => adjustQuantity(1)}
                disabled={quantity >= MAX_QUANTITY || capturing || uploading}
                accessibilityLabel="Aumentar quantidade"
              >
                <Ionicons name="add" size={20} color="#fff" />
              </Pressable>
            </View>
            <Pressable
              style={[styles.captureButton, !canCapture && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={!canCapture}
              accessibilityRole="button"
              accessibilityLabel="Capturar foto"
            >
              {capturing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </Pressable>
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cameraBackground,
  },
  closeButton: {
    padding: spacing.xs,
  },
  cameraWrapper: {
    flex: 1,
    backgroundColor: colors.cameraBackground,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: "80%",
    height: "45%",
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: radii.lg,
  },
  instruction: {
    position: "absolute",
    bottom: "22%",
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    gap: spacing.lg,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  adjustDisabled: {
    opacity: 0.4,
  },
  quantityLabelWrapper: {
    alignItems: "center",
    minWidth: 72,
  },
  quantityLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: typography.label,
  },
  quantityValue: {
    color: colors.textInverse,
    fontSize: 24,
    fontWeight: "700",
  },
  captureButton: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: radii.full,
    backgroundColor: colors.textInverse,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.cameraBackground,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  permissionText: {
    color: colors.textInverse,
    textAlign: "center",
    fontSize: typography.body,
  },
  permissionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  permissionButtonText: {
    color: colors.textInverse,
    fontWeight: "600",
  },
});
