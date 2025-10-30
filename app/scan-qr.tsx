import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { useSession } from "../context/SessionContext";
import { colors, spacing, typography } from "../styles/theme";

export default function ScanQR() {
  const router = useRouter();
  const { joinSession } = useSession();
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(true);
  const handledRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission?.granted, requestPermission]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          presentation: Platform.select({ ios: "modal", default: "card" }),
          headerTitle: "Ler QR",
          headerRight: () => (
            <Button title="Fechar" onPress={() => router.back()} style={styles.closeButton} />
          ),
        }}
      />

      {!permission?.granted ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Precisamos da permissão da câmera para ler o QR code.
          </Text>
          <Button title="Permitir câmera" onPress={requestPermission} />
        </View>
      ) : (
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={(result: any) => {
            if (!active || handledRef.current) return;
            const data = result?.data as string | undefined;
            if (!data) return;
            handledRef.current = true;
            setActive(false);
            joinSession(String(data));
            Alert.alert("Sessão definida", String(data));
            router.back();
          }}
        />
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
    height: 36,
    minWidth: undefined,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  permissionText: {
    color: colors.textInverse,
    marginBottom: spacing.xs,
    textAlign: "center",
    fontSize: typography.body,
  },
  camera: {
    flex: 1,
  },
});
