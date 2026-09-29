import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function Ficha({ titulo, meta, children, onPress }) {
  const cuerpo = (
    <View style={styles.ficha}>
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 12,
  },
  titulo: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    color: colors.sea,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.86,
  },
});
