import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ventana from '../components/Ventana';
import { useMandado } from '../context/AppContext';
import { colors } from '../theme';

export default function PerfilScreen() {
  const { nombre, setNombre } = useMandado();
  const [borrador, setBorrador] = useState(nombre);
  const [visible, setVisible] = useState(false);

  const guardar = () => {
    const limpio = borrador.trim();
    if (!limpio) return;
    setNombre(limpio);
    setVisible(true);
  };

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>¿De quién es el mandado?</Text>
      <Text style={styles.ayuda}>El nombre sale arriba de la lista, por si van varios.</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        placeholderTextColor={colors.muted}
        value={borrador}
        onChangeText={setBorrador}
      />
      <Pressable style={styles.boton} onPress={guardar}>
        <Text style={styles.botonTexto}>Usar este nombre</Text>
      </Pressable>
      <Ventana visible={visible} onClose={() => setVisible(false)} titulo="Listo">
        <Text style={styles.ayuda}>La lista ya dice que es el mandado de {nombre}.</Text>
      </Ventana>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.bg, padding: 22 },
  titulo: { color: colors.ink, fontSize: 30, fontWeight: '800' },
  ayuda: { marginTop: 8, color: colors.muted, fontSize: 16, lineHeight: 22 },
  input: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    color: colors.ink,
  },
  boton: {
    marginTop: 14,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonTexto: { color: '#fff', fontWeight: '800' },
});
