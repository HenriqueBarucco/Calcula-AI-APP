import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraActions } from "../components/session/CameraActions";
import { ManualPriceModal } from "../components/session/ManualPriceModal";
import { PriceList } from "../components/session/PriceList";
import { PricePhotoModal } from "../components/session/PricePhotoModal";
import { SessionSummary } from "../components/session/SessionSummary";
import { useSession } from "../context/SessionContext";
import { useSessionPolling } from "../hooks/useSessionPolling";
import type { Price } from "../lib/api";
import { createPrice, deletePrice, getPricePhoto, updatePrice } from "../lib/api";
import { colors, radii, spacing, typography } from "../styles/theme";
import { manualInitialState, type ManualFormValues } from "../types/manualPrice";
import { parseCurrency, parseQuantity } from "../utils/parsing";

const ACTION_BUTTON_SIZE = 56;

export default function Index() {
  const navigation = useNavigation<any>();
  const router = useRouter();
  const { sessionId, ensureSession, loading: sessionLoading, error: sessionError, uploading } = useSession();
  const { data, setData, error: pollingError, loading: pollingLoading, refresh, clearError } = useSessionPolling(sessionId);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [manualVisible, setManualVisible] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualForm, setManualForm] = useState<ManualFormValues>(manualInitialState);
  const [manualMode, setManualMode] = useState<"create" | "edit">("create");
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

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
    setManualMode("create");
    setEditingPrice(null);
    resetManualForm();
  }, [manualLoading, resetManualForm, setManualMode, setEditingPrice, setManualVisible]);

  const openManualModal = useCallback(() => {
    if (!sessionId) return;
    clearError();
    setManualMode("create");
    setEditingPrice(null);
    resetManualForm();
    setManualVisible(true);
  }, [sessionId, clearError, resetManualForm, setManualMode, setEditingPrice, setManualVisible]);

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

      if (manualMode === "edit" && !editingPrice) {
        Alert.alert("Não foi possível editar", "Selecione o item novamente e tente outra vez.");
        return;
      }

      clearError();
      setManualLoading(true);

      const updated =
        manualMode === "edit" && editingPrice
          ? await updatePrice({ sessionId, priceId: editingPrice.id, quantity, name, value })
          : await createPrice({ sessionId, quantity, name, value });
      setData(updated);
      closeManualModal(true);
    } catch (error: any) {
      const title = manualMode === "edit" ? "Erro ao salvar preço" : "Erro ao adicionar preço";
      Alert.alert(title, error?.message ?? "Tente novamente.");
    } finally {
      setManualLoading(false);
    }
  }, [sessionId, manualLoading, manualForm, manualMode, editingPrice, setData, closeManualModal, clearError]);

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
  const photoRequestIdRef = useRef(0);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const actionPositioning = useMemo(() => {
    const right = Math.max(insets.right, spacing.lg);
    const baseBottom = spacing.lg + insets.bottom;
    const needsExtraSpace = Platform.OS === "android" && insets.bottom < spacing.sm;
    const cameraBottom = baseBottom + (needsExtraSpace ? spacing.lg : 0);
  const manualBottom = cameraBottom + ACTION_BUTTON_SIZE + spacing.sm;
  const listPaddingBottom = manualBottom + ACTION_BUTTON_SIZE + spacing.md;
    return { right, cameraBottom, manualBottom, listPaddingBottom };
  }, [insets.bottom, insets.right]);

  const contentPaddingTop = useMemo(() => {
    if (insets.top > 0) {
      return Math.max(insets.top * 0.4, spacing.md);
    }
    return spacing.lg;
  }, [insets.top]);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2500);
  }, []);

  const closePhotoModal = useCallback(() => {
    photoRequestIdRef.current += 1;
    setPhotoModalVisible(false);
    setPhotoLoading(false);
    setPhotoUri(null);
    setSelectedPrice(null);
  }, []);

  const handleOpenPricePhoto = useCallback(async (price: Price) => {
    if (!sessionId) return;

    const requestId = photoRequestIdRef.current + 1;
    photoRequestIdRef.current = requestId;
    setSelectedPrice(price);
    setPhotoUri(null);
    setPhotoModalVisible(false);
    setPhotoLoading(true);

    try {
      const photo = await getPricePhoto({ sessionId, priceId: price.id });
      if (photoRequestIdRef.current !== requestId) return;

      if (!photo) {
        setSelectedPrice(null);
        setPhotoModalVisible(false);
        showToast("Não há foto disponível para este item.");
        return;
      }

      setPhotoUri(photo.uri);
      setPhotoModalVisible(true);
    } catch (error: any) {
      if (photoRequestIdRef.current !== requestId) return;
      setSelectedPrice(null);
      setPhotoModalVisible(false);
      Alert.alert("Erro ao carregar foto", error?.message ?? "Tente novamente.");
    } finally {
      if (photoRequestIdRef.current === requestId) {
        setPhotoLoading(false);
      }
    }
  }, [sessionId, showToast]);

  const handleOpenEditPrice = useCallback(
    (price: Price) => {
      if (!sessionId) return;
      clearError();
      setManualMode("edit");
      setEditingPrice(price);
      setManualForm({
        name: price.name ?? "",
        quantity: String(price.quantity ?? 1),
        value: price.value != null ? String(price.value).replace(".", ",") : "",
      });
      setManualVisible(true);
    },
    [sessionId, clearError, setManualMode, setEditingPrice, setManualForm, setManualVisible]
  );

  const toastItems = useMemo(() => {
    const items: { key: string; text: string }[] = [];
    if (uploading) {
      items.push({ key: "uploading", text: "Enviando imagem..." });
    }
    if (toastMessage) {
      items.push({ key: "message", text: toastMessage });
    }
    return items;
  }, [uploading, toastMessage]);

  useEffect(() => {
    if (previousUploadingRef.current && !uploading) {
      void refresh();
    }
    previousUploadingRef.current = uploading;
  }, [uploading, refresh]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
  <View style={[styles.content, { paddingTop: contentPaddingTop }]}>
          <SessionSummary total={total} />
          <PriceList
            prices={prices}
            disabled={listDisabled}
            onDelete={handleDeletePrice}
            onSelect={handleOpenPricePhoto}
            onEdit={handleOpenEditPrice}
            loadingPriceId={photoLoading && selectedPrice ? selectedPrice.id : null}
            contentBottomPadding={actionPositioning.listPaddingBottom}
          />
        </View>
      )}

      <CameraActions
        disabled={!sessionId}
        loading={uploading}
        manualVisible={manualVisible}
        onCapture={handleCapture}
        onOpenManual={openManualModal}
        positioning={actionPositioning}
      />

      <ManualPriceModal
        visible={manualVisible}
        loading={manualLoading}
        values={manualForm}
        onChange={setManualField}
        onClose={closeManualModal}
        onSubmit={handleManualSubmit}
        title={manualMode === "edit" ? "Editar preço" : undefined}
        confirmLabel={manualMode === "edit" ? "Salvar" : undefined}
        confirmAccessibilityLabel={manualMode === "edit" ? "Salvar alterações do preço" : undefined}
      />

      <PricePhotoModal
        visible={photoModalVisible}
        loading={photoLoading}
        uri={photoUri}
        price={selectedPrice}
        onClose={closePhotoModal}
      />

      {toastItems.length ? (
        <View
          pointerEvents="none"
          style={[styles.toastContainer, { bottom: actionPositioning.cameraBottom + spacing.sm }]}
        >
          {toastItems.map((item) => (
            <View key={item.key} style={styles.toast}>
              <Text style={styles.toastText}>{item.text}</Text>
            </View>
          ))}
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
  toastContainer: {
    position: "absolute",
    bottom: spacing.xl,
    alignSelf: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  toast: {
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

