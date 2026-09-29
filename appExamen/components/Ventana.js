import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function Ventana({ visible, onClose, titulo, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.fondo}>
        <View style={styles.hoja}>
          <Text style={styles.titulo}>{titulo}</Text>
          {children}
          <Pressable style={styles.cerrar} onPress={onClose}>
            <Text style={styles.cerrarTexto}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 21, 0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  hoja: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.bgSoft,
    borderRadius: 22,
    padding: 22,
  },
  titulo: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  cerrar: {
    marginTop: 16,
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cerrarTexto: {
    color: '#fff',
    fontWeight: '700',
  },
});
