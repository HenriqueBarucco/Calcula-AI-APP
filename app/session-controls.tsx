import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, Share, Text, View } from "react-native";
import QRCodeSVG from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { useSession } from "../context/SessionContext";

export default function SessionControls() {
  const { sessionId, ensureSession, resetSession } = useSession();
  const router = useRouter();

  const qrValue = useMemo(() => sessionId ?? "", [sessionId]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerBackTitle: "Voltar" }} />

      <View style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Controles de Sessão</Text>
        <Text numberOfLines={1}>ID atual: {sessionId ?? "(nenhuma)"}</Text>

        <Button
          title="Criar nova sessão"
          onPress={async () => {
            try {
              resetSession();
              await ensureSession();
            } catch (e: any) {
              Alert.alert("Erro", e?.message ?? "Falha ao criar nova sessão");
            }
          }}
        />

        <View style={{ height: 12 }} />

        {sessionId ? (
          <View style={{ alignItems: "center", gap: 8 }}>
            <Text>Compartilhar sessão:</Text>
            <View style={{ backgroundColor: "white", padding: 12, borderRadius: 12 }}>
              <QRCodeSVG value={qrValue || ""} size={180} />
            </View>
              <Ionicons name="share-outline" size={24} color="#000" onPress={async () => { await Share.share({ message: qrValue }); }} />
          </View>
        ) : null}

        <View style={{ height: 12 }} />

        <Button
          title="Ler QR de outra sessão"
          onPress={() => router.push("scan-qr" as any)}
        />
      </View>
    </SafeAreaView>
  );
}
