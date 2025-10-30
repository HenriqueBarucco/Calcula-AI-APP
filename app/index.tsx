import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraActions } from "../components/session/CameraActions";
import { ManualPriceModal } from "../components/session/ManualPriceModal";
import { PriceList } from "../components/session/PriceList";
import { SessionSummary } from "../components/session/SessionSummary";
import { useSession } from "../context/SessionContext";
import { useSessionPolling } from "../hooks/useSessionPolling";
import type { Price } from "../lib/api";
import { createPrice, deletePrice } from "../lib/api";
import { colors, radii, spacing, typography } from "../styles/theme";
import { manualInitialState, type ManualFormValues } from "../types/manualPrice";
import { parseCurrency, parseQuantity } from "../utils/parsing";

export default function Index() {
  const navigation = useNavigation<any>();
  const router = useRouter();
  const { sessionId, ensureSession, loading: sessionLoading, error: sessionError, uploading } = useSession();
  const { data, setData, error: pollingError, loading: pollingLoading, refresh, clearError } = useSessionPolling(sessionId);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [manualVisible, setManualVisible] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualForm, setManualForm] = useState<ManualFormValues>(manualInitialState);

  useEffect(() => {
    void ensureSession();
  }, [ensureSession]);

  const isLoading = sessionLoading || pollingLoading;
  const combinedError = sessionError ?? pollingError;
  const prices = data?.prices ?? [];
  const total = data?.total ?? 0;

  useFocusEffect(
    useCallback(() => {
      if (!sessionId) return;
      void refresh();
    }, [sessionId, refresh])
  );

  const setManualField = useCallback((field: keyof ManualFormValues, value: string) => {
    setManualForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetManualForm = useCallback(() => {
    setManualForm(manualInitialState);
  }, []);

  const closeManualModal = useCallback((force = false) => {
    if (manualLoading && !force) return;
    setManualVisible(false);
    resetManualForm();
  }, [manualLoading, resetManualForm]);

  const openManualModal = useCallback(() => {
    if (!sessionId) return;
    setManualVisible(true);
  }, [sessionId]);

  const handleCapture = useCallback(async () => {
    if (!sessionId) return;
    clearError();
    router.push("/capture" as never);
  }, [sessionId, clearError, router]);

  const handleManualSubmit = useCallback(async () => {
    try {
      if (!sessionId || manualLoading) return;

      const quantity = parseQuantity(manualForm.quantity);
      if (!quantity) {
        Alert.alert("Quantidade inválida", "Informe uma quantidade inteira maior que zero.");
        return;
      }

      const value = parseCurrency(manualForm.value);
      if (!value) {
        Alert.alert("Valor inválido", "Informe um valor maior que zero.");
        return;
      }

      const name = manualForm.name.trim();
      if (!name) {
        Alert.alert("Nome inválido", "Informe uma descrição para o item.");
        return;
      }

      clearError();
      setManualLoading(true);
      const updated = await createPrice({ sessionId, quantity, name, value });
      setData(updated);
      closeManualModal(true);
    } catch (error: any) {
      Alert.alert("Erro ao adicionar preço", error?.message ?? "Tente novamente.");
    } finally {
      setManualLoading(false);
    }
  }, [sessionId, manualLoading, manualForm, setData, closeManualModal, clearError]);

  const handleDeletePrice = useCallback(async (price: Price) => {
    if (!sessionId) return;
    try {
      clearError();
      setDeletingId(price.id);
      setData((prev) => (prev ? { ...prev, prices: prev.prices.filter((item) => item.id !== price.id) } : prev));
      await deletePrice({ sessionId, priceId: price.id });
      await refresh();
    } catch (error: any) {
      Alert.alert("Erro ao excluir preço", error?.message ?? "Tente novamente.");
      await refresh();
    } finally {
      setDeletingId(null);
    }
  }, [sessionId, refresh, setData, clearError]);

  const openSessionControls = useCallback(() => {
    navigation.navigate("session-controls" as never);
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={openSessionControls} style={styles.headerButton} accessibilityLabel="Abrir controles de sessão">
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </Pressable>
      ),
    });
  }, [navigation, openSessionControls]);

  const listDisabled = useMemo(() => deletingId !== null, [deletingId]);

  const previousUploadingRef = useRef(uploading);

  useEffect(() => {
    if (previousUploadingRef.current && !uploading) {
      void refresh();
    }
    previousUploadingRef.current = uploading;
  }, [uploading, refresh]);

  return (
    <SafeAreaView style={styles.container}>
      {combinedError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{combinedError}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <SessionSummary total={total} />
          <PriceList prices={prices} disabled={listDisabled} onDelete={handleDeletePrice} />
        </View>
      )}

      <CameraActions
        disabled={!sessionId}
        loading={uploading}
        manualVisible={manualVisible}
        onCapture={handleCapture}
        onOpenManual={openManualModal}
      />

      <ManualPriceModal
        visible={manualVisible}
        loading={manualLoading}
        values={manualForm}
        onChange={setManualField}
        onClose={closeManualModal}
        onSubmit={handleManualSubmit}
      />

      {uploading ? (
        <View pointerEvents="none" style={styles.toast}>
          <Text style={styles.toastText}>Enviando imagem...</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    padding: spacing.md,
  },
  errorText: {
    color: colors.error,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  headerButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  toast: {
    position: "absolute",
    alignSelf: "center",
    bottom: spacing.xl,
    borderRadius: radii.md,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
    minWidth: 0,
  },
  toastText: {
    color: colors.textInverse,
    fontWeight: "600",
    fontSize: typography.label,
  },
});

