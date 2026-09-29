import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNotas } from '../context/AppContext';
import { colors } from '../theme';

export default function HomeScreen({ navigation }) {
  const { nombre, notas, tareas, hechas } = useNotas();
  const quien = nombre.trim() || 'Hola';
  const pendientes = tareas.filter((tarea) => !hechas[tarea.id]).length;

  return (
    <ScrollView style={styles.fondo} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>{quien}</Text>
      <Text style={styles.texto}>
        Notas y tareas de esta sesión. Al cerrar la app se borran.
      </Text>

      <View style={styles.fila}>
        <View style={styles.caja}>
          <Text style={styles.numero}>{notas.length}</Text>
          <Text style={styles.etiqueta}>Notas</Text>
        </View>
        <View style={styles.caja}>
          <Text style={styles.numero}>{pendientes}</Text>
          <Text style={styles.etiqueta}>Tareas</Text>
        </View>
      </View>

      <Pressable style={styles.boton} onPress={() => navigation.navigate('Notas')}>
        <Text style={styles.botonTexto}>Ver notas</Text>
      </Pressable>
      <Pressable style={styles.botonSuave} onPress={() => navigation.navigate('Tareas')}>
        <Text style={styles.botonSuaveTexto}>Ver tareas</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.bg },
  contenido: { padding: 22, paddingBottom: 36 },
  titulo: { color: colors.ink, fontSize: 34, fontWeight: '800' },
  texto: { marginTop: 8, color: colors.muted, fontSize: 16, lineHeight: 22 },
  fila: { flexDirection: 'row', gap: 12, marginTop: 22 },
  caja: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
  },
  numero: { color: colors.accent, fontSize: 32, fontWeight: '800' },
  etiqueta: { marginTop: 4, color: colors.muted, fontWeight: '600' },
  boton: {
    marginTop: 20,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonTexto: { color: '#fff', fontWeight: '800' },
  botonSuave: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  botonSuaveTexto: { color: colors.ink, fontWeight: '700' },
});
