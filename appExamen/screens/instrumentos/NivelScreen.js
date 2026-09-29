import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { useNotas } from '../../context/AppContext';
import { limitar, useSensor } from '../../lib/sensores';
import { colors } from '../../theme';

export default function NivelScreen() {
  const { avisoNivel } = useNotas();
  const [punto, setPunto] = useState({ x: 0, y: 0 });
  const disponible = useSensor(Accelerometer, ({ x, y }) => setPunto({ x, y }));

  const nivelado = Math.hypot(punto.x, punto.y) < 0.12;
  const left = `${50 + limitar(punto.x, -1, 1) * 34}%`;
  const top = `${50 + limitar(-punto.y, -1, 1) * 34}%`;

  return (
    <View style={styles.fondo}>
      <Text style={styles.kicker}>Acelerómetro</Text>
      <Text style={styles.titulo}>{nivelado ? 'Está nivelado' : 'Inclínalo para centrar'}</Text>
      {disponible ? (
        <View style={styles.platillo}>
          <View style={[styles.burbuja, { left, top }]} />
        </View>
      ) : (
        <Text style={styles.aviso}>Este aparato no trae acelerómetro.</Text>
      )}
      {avisoNivel && nivelado && disponible ? (
        <Text style={styles.listo}>Listo.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  kicker: {
    color: colors.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: 12,
  },
  titulo: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  platillo: {
    marginTop: 28,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: colors.accent,
    backgroundColor: colors.card,
  },
  burbuja: {
    position: 'absolute',
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    borderRadius: 18,
    backgroundColor: colors.accent,
  },
  aviso: {
    marginTop: 24,
    color: colors.muted,
    textAlign: 'center',
  },
  listo: {
    marginTop: 18,
    color: colors.accent,
    fontWeight: '700',
  },
});
