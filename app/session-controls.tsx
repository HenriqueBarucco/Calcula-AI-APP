import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, Share, StyleSheet, Text, View } from "react-native";
import QRCodeSVG from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { useSession } from "../context/SessionContext";
import { colors, radii, shadows, spacing, typography } from "../styles/theme";

export default function SessionControls() {
  const { sessionId, ensureSession, resetSession } = useSession();
  const router = useRouter();

  const qrValue = useMemo(() => sessionId ?? "", [sessionId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerBackTitle: "Voltar" }} />

      <View style={styles.content}>
        <Text style={styles.title}>Controles de Sessão</Text>
        <Text numberOfLines={1} style={styles.sessionInfo}>ID atual: {sessionId ?? "(nenhuma)"}</Text>

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

        <View style={styles.spacer} />

        {sessionId ? (
          <View style={styles.shareCard}>
            <Text style={styles.shareLabel}>Compartilhar sessão:</Text>
            <View style={styles.qrWrapper}>
              <QRCodeSVG value={qrValue || ""} size={180} />
            </View>
            <Ionicons
              name="share-outline"
              size={24}
              color={colors.text}
              onPress={async () => {
                await Share.share({ message: qrValue });
              }}
            />
          </View>
        ) : null}

        <View style={styles.spacer} />

        <Button
          title="Ler QR de outra sessão"
          onPress={() => router.push("scan-qr" as any)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: "600",
    color: colors.text,
  },
  sessionInfo: {
    color: colors.textSecondary,
  },
  spacer: {
    height: spacing.sm,
  },
  shareCard: {
    alignItems: "center",
    gap: spacing.xs,
  },
  shareLabel: {
    color: colors.text,
  },
  qrWrapper: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radii.lg,
    ...shadows.light,
  },
});
