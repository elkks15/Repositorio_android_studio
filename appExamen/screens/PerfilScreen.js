import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ventana from '../components/Ventana';
import { useNotas } from '../context/AppContext';
import { colors } from '../theme';

export default function PerfilScreen() {
  const { nombre, setNombre } = useNotas();
  const [borrador, setBorrador] = useState(nombre);
  const [visible, setVisible] = useState(false);

  const guardar = () => {
    if (!borrador.trim()) return;
    setNombre(borrador.trim());
    setVisible(true);
  };

  return (
    <View style={styles.fondo}>
      <Text style={styles.titulo}>Perfil</Text>
      <Text style={styles.ayuda}>El nombre aparece en el inicio.</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        value={borrador}
        onChangeText={setBorrador}
      />
      <Pressable style={styles.boton} onPress={guardar}>
        <Text style={styles.botonTexto}>Usar este nombre</Text>
      </Pressable>
      <Ventana visible={visible} onClose={() => setVisible(false)} titulo="Listo">
        <Text style={styles.ayuda}>El inicio ya saluda a {nombre}.</Text>
      </Ventana>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 22,
  },
  titulo: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '800',
  },
  ayuda: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 21,
    fontSize: 16,
  },
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
  botonTexto: {
    color: '#fff',
    fontWeight: '800',
  },
});
