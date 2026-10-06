import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function Ficha({ titulo, meta, activo, children, onPress }) {
  const cuerpo = (
    <View style={[styles.ficha, activo && styles.activa]}>
      <Text style={styles.titulo}>{titulo}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {children}
    </View>
  );

  if (!onPress) return cuerpo;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {cuerpo}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ficha: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 10,
  },
  activa: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  titulo: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.86,
  },
});
