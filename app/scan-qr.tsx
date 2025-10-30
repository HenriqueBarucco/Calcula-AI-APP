import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { Button } from "../components/Button";
import { useSession } from "../context/SessionContext";

export default function ScanQR() {
  const router = useRouter();
  const { joinSession } = useSession();
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(true);
  const handledRef = useRef(false);

  useEffect(() => {
    // Ask permission on mount if not granted
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission?.granted, requestPermission]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Stack.Screen
        options={{
          presentation: Platform.select({ ios: "modal", default: "card" }),
          headerTitle: "Ler QR",
          headerRight: () => (
            <Button title="Fechar" onPress={() => router.back()} style={{ height: 32 }} />
          ),
        }}
      />

      {!permission?.granted ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: "white", marginBottom: 12, textAlign: "center" }}>
            Precisamos da permissão da câmera para ler o QR code.
          </Text>
          <Button title="Permitir câmera" onPress={requestPermission} />
        </View>
      ) : (
        <CameraView
          style={{ flex: 1 }}
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
