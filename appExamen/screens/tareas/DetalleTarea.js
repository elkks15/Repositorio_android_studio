import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ventana from '../../components/Ventana';
import { useNotas } from '../../context/AppContext';
import { colors } from '../../theme';

export default function DetalleTarea({ route }) {
  const { tareas, hechas, marcarHecha, agregarNota } = useNotas();
  const tarea = tareas.find((item) => item.id === route.params.id);
  const hecha = Boolean(tarea && hechas[tarea.id]);
  const [visible, setVisible] = useState(false);

  if (!tarea) {
    return (
      <View style={styles.fondo}>
        <Text style={styles.cuerpo}>No encontré esa tarea.</Text>
      </View>
    );
  }

  const completar = () => {
    if (!hecha) {
      marcarHecha(tarea.id);
      agregarNota({
        titulo: tarea.titulo,
        cuerpo: `Tarea hecha. ${tarea.detalle}`,
      });
    }
    setVisible(true);
  };

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>{tarea.titulo}</Text>
      <Text style={styles.estado}>{hecha ? 'Hecha' : 'Pendiente'}</Text>
      <Text style={styles.cuerpo}>{tarea.detalle}</Text>
      <Pressable style={styles.boton} onPress={completar}>
        <Text style={styles.botonTexto}>{hecha ? 'Ver confirmación' : 'Marcar como hecha'}</Text>
      </Pressable>
      <Ventana visible={visible} onClose={() => setVisible(false)} titulo="Lista">
        <Text style={styles.cuerpo}>
          {tarea.titulo} quedó hecha y también se guardó en Notas.
        </Text>
      </Ventana>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.bg, padding: 22 },
  titulo: { color: colors.ink, fontSize: 32, fontWeight: '800' },
  estado: { marginTop: 8, color: colors.accent, fontWeight: '700', fontSize: 16 },
  cuerpo: { marginTop: 16, color: colors.ink, fontSize: 16, lineHeight: 24 },
  boton: {
    marginTop: 24,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonTexto: { color: '#fff', fontWeight: '800' },
});
