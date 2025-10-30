import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { Price } from "../../lib/api";
import { colors, radii, spacing, typography } from "../../styles/theme";

type PricePhotoModalProps = {
  visible: boolean;
  loading: boolean;
  uri: string | null;
  price: Price | null;
  onClose: () => void;
};

export function PricePhotoModal({ visible, loading, uri, price, onClose }: PricePhotoModalProps) {
  const title = price?.name ? price.name : "Foto do item";
  const subtitle = price ? `Quantidade x${price.quantity}` : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.overlay} onPress={onClose} disabled={loading} accessible={false} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          <View style={styles.previewWrapper}>
            {loading ? (
              <ActivityIndicator size="large" />
            ) : uri ? (
              <Image source={{ uri }} style={styles.image} contentFit="contain" accessibilityLabel="Foto do preço" />
            ) : (
              <Text style={styles.placeholder}>Não foi possível carregar a foto.</Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.modalBackdrop,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    borderRadius: radii.xl,
    backgroundColor: colors.background,
    padding: spacing.md + spacing.xs,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.label,
    color: colors.textSecondary,
  },
  previewWrapper: {
    height: 260,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  actions: {
    alignItems: "flex-end",
  },
  button: {
    minWidth: 96,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  buttonText: {
    color: colors.textInverse,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
