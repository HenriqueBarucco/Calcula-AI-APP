import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { PriceItem } from "../components/PriceItem";
import { useSession } from "../context/SessionContext";
import { SessionDetails, deletePrice, getSession, uploadPriceImage } from "../lib/api";
import { formatBRL } from "../utils/currency";

export default function Index() {
  const { sessionId, ensureSession, loading: sessionLoading, error: sessionError } = useSession();
  const [data, setData] = useState<SessionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    void ensureSession();
  }, [ensureSession]);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const load = async () => {
      try {
        const d = await getSession(sessionId);
        if (!cancelled) setData(d);
        setError(null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Erro ao carregar sessão");
      }
    };

    void load();
    timerRef.current = setInterval(load, 3000);

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId]);

  const isLoading = sessionLoading || (!data && !sessionError);

  const takePhotoAndUpload = async () => {
    try {
      if (!sessionId) return;

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permissão da câmera", "Permissão da câmera negada");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) {
        Alert.alert("Erro", "Falha ao capturar imagem");
        return;
      }

      setUploading(true);
      await uploadPriceImage({
        sessionId,
        fileUri: asset.uri,
        filename: asset.fileName ?? "photo.jpg",
        mimeType: asset.mimeType ?? "image/jpeg",
        quantity: 1,
      });
      const d = await getSession(sessionId);
      setData(d);
    } catch (e: any) {
      Alert.alert("Erro ao enviar imagem", e?.message ?? "Tente novamente mais tarde.");
    } finally {
      setUploading(false);
    }
  };

  // Add headerRight button to open session controls
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("session-controls" as never)}
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          accessibilityLabel="Abrir controles de sessão"
        >
          <Text style={{ fontWeight: "600" }}><Ionicons name="settings-outline" size={24} color="#000" /></Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {sessionError ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: "red" }}>{sessionError}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Carregando dados...</Text>
        </View>
      ) : error ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <Text style={{ fontSize: 16 }}>Total: {data ? formatBRL(data.total) : "R$ 0,00"}</Text>
          </View>
          <FlatList
            data={data?.prices ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 120 }}
            renderItem={({ item }) => (
              <PriceItem
                item={item}
                disabled={deletingId !== null || uploading}
                onDelete={async (price) => {
                  if (!sessionId) return;
                  try {
                    setDeletingId(price.id);
                    // Optimistic UI: remove locally
                    setData((prev) =>
                      prev ? { ...prev, prices: prev.prices.filter((p) => p.id !== price.id) } : prev
                    );
                    await deletePrice({ sessionId, priceId: price.id });
                    // Refresh total and prices from server to ensure consistency
                    const d = await getSession(sessionId);
                    setData(d);
                  } catch (e: any) {
                    Alert.alert("Erro ao excluir preço", e?.message ?? "Tente novamente.");
                    // reload to rollback optimistic update
                    if (sessionId) {
                      const d = await getSession(sessionId);
                      setData(d);
                    }
                  } finally {
                    setDeletingId(null);
                  }
                }}
              />
            )}
            ListEmptyComponent={
              <View style={{ padding: 16 }}>
                <Text>Sem preços no momento.</Text>
              </View>
            }
          />
        </View>
      )}

      <FloatingActionButton onPress={takePhotoAndUpload} disabled={!sessionId} loading={uploading} />
    </SafeAreaView>
  );
}

