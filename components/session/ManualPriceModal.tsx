import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing, typography } from "../../styles/theme";
import type { ManualFormValues } from "../../types/manualPrice";

type ManualPriceModalProps = {
  visible: boolean;
  loading: boolean;
  values: ManualFormValues;
  onChange: (field: keyof ManualFormValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function ManualPriceModal({ visible, loading, values, onChange, onClose, onSubmit }: ManualPriceModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.overlay} onPress={onClose} disabled={loading} accessible={false} />
        <View style={styles.container}>
          <Text style={styles.title}>Adicionar preço manual</Text>
          <TextInput
            placeholder="Nome"
            style={styles.input}
            value={values.name}
            onChangeText={(text) => onChange("name", text)}
            editable={!loading}
            autoCapitalize="sentences"
            autoCorrect
          />
          <View style={styles.row}>
            <TextInput
              placeholder="Quantidade"
              keyboardType="number-pad"
              style={[styles.input, styles.half]}
              value={values.quantity}
              onChangeText={(text) => onChange("quantity", text)}
              editable={!loading}
            />
            <TextInput
              placeholder="Valor"
              keyboardType="decimal-pad"
              style={[styles.input, styles.half]}
              value={values.value}
              onChangeText={(text) => onChange("value", text)}
              editable={!loading}
            />
          </View>
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton, loading && styles.disabledButton]}
              onPress={onClose}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Cancelar adição manual"
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton, loading && styles.disabledButton]}
              onPress={onSubmit}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Confirmar adição manual"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Adicionar</Text>}
            </Pressable>
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
    maxWidth: 400,
    borderRadius: radii.xl,
    backgroundColor: colors.background,
    padding: spacing.md + spacing.xs,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: "600",
    color: colors.text,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  button: {
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: colors.surfaceMuted,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelText: {
    color: colors.text,
    fontWeight: "600",
  },
  confirmText: {
    color: colors.textInverse,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
